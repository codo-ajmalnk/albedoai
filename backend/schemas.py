"""
Pydantic schemas for API request/response validation and serialization.
"""
from pydantic import BaseModel
from typing import Optional, List, Literal
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

# User-related schemas


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Literal["admin"] = "admin"
    status: Literal["active", "inactive"] = "active"


class UserResponse(BaseModel):
    """Schema for user responses."""
    id: int
    username: str
    email: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating users."""
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Literal["admin"]] = None
    status: Optional[Literal["active", "inactive"]] = None


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


# Support Request schemas
class SupportRequestCreate(BaseModel):
    """Schema for creating support request."""
    email: str
    name: Optional[str] = None
    subject: str
    message: str
    categoryId: Optional[str] = None


class SupportRequestResponse(BaseModel):
    """Schema for support request responses."""
    id: int
    email: str
    name: Optional[str] = None
    subject: str
    message: str
    category_id: Optional[int] = None
    token: str
    status: str
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupportRequestUpdate(BaseModel):
    """Schema for updating support request."""
    status: Optional[str] = None
    admin_response: Optional[str] = None


# Feedback schemas
class FeedbackCreate(BaseModel):
    """Schema for creating feedback."""
    email: str
    name: Optional[str] = None
    message: str
    rating: Optional[int] = None  # 1-5 star rating


class FeedbackResponse(BaseModel):
    """Schema for feedback responses."""
    id: int
    email: str
    name: Optional[str] = None
    message: str
    rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Authentication schemas
class LoginRequest(BaseModel):
    """Schema for login request."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CurrentUser(BaseModel):
    """Schema for current authenticated user."""
    id: int
    username: str
    email: str
    role: str
    status: str


# Notification schemas
class NotificationResponse(BaseModel):
    """Schema for notification responses."""
    id: int
    user_id: int
    type: str
    title: str
    message: str
    is_read: bool
    notification_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    """Schema for creating notifications."""
    user_id: int
    type: str
    title: str
    message: str
    notification_data: Optional[dict] = None


class NotificationUpdate(BaseModel):
    """Schema for updating notifications."""
    is_read: Optional[bool] = None


# User Notification Settings schemas
class UserNotificationSettingsResponse(BaseModel):
    """Schema for user notification settings responses."""
    id: int
    user_id: int
    email_support_requests: bool
    email_user_created: bool
    system_support_requests: bool
    system_user_created: bool
    browser_support_requests: bool
    browser_user_created: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserNotificationSettingsUpdate(BaseModel):
    """Schema for updating user notification settings."""
    email_support_requests: Optional[bool] = None
    email_user_created: Optional[bool] = None
    system_support_requests: Optional[bool] = None
    system_user_created: Optional[bool] = None
    browser_support_requests: Optional[bool] = None
    browser_user_created: Optional[bool] = None


class UserNotificationSettingsCreate(BaseModel):
    """Schema for creating user notification settings."""
    user_id: int
    email_support_requests: bool = True
    email_user_created: bool = True
    system_support_requests: bool = True
    system_user_created: bool = True
    browser_support_requests: bool = True
    browser_user_created: bool = True
