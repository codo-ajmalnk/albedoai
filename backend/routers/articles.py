"""
Article management endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import Article, Category
from backend.schemas import (
    ArticleCreate,
    ArticleUpdate,
    ArticleResponse,
    ContentBlock,
    SearchResultCategory
)
from backend.database import SessionLocal


router = APIRouter(prefix="/api/articles", tags=["Articles"])


@router.get("", response_model=List[ArticleResponse])
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


@router.get("/{article_id}", response_model=ArticleResponse)
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


@router.get("/slug/{slug}", response_model=ArticleResponse)
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


@router.post("", response_model=ArticleResponse, status_code=201)
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


@router.put("/{article_id}", response_model=ArticleResponse)
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


@router.delete("/{article_id}", status_code=204)
def delete_article(article_id: int):
    """Delete an article."""
    with SessionLocal() as db:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        db.delete(article)
        db.commit()

        return None
