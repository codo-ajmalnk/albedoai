from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, or_, func
from sqlalchemy.orm import sessionmaker, Session

from backend.models import Base, Article, Category
from backend.settings import get_settings


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

app = FastAPI(title="Albedo Support API", version="1.0.0")

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
                    excerpt=a.excerpt or (a.content[:160] if a.content else ""),
                    slug=a.slug,
                    url=a.url,
                    category=SearchResultCategory(name=a.category.name, color=a.category.color),
                    relevance=relevance,
                )
            )

        return formatted


@app.get("/api/health")
def health():
    with SessionLocal() as db:
        db.execute(func.now())
    return {"status": "ok"}
