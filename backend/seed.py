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
            ("Getting Started", "Basic setup and initial configuration guides", "#3b82f6"),
            ("Installation", "Step-by-step installation instructions", "#10b981"),
            ("FAQ", "Frequently asked questions and answers", "#f59e0b"),
            ("Troubleshooting", "Common issues and their solutions", "#ef4444"),
        ]
        existing = {c.name for c in db.query(Category).all()}
        for name, description, color in categories:
            if name not in existing:
                db.add(Category(name=name, description=description, color=color))
        db.commit()

        # Get categories
        cat_map = {c.name: c for c in db.query(Category).all()}

        # Seed articles (examples with content blocks)
        articles = [
            {
                "title": "Albedo Support: Getting Started",
                "slug": "getting-started",
                "excerpt": "Learn the basics of Albedo Support platform and key features.",
                "content": [
                    {
                        "title": "Welcome to Albedo Support",
                        "description": "This guide helps you start with Albedo support docs, search, and feedback features. Get familiar with the platform basics.",
                        "images": None,
                        "videos": None,
                    },
                    {
                        "title": "Key Features",
                        "description": "Explore documentation articles, search functionality, and submit feedback to improve your experience.",
                        "images": None,
                        "videos": None,
                    },
                ],
                "url": None,
                "category": "Getting Started",
            },
            {
                "title": "Install Albedo Support",
                "slug": "installation",
                "excerpt": "Step-by-step installation instructions for Albedo Support.",
                "content": [
                    {
                        "title": "Prerequisites",
                        "description": "Install Node.js, Python 3.10+, and MySQL before proceeding with the installation.",
                        "images": None,
                        "videos": None,
                    },
                    {
                        "title": "Environment Configuration",
                        "description": "Configure your environment variables and database connection settings in the .env file.",
                        "images": None,
                        "videos": None,
                    },
                    {
                        "title": "Run the Application",
                        "description": "Start the backend server with 'python -m backend.main' and the frontend with 'npm run dev'.",
                        "images": None,
                        "videos": None,
                    },
                ],
                "url": None,
                "category": "Installation",
            },
            {
                "title": "FAQ: Common Questions",
                "slug": "faq",
                "excerpt": "Frequently asked questions about Albedo Support.",
                "content": [
                    {
                        "title": "What is Albedo Support?",
                        "description": "Albedo Support is a comprehensive documentation and support platform designed to help users find answers quickly and efficiently.",
                        "images": None,
                        "videos": None,
                    },
                    {
                        "title": "How do I search for articles?",
                        "description": "Use the search bar at the top of the page to find articles by keywords. The search results will show the most relevant articles.",
                        "images": None,
                        "videos": None,
                    },
                ],
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
                    # Content is now an array of content blocks
                    content=a["content"],
                    url=a["url"],
                    category_id=cat_map[a["category"].strip()].id,
                )
            )
        db.commit()


if __name__ == "__main__":
    seed()
