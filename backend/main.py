"""
Main FastAPI application entry point.
All endpoints are organized in separate router modules for better maintainability.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import func

from backend.models import Base
from backend.database import engine, SessionLocal
from backend.settings import get_settings

# Import routers
from backend.routers import search, categories, articles, upload, feedback, users, auth


# Create tables if not exist
Base.metadata.create_all(bind=engine)

# Create uploads directory
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "images").mkdir(exist_ok=True)
(UPLOAD_DIR / "videos").mkdir(exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Albedo Support API",
    version="1.0.0",
    description="Support and knowledge base management system"
)

# Get settings
settings = get_settings()

# Mount static files for serving uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(categories.router)
app.include_router(articles.router)
app.include_router(upload.router)
app.include_router(feedback.router)
app.include_router(users.router)


# Health check endpoint
@app.get("/api/health", tags=["Health"])
def health():
    """Check if the API and database are working."""
    with SessionLocal() as db:
        db.execute(func.now())
    return {"status": "ok"}


# Root endpoint
@app.get("/", tags=["Root"])
def root():
    """API root endpoint with basic information."""
    return {
        "name": "Albedo Support API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
