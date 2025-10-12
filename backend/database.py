"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.settings import get_settings

# Get database settings
settings = get_settings()

# Use pymysql driver for MySQL for easier local setup
_db_url = settings.database_url
if _db_url.startswith("mysql://") and "+pymysql" not in _db_url:
    _db_url = _db_url.replace("mysql://", "mysql+pymysql://")

# Create engine
engine = create_engine(_db_url, pool_pre_ping=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
