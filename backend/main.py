from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from sqlalchemy import create_engine, or_, func
from sqlalchemy.orm import sessionmaker, Session
import os
import uuid
from pathlib import Path
from backend.models import Base, Article, Category, Feedback
from backend.settings import get_settings
from backend.schemas import (
    SearchRequest,
    SearchResult,
    SearchResultCategory,
    CategoryCreate,
    CategoryResponse,
    CategoryWithCount,
    ArticleCreate,
    ArticleUpdate,
    ArticleResponse,
    ContentBlock,
    FeedbackCreate,
    FeedbackResponse,
    FeedbackUpdate,
)
from backend.email_utils import send_feedback_confirmation_email, send_feedback_response_email


def compute_relevance(query: str, article: Article) -> str:
    q = query.lower()
    title = (article.title or "").lower()
    excerpt = (article.excerpt or "").lower()
    content = (article.content or "").lower()

    if q in title:
        return "high"
    if q in excerpt:
        return "medium"
    if q in content:
        return "low"
    return "low"


settings = get_settings()
# Use pymysql driver for MySQL for easier local setup
_db_url = settings.database_url
if _db_url.startswith("mysql://") and "+pymysql" not in _db_url:
    _db_url = _db_url.replace("mysql://", "mysql+pymysql://")
engine = create_engine(_db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables if not exist
Base.metadata.create_all(bind=engine)

# Create uploads directory
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "images").mkdir(exist_ok=True)
(UPLOAD_DIR / "videos").mkdir(exist_ok=True)

app = FastAPI(title="Albedo Support API", version="1.0.0")

