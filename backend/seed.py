from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models import Base, Category, Article
from backend.settings import get_settings


def seed():
    settings = get_settings()
    db_url = settings.database_url
    if db_url.startswith("mysql://") and "+pymysql" not in db_url:
        db_url = db_url.replace("mysql://", "mysql+pymysql://")
    engine = create_engine(db_url, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    with SessionLocal() as db:
        # Seed categories
        categories = [
            ("Getting Started", "#3b82f6"),
            ("Installation", "#10b981"),
            ("FAQ", "#f59e0b"),
            ("Troubleshooting", "#ef4444"),
        ]
        existing = {c.name for c in db.query(Category).all()}
        for name, color in categories:
            if name not in existing:
                db.add(Category(name=name, color=color))
        db.commit()

        # Get categories
        cat_map = {c.name: c for c in db.query(Category).all()}

        # Seed articles (examples)
        articles = [
            {
                "title": "Albedo Support: Getting Started",
                "slug": "docs/getting-started",
                "excerpt": "Learn the basics of Albedo Support platform and key features.",
                "content": "This guide helps you start with Albedo support docs, search, and feedback.",
                "url": None,
                "category": "Getting Started",
            },
            {
                "title": "Install Albedo Support",
                "slug": "docs/installation",
                "excerpt": "Step-by-step installation instructions for Albedo Support.",
                "content": "Install prerequisites, configure environment, and run the app.",
                "url": None,
                "category": "Installation",
            },
            {
                "title": "FAQ: Common Questions",
                "slug": "docs/faq",
                "excerpt": "Frequently asked questions about Albedo Support.",
                "content": "Explore answers to common usage and setup questions.",
                "url": None,
                "category": "FAQ",
            },
        ]

        existing_slugs = {a.slug for a in db.query(Article).all()}
        for a in articles:
            if a["slug"] in existing_slugs:
                continue
            db.add(
                Article(
                    title=a["title"],
                    slug=a["slug"],
                    excerpt=a["excerpt"],
                    content=a["content"],
                    url=a["url"],
                    category_id=cat_map[a["category"].strip()].id,
                )
            )
        db.commit()


if __name__ == "__main__":
    seed()
