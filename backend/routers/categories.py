"""
Category management endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from sqlalchemy import func
from backend.models import Category, Article
from backend.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryWithCount
)
from backend.database import SessionLocal


router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryWithCount])
def get_categories():
    """Get all categories with article counts."""
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


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(payload: CategoryCreate):
    """Create a new category."""
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


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, payload: CategoryCreate):
    """Update an existing category."""
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


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int):
    """Delete a category."""
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