# Mount static files for serving uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/api/search/articles", response_model=List[SearchResult])
def search_articles(payload: SearchRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    with SessionLocal() as db:
        like = f"%{query}%"
        results = (
            db.query(Article)
            .join(Category, Article.category_id == Category.id)
            .filter(
                or_(
                    Article.title.ilike(like),
                    Article.excerpt.ilike(like),
                    Article.content.ilike(like),
                )
            )
            .order_by(func.length(Article.title))
            .limit(max(1, min(25, payload.limit)))
            .all()
        )

        formatted: List[SearchResult] = []
        for a in results:
            relevance = compute_relevance(query, a)
            formatted.append(
                SearchResult(
                    id=a.id,
                    title=a.title,
                    excerpt=a.excerpt or (
                        a.content[:160] if a.content else ""),
                    slug=a.slug,
                    url=a.url,
                    category=SearchResultCategory(
                        name=a.category.name, color=a.category.color),
                    relevance=relevance,
                )
            )

        return formatted


@app.get("/api/categories", response_model=List[CategoryWithCount])
def get_categories():
    with SessionLocal() as db:
        categories = db.query(Category).all()
        result = []
        for cat in categories:
            article_count = db.query(func.count(Article.id)).filter(
                Article.category_id == cat.id
            ).scalar()
            result.append(
                CategoryWithCount(
                    id=cat.id,
                    name=cat.name,
                    description=cat.description,
                    color=cat.color,
                    article_count=article_count or 0,
                    created_at=cat.created_at,
                    updated_at=cat.updated_at,
                )
            )
        return result


@app.post("/api/categories", response_model=CategoryResponse, status_code=201)
def create_category(payload: CategoryCreate):
    with SessionLocal() as db:
        # Check if category with same name already exists
        existing = db.query(Category).filter(
            Category.name == payload.name).first()
        if existing:
            raise HTTPException(
                status_code=400, detail="Category with this name already exists")

        # Create new category
        new_category = Category(
            name=payload.name,
            description=payload.description,
            color=payload.color
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return new_category


@app.put("/api/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, payload: CategoryCreate):
    with SessionLocal() as db:
        # Find the category
        category = db.query(Category).filter(
            Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Check if new name conflicts with another category
        if payload.name != category.name:
            existing = db.query(Category).filter(
                Category.name == payload.name,
                Category.id != category_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Category with this name already exists"
                )

        # Update the category
        category.name = payload.name
        category.description = payload.description
        if payload.color is not None:
            category.color = payload.color

        db.commit()
        db.refresh(category)

        return category


@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(category_id: int):
    with SessionLocal() as db:
        # Find the category
        category = db.query(Category).filter(
            Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Check if category has articles
        article_count = db.query(func.count(Article.id)).filter(
            Article.category_id == category_id
        ).scalar()

        if article_count and article_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete category with {article_count} article(s). Please reassign or delete the articles first."
            )

        # Delete the category
        db.delete(category)
        db.commit()

        return None


# ============ Articles CRUD ============

@app.get("/api/articles", response_model=List[ArticleResponse])
def get_articles(
    category_id: int = None,
    is_published: bool = None,
    is_featured: bool = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all articles with optional filtering."""
    with SessionLocal() as db:
        query = db.query(Article).join(Category)

        # Apply filters
        if category_id is not None:
            query = query.filter(Article.category_id == category_id)
        if is_published is not None:
            query = query.filter(Article.is_published == is_published)
        if is_featured is not None:
            query = query.filter(Article.is_featured == is_featured)

        # Order by order field, then by created_at
        articles = query.order_by(Article.order, Article.created_at.desc()).offset(
            skip).limit(limit).all()

        # Transform to response format
        result = []
        for article in articles:
            # Convert content from dict to ContentBlock objects
            content_blocks = [ContentBlock(
                **block) for block in article.content] if article.content else None

            result.append(
                ArticleResponse(
                    id=article.id,
                    title=article.title,
                    slug=article.slug,
                    excerpt=article.excerpt,
                    content=content_blocks,
                    url=article.url,
                    is_published=bool(article.is_published),
                    is_featured=bool(article.is_featured),
                    view_count=article.view_count,
                    order=article.order,
                    created_at=article.created_at,
                    updated_at=article.updated_at,
                    category_id=article.category_id,
                    category=SearchResultCategory(
                        name=article.category.name,
                        color=article.category.color
                    )
                )
            )
        return result


@app.get("/api/articles/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int):
    """Get a single article by ID."""
    with SessionLocal() as db:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Convert content from dict to ContentBlock objects
        content_blocks = [ContentBlock(
            **block) for block in article.content] if article.content else None

        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            excerpt=article.excerpt,
            content=content_blocks,
            url=article.url,
            is_published=bool(article.is_published),
            is_featured=bool(article.is_featured),
            view_count=article.view_count,
            order=article.order,
            created_at=article.created_at,
            updated_at=article.updated_at,
            category_id=article.category_id,
            category=SearchResultCategory(
                name=article.category.name,
                color=article.category.color
            )
        )


@app.get("/api/articles/slug/{slug}", response_model=ArticleResponse)
def get_article_by_slug(slug: str):
    """Get a single article by slug."""
    with SessionLocal() as db:
        article = db.query(Article).filter(Article.slug == slug).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Increment view count
        article.view_count += 1
        db.commit()

        # Convert content from dict to ContentBlock objects
        content_blocks = [ContentBlock(
            **block) for block in article.content] if article.content else None

        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            excerpt=article.excerpt,
            content=content_blocks,
            url=article.url,
            is_published=bool(article.is_published),
            is_featured=bool(article.is_featured),
            view_count=article.view_count,
            order=article.order,
            created_at=article.created_at,
            updated_at=article.updated_at,
            category_id=article.category_id,
            category=SearchResultCategory(
                name=article.category.name,
                color=article.category.color
            )
        )


@app.post("/api/articles", response_model=ArticleResponse, status_code=201)
def create_article(payload: ArticleCreate):
    """Create a new article."""
    with SessionLocal() as db:
        # Check if category exists
        category = db.query(Category).filter(
            Category.id == payload.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

        # Check if slug already exists
        existing = db.query(Article).filter(
            Article.slug == payload.slug).first()
        if existing:
            raise HTTPException(
                status_code=400, detail="Article with this slug already exists")

        # Create new article
        # Convert content blocks to dict for JSON storage
        content_data = [block.model_dump()
                        for block in payload.content] if payload.content else None

        new_article = Article(
            title=payload.title,
            slug=payload.slug,
            excerpt=payload.excerpt,
            content=content_data,
            url=payload.url,
            is_published=payload.is_published,
            is_featured=payload.is_featured,
            view_count=payload.view_count,
            order=payload.order,
            category_id=payload.category_id
        )
        db.add(new_article)
        db.commit()
        db.refresh(new_article)

        # Convert content back to ContentBlock objects for response
        content_blocks = [ContentBlock(
            **block) for block in new_article.content] if new_article.content else None

        return ArticleResponse(
            id=new_article.id,
            title=new_article.title,
            slug=new_article.slug,
            excerpt=new_article.excerpt,
            content=content_blocks,
            url=new_article.url,
            is_published=bool(new_article.is_published),
            is_featured=bool(new_article.is_featured),
            view_count=new_article.view_count,
            order=new_article.order,
            created_at=new_article.created_at,
            updated_at=new_article.updated_at,
            category_id=new_article.category_id,
            category=SearchResultCategory(
                name=category.name,
                color=category.color
            )
        )


@app.put("/api/articles/{article_id}", response_model=ArticleResponse)
def update_article(article_id: int, payload: ArticleUpdate):
    """Update an existing article."""
    with SessionLocal() as db:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Check if new slug conflicts with another article
        if payload.slug and payload.slug != article.slug:
            existing = db.query(Article).filter(
                Article.slug == payload.slug,
                Article.id != article_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400, detail="Article with this slug already exists")

        # Check if category exists if being updated
        if payload.category_id and payload.category_id != article.category_id:
            category = db.query(Category).filter(
                Category.id == payload.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=400, detail="Category not found")

        # Update fields - using model_dump to check what was actually sent
        update_data = payload.model_dump(exclude_unset=True)

        if "title" in update_data:
            article.title = payload.title
        if "slug" in update_data:
            article.slug = payload.slug
        if "excerpt" in update_data:
            article.excerpt = payload.excerpt
        if "content" in update_data:
            # Convert content blocks to dict for JSON storage
            article.content = [
                block.model_dump() for block in payload.content] if payload.content else None
        if "url" in update_data:
            article.url = payload.url
        if payload.is_published is not None:
            article.is_published = payload.is_published
        if payload.is_featured is not None:
            article.is_featured = payload.is_featured
        if payload.view_count is not None:
            article.view_count = payload.view_count
        if payload.order is not None:
            article.order = payload.order
        if payload.category_id is not None:
            article.category_id = payload.category_id

        db.commit()
        db.refresh(article)

        # Convert content from dict to ContentBlock objects
        content_blocks = [ContentBlock(
            **block) for block in article.content] if article.content else None

        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            excerpt=article.excerpt,
            content=content_blocks,
            url=article.url,
            is_published=bool(article.is_published),
            is_featured=bool(article.is_featured),
            view_count=article.view_count,
            order=article.order,
            created_at=article.created_at,
            updated_at=article.updated_at,
            category_id=article.category_id,
            category=SearchResultCategory(
                name=article.category.name,
                color=article.category.color
            )
        )


@app.delete("/api/articles/{article_id}", status_code=204)
def delete_article(article_id: int):
    """Delete an article."""
    with SessionLocal() as db:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        db.delete(article)
        db.commit()

        return None


# ============ File Upload ============

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), file_type: str = "image"):
    """
    Upload a file (image or video).
    Returns the URL path to access the uploaded file.
    """
    # Validate file type
    if file_type not in ["image", "video"]:
        raise HTTPException(
            status_code=400, detail="file_type must be 'image' or 'video'")

    # Validate file extension
    allowed_image_extensions = {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    allowed_video_extensions = {".mp4", ".webm", ".ogg", ".mov", ".avi"}

    file_extension = Path(file.filename).suffix.lower()

    if file_type == "image" and file_extension not in allowed_image_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file. Allowed: {', '.join(allowed_image_extensions)}"
        )

    if file_type == "video" and file_extension not in allowed_video_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video file. Allowed: {', '.join(allowed_video_extensions)}"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / f"{file_type}s" / unique_filename

    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to save file: {str(e)}")

    # Return the URL path
    file_url = f"/uploads/{file_type}s/{unique_filename}"
    return {"url": file_url, "filename": file.filename, "size": len(contents)}


@app.delete("/api/upload")
async def delete_file(file_url: str):
    """Delete an uploaded file by its URL path."""
    try:
        # Extract the relative path from URL
        if file_url.startswith("/uploads/"):
            relative_path = file_url.replace("/uploads/", "")
            file_path = UPLOAD_DIR / relative_path

            if file_path.exists() and file_path.is_file():
                os.remove(file_path)
                return {"message": "File deleted successfully"}
            else:
                raise HTTPException(status_code=404, detail="File not found")
        else:
            raise HTTPException(status_code=400, detail="Invalid file URL")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete file: {str(e)}")


# ============ Feedback / Support ============

@app.post("/api/feedback/submit")
def submit_feedback(payload: FeedbackCreate):
    """
    Submit a support/feedback request.
    Returns the feedback object with a unique tracking token.
    """
    with SessionLocal() as db:
        # Generate unique token for tracking
        tracking_token = str(uuid.uuid4())

        # Parse category ID if provided
        category_id = None
        if payload.categoryId:
            try:
                category_id = int(payload.categoryId)
                # Verify category exists
                category = db.query(Category).filter(
                    Category.id == category_id).first()
                if not category:
                    category_id = None
            except (ValueError, TypeError):
                category_id = None

        # Create feedback record
        feedback = Feedback(
            email=payload.email,
            name=payload.name,
            subject=payload.subject,
            message=payload.message,
            category_id=category_id,
            token=tracking_token,
            status="pending"
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        # Send confirmation email to user
        send_feedback_confirmation_email(
            recipient_email=feedback.email,
            recipient_name=feedback.name or "",
            subject=feedback.subject,
            message=feedback.message,
            token=feedback.token,
        )

        return {
            "success": True,
            "feedback": FeedbackResponse.from_orm(feedback)
        }


@app.get("/api/feedback/{token}")
def get_feedback_by_token(token: str):
    """Get feedback details by tracking token."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(Feedback.token == token).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return FeedbackResponse.from_orm(feedback)


@app.get("/api/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(status: str = None, limit: int = 100):
    """Get all feedback with optional status filter."""
    with SessionLocal() as db:
        query = db.query(Feedback)

        if status:
            query = query.filter(Feedback.status == status)

        feedbacks = query.order_by(
            Feedback.created_at.desc()).limit(limit).all()
        return [FeedbackResponse.from_orm(f) for f in feedbacks]


@app.put("/api/feedback/{feedback_id}")
def update_feedback(feedback_id: int, payload: FeedbackUpdate):
    """Update feedback status or admin response."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(
            Feedback.id == feedback_id).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        # Track if admin_response was updated
        send_notification = False
        if payload.admin_response is not None and payload.admin_response.strip():
            feedback.admin_response = payload.admin_response
            send_notification = True

        if payload.status is not None:
            feedback.status = payload.status

        db.commit()
        db.refresh(feedback)

        # Send email notification if admin responded
        if send_notification:
            send_feedback_response_email(
                recipient_email=feedback.email,
                recipient_name=feedback.name or "",
                subject=feedback.subject,
                admin_response=feedback.admin_response,
                token=feedback.token,
            )

        return FeedbackResponse.from_orm(feedback)


@app.delete("/api/feedback/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int):
    """Delete a feedback entry."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(
            Feedback.id == feedback_id).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        db.delete(feedback)
        db.commit()

        return None


@app.get("/api/health")
def health():
    with SessionLocal() as db:
        db.execute(func.now())
    return {"status": "ok"}
