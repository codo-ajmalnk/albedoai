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
        os.getenv("CORS_ORIGIN", "http://localhost:8080"),
        os.getenv("CORS_ORIGIN_ALT", "http://127.0.0.1:8080"),
        "*"
    ]

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
