from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path
import dotenv

# Get the directory where settings.py is located
BASE_DIR = Path(__file__).resolve().parent

# Load .env file from the backend directory
dotenv.load_dotenv(dotenv_path=BASE_DIR / ".env")


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL"
    )

    cors_origins: List[str] = [
        os.getenv("CORS_ORIGIN"),
        os.getenv("CORS_ORIGIN_ALT"),
        "*",
    ]

    # JWT settings
    # jwt_secret_key: str = os.getenv(
    #     "JWT_SECRET_KEY", "your-secret-key-change-in-production")
    # jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # Email settings
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT"))
    smtp_username: str = os.getenv("SMTP_USERNAME")
    smtp_password: str = os.getenv("SMTP_PASSWORD")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL")
    smtp_from_name: str = os.getenv("SMTP_FROM_NAME")
    frontend_url: str = os.getenv("FRONTEND_URL")
    enable_email: bool = os.getenv("ENABLE_EMAIL", "false").lower() == "true"


def get_settings() -> Settings:
    return Settings()
