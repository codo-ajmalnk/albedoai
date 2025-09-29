from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        # Example: mysql://user:pass@localhost:3306/albedo_support
        "mysql://root:password@localhost:3306/albedo_support",
    )
    cors_origins: List[str] = [
        os.getenv("CORS_ORIGIN", "http://localhost:8080"),
        os.getenv("CORS_ORIGIN_ALT", "http://127.0.0.1:8080"),
    ]


def get_settings() -> Settings:
    return Settings()
