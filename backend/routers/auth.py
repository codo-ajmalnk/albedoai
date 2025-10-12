"""
Authentication endpoints for user login and token management.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import bcrypt

from backend.models import User
from backend.schemas import LoginRequest, TokenResponse, UserResponse, CurrentUser
from backend.database import SessionLocal
from backend.settings import get_settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()
settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """
    Dependency to get the current authenticated user from JWT token.
    Use this to protect endpoints that require authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.jwt_secret_key,
                             algorithms=[settings.jwt_algorithm])
        user_id_str: str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception

        # Convert user_id from string to int
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Get user from database
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise credentials_exception

        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )

        return CurrentUser(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            status=user.status
        )


def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """
    Dependency to require admin role.
    Use this to protect admin-only endpoints.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """
    Authenticate user with username and password.
    Returns JWT access token on success.
    """
    with SessionLocal() as db:
        # Find user by username
        user = db.query(User).filter(User.username == payload.username).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )

        # Verify password
        if not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )

        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )

        # Create access token
        # Note: "sub" must be a string per JWT spec
        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username,
                  "role": user.role}
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )


@router.get("/me", response_model=CurrentUser)
def get_current_user_info(current_user: CurrentUser = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Requires valid JWT token.
    """
    return current_user


@router.post("/logout")
def logout():
    """
    Logout endpoint.
    JWT tokens are stateless, so client should discard the token.
    """
    return {"message": "Logged out successfully"}
