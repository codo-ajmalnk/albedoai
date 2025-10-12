# Albedo Support Backend (FastAPI + MySQL)

A well-organized FastAPI backend with modular router architecture for better maintainability.

## 📁 Project Structure

```
backend/
├── main.py              # Main FastAPI app entry point
├── database.py          # Database configuration and session
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas for validation
├── settings.py          # App settings and configuration
├── email_utils.py       # Email utility functions
├── seed.py             # Database seeding script
├── requirements.txt     # Python dependencies
└── routers/            # API endpoints organized by feature
    ├── search.py       # Search endpoints
    ├── categories.py   # Category management
    ├── articles.py     # Article CRUD
    ├── upload.py       # File upload/delete
    ├── feedback.py     # Support/feedback
    ├── users.py        # User management
    └── README.md       # Router documentation
```

## 🚀 Quick Start

### Environment Setup

Create `.env` file in the backend directory:

```env
DATABASE_URL=mysql://root:password@localhost:3306/albedo_support
CORS_ORIGIN=http://localhost:8080
CORS_ORIGIN_ALT=http://127.0.0.1:8080
```

### Install Dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run the Server

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 3001
```

The API will be available at:

- **API Base**: http://localhost:3001
- **Interactive Docs**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

### Seed Database

```bash
python -m backend.seed
```

## 📚 API Endpoints

### Search

- `POST /api/search/articles` - Search articles

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Articles

- `GET /api/articles` - List articles (with filters)
- `GET /api/articles/{id}` - Get article by ID
- `GET /api/articles/slug/{slug}` - Get article by slug
- `POST /api/articles` - Create article
- `PUT /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article

### File Upload

- `POST /api/upload` - Upload file
- `DELETE /api/upload` - Delete file

### Feedback/Support

- `POST /api/feedback/submit` - Submit feedback
- `GET /api/feedback/{token}` - Track feedback
- `GET /api/feedback` - List all feedback (admin)
- `PUT /api/feedback/{id}` - Update feedback
- `DELETE /api/feedback/{id}` - Delete feedback

### Users

- `POST /api/users/create-admin` - Create admin user

### Health

- `GET /api/health` - Health check

## 🔧 Development

### Adding New Features

1. Create a new router in `backend/routers/`
2. Define your endpoints
3. Import and include in `main.py`

See `backend/routers/README.md` for detailed instructions.

### Database Migrations

The app automatically creates tables on startup. For schema changes in production, consider using Alembic.

## 📦 Dependencies

Key packages:

- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database
- **Pydantic** - Data validation
- **PyMySQL** - MySQL driver
- **bcrypt** - Password hashing
- **uvicorn** - ASGI server

## 🏗️ Architecture

The backend follows a modular architecture:

1. **Router Layer** (`routers/`) - HTTP endpoints
2. **Schema Layer** (`schemas.py`) - Request/response validation
3. **Model Layer** (`models.py`) - Database models
4. **Database Layer** (`database.py`) - Connection management
5. **Utilities** (`email_utils.py`, etc.) - Shared functions

## 🔐 Security

- Passwords hashed with bcrypt
- CORS configured for frontend origins
- Input validation via Pydantic schemas
- SQL injection protection via SQLAlchemy ORM

## 📝 Notes

- The `users` table auto-repairs on first admin creation
- File uploads stored in `backend/uploads/`
- Email notifications sent for feedback responses
