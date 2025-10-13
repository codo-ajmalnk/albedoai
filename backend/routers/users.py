"""
User management endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from typing import List
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
import bcrypt
from backend.models import Base, User, UserNotificationSettings
from backend.schemas import UserCreate, UserResponse, UserUpdate, CurrentUser
from backend.database import SessionLocal, engine
from backend.email_utils import send_user_creation_email, send_user_creation_notification_email
from backend.routers.notifications import create_notification


router = APIRouter(prefix="/api/users", tags=["Users"])


def notify_admins_about_user_creation_background(user_id: int):
    """Background task to notify all admin users about a new user creation."""
    with SessionLocal() as db:
        # Get the user
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            print(f"[DEBUG] User {user_id} not found")
            return

        # Get all admin users except the one being created
        admin_users = db.query(User).filter(
            User.role == "admin",
            User.status == "active",
            User.id != user.id
        ).all()

        for admin_user in admin_users:
            # Check user's notification settings
            settings = db.query(UserNotificationSettings).filter(
                UserNotificationSettings.user_id == admin_user.id
            ).first()

            # Create default settings if they don't exist
            if not settings:
                try:
                    settings = UserNotificationSettings(
                        user_id=admin_user.id,
                        email_support_requests=True,
                        email_user_created=True,
                        system_support_requests=True,
                        system_user_created=True,
                        browser_support_requests=True,
                        browser_user_created=True
                    )
                    db.add(settings)
                    db.commit()
                except Exception as create_error:
                    # If browser columns don't exist, create without them
                    if "browser_support_requests" in str(create_error) or "browser_user_created" in str(create_error):
                        from sqlalchemy import text
                        db.execute(text("""
                            INSERT INTO user_notification_settings 
                            (user_id, email_support_requests, email_user_created, 
                             system_support_requests, system_user_created, created_at, updated_at)
                            VALUES (:user_id, :email_support_requests, :email_user_created, 
                                    :system_support_requests, :system_user_created, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE
                            email_support_requests = VALUES(email_support_requests),
                            email_user_created = VALUES(email_user_created),
                            system_support_requests = VALUES(system_support_requests),
                            system_user_created = VALUES(system_user_created),
                            updated_at = NOW()
                        """), {
                            "user_id": admin_user.id,
                            "email_support_requests": True,
                            "email_user_created": True,
                            "system_support_requests": True,
                            "system_user_created": True
                        })
                        db.commit()

                        # Get the created settings
                        settings = db.query(UserNotificationSettings).filter(
                            UserNotificationSettings.user_id == admin_user.id
                        ).first()
                    else:
                        raise create_error

            # Create system notification if enabled
            if settings.system_user_created:
                print(
                    f"[DEBUG] Creating notification for admin user {admin_user.id} about new user {user.id}")
                create_notification(
                    user_id=admin_user.id,
                    notification_type="user_created",
                    title="New User Created",
                    message=f"New user '{user.username}' ({user.email}) has been created with role: {user.role}",
                    notification_data={
                        "user_id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role
                    },
                    db=db
                )
                print(
                    f"[DEBUG] User creation notification created successfully for admin user {admin_user.id}")

            # Send email notification if enabled
            if settings.email_user_created:
                send_user_creation_notification_email(admin_user.email, user)


def notify_admins_about_user_creation(user: User, db: SessionLocal):
    """Legacy function - kept for compatibility but notifications now happen in background."""
    pass


def ensure_users_table_exists():
    """
    Ensures the users table exists with the correct schema.
    If the table doesn't exist or has the wrong schema, it will be recreated.
    """
    try:
        with engine.connect() as conn:
            # Try to drop the table if it exists with wrong schema
            conn.execute(text("DROP TABLE IF EXISTS users"))
            conn.commit()
    except Exception:
        pass  # Table might not exist, which is fine

    # Create the users table with correct schema
    Base.metadata.create_all(bind=engine, tables=[User.__table__])


@router.post("/create-admin", response_model=UserResponse, status_code=201)
def create_admin_user(payload: UserCreate):
    """
    Create an admin user. This endpoint is intended for creating the first admin user.
    This endpoint will automatically fix the users table schema if needed,
    making it safe for team members to use without manual database setup.
    """
    try:
        with SessionLocal() as db:
            # Check if username already exists
            existing_username = db.query(User).filter(
                User.username == payload.username).first()
            if existing_username:
                raise HTTPException(
                    status_code=400, detail="Username already exists")

            # Check if email already exists
            existing_email = db.query(User).filter(
                User.email == payload.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=400, detail="Email already exists")

            # Hash the password
            password_bytes = payload.password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt)

            # Create new user
            new_user = User(
                username=payload.username,
                email=payload.email,
                password=hashed_password.decode('utf-8'),
                role="admin",
                status="active"
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            return UserResponse.from_orm(new_user)

    except OperationalError as e:
        # If we get a table schema error, fix the table and retry
        if "Unknown column" in str(e) or "doesn't exist" in str(e):
            # Recreate the users table with correct schema
            ensure_users_table_exists()

            # Retry the operation
            with SessionLocal() as db:
                # Hash the password
                password_bytes = payload.password.encode('utf-8')
                salt = bcrypt.gensalt()
                hashed_password = bcrypt.hashpw(password_bytes, salt)

                # Create new user
                new_user = User(
                    username=payload.username,
                    email=payload.email,
                    password=hashed_password.decode('utf-8'),
                    role="admin",
                    status="active"
                )

                db.add(new_user)
                db.commit()
                db.refresh(new_user)

                return UserResponse.from_orm(new_user)
        else:
            # Re-raise if it's a different operational error
            raise


@router.get("", response_model=List[UserResponse])
def get_all_users():
    """
    Get all users.
    Note: This endpoint is currently public but should be protected in production.
    """
    with SessionLocal() as db:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return [UserResponse.from_orm(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    """
    Get a specific user by ID.
    """
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.from_orm(user)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, background_tasks: BackgroundTasks):
    """
    Create a new admin user.
    Sends an email with credentials to the new user.
    """
    with SessionLocal() as db:
        # Check if username already exists
        existing_username = db.query(User).filter(
            User.username == payload.username).first()
        if existing_username:
            raise HTTPException(
                status_code=400, detail="Username already exists")

        # Check if email already exists
        existing_email = db.query(User).filter(
            User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Store plain password for email (before hashing)
        plain_password = payload.password

        # Hash the password
        password_bytes = payload.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)

        # Create new user
        new_user = User(
            username=payload.username,
            email=payload.email,
            password=hashed_password.decode('utf-8'),
            role=payload.role,
            status=payload.status
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Send welcome email with credentials in the background (non-blocking)
        background_tasks.add_task(
            send_user_creation_email,
            recipient_email=new_user.email,
            username=new_user.username,
            password=plain_password,
            role=new_user.role,
        )

        # Notify admin users about the new user creation in the background (non-blocking)
        background_tasks.add_task(
            notify_admins_about_user_creation_background,
            user_id=new_user.id
        )

        return UserResponse.from_orm(new_user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate):
    """
    Update a user.
    """
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields if provided
        if payload.email is not None:
            # Check if email is already taken by another user
            existing = db.query(User).filter(
                User.email == payload.email,
                User.id != user_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Email already in use by another user"
                )
            user.email = payload.email

        if payload.password is not None:
            # Hash the new password
            password_bytes = payload.password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt)
            user.password = hashed_password.decode('utf-8')

        if payload.role is not None:
            user.role = payload.role

        if payload.status is not None:
            user.status = payload.status

        db.commit()
        db.refresh(user)

        return UserResponse.from_orm(user)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int):
    """
    Delete a user.
    """
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        db.delete(user)
        db.commit()

        return None
