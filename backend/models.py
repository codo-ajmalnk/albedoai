from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, ForeignKey

Base = declarative_base()


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(16), nullable=True)

    articles = relationship("Article", back_populates="category")


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    excerpt: Mapped[str] = mapped_column(String(512), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(String(512), nullable=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    category = relationship("Category", back_populates="articles")
