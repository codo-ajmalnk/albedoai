"""
Pydantic schemas for API request/response validation and serialization.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Content Block schema
class ContentBlock(BaseModel):
    """A structured content block within an article."""
    title: str
    description: str
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None


# Search-related schemas
class SearchRequest(BaseModel):
    query: str
    limit: int = 5


class SearchResultCategory(BaseModel):
    name: str
    color: str | None = None


class SearchResult(BaseModel):
    id: int
    title: str
    excerpt: str
    slug: str
    url: Optional[str] = None
    category: SearchResultCategory
    relevance: str


# Category-related schemas
class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    name: str
    description: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(BaseModel):
    """Schema for category responses."""
    id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWithCount(BaseModel):
    """Schema for category with article count."""
    id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    article_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Article-related schemas
class ArticleCreate(BaseModel):
    """Schema for creating an article."""
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[List[ContentBlock]] = None  # Array of content blocks
    url: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False
    view_count: int = 0
    order: int = 0
    category_id: int


class ArticleUpdate(BaseModel):
    """Schema for updating an article."""
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[List[ContentBlock]] = None  # Array of content blocks
    url: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    view_count: Optional[int] = None
    order: Optional[int] = None
    category_id: Optional[int] = None


class ArticleResponse(BaseModel):
    """Schema for article responses."""
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[List[ContentBlock]] = None  # Array of content blocks
    url: Optional[str] = None
    is_published: bool
    is_featured: bool
    view_count: int
    order: int
    created_at: datetime
    updated_at: datetime
    category_id: int
    category: SearchResultCategory

    class Config:
        from_attributes = True
