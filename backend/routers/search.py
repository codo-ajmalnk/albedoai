"""
Search endpoints for articles and content.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from sqlalchemy import or_, func
from backend.models import Article, Category
from backend.schemas import SearchRequest, SearchResult, SearchResultCategory
from backend.database import SessionLocal


router = APIRouter(prefix="/api/search", tags=["Search"])


def compute_relevance(query: str, article: Article) -> str:
    """Compute relevance score based on where the query matches."""
    q = query.lower()
    title = (article.title or "").lower()
    excerpt = (article.excerpt or "").lower()

    # Handle content as list of content blocks
    content_text = ""
    if article.content and isinstance(article.content, list):
        # Extract text from all content blocks
        for block in article.content:
            if isinstance(block, dict):
                content_text += " " + block.get("title", "")
                content_text += " " + block.get("description", "")
    content_text = content_text.lower()

    if q in title:
        return "high"
    if q in excerpt:
        return "medium"
    if q in content_text:
        return "low"
    return "low"


@router.post("/articles", response_model=List[SearchResult])
def search_articles(payload: SearchRequest):
    """Search articles by query string."""
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
                    # Note: content is JSON, so we search only title and excerpt
                )
            )
            .order_by(func.length(Article.title))
            .limit(max(1, min(25, payload.limit)))
            .all()
        )

        formatted: List[SearchResult] = []
        for a in results:
            relevance = compute_relevance(query, a)

            # Generate excerpt from content if not available
            excerpt = a.excerpt
            if not excerpt and a.content and isinstance(a.content, list):
                # Extract text from first content block
                for block in a.content:
                    if isinstance(block, dict):
                        desc = block.get("description", "")
                        if desc:
                            excerpt = desc[:160]
                            break

            formatted.append(
                SearchResult(
                    id=a.id,
                    title=a.title,
                    excerpt=excerpt or "",
                    slug=a.slug,
                    url=a.url,
                    category=SearchResultCategory(
                        name=a.category.name, color=a.category.color),
                    relevance=relevance,
                )
            )

        return formatted
