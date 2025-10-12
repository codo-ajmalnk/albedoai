# API Routers

This directory contains organized API endpoints grouped by functionality.

## Structure

```
routers/
├── __init__.py          # Router module initialization
├── search.py            # Search endpoints
├── categories.py        # Category management
├── articles.py          # Article CRUD operations
├── upload.py            # File upload/delete
├── feedback.py          # Support/feedback requests
├── users.py             # User management
└── README.md            # This file
```

## Router Modules

### 🔍 search.py

**Prefix:** `/api/search`  
**Tags:** Search

**Endpoints:**

- `POST /api/search/articles` - Search articles by query

### 📁 categories.py

**Prefix:** `/api/categories`  
**Tags:** Categories

**Endpoints:**

- `GET /api/categories` - Get all categories with article counts
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{category_id}` - Update a category
- `DELETE /api/categories/{category_id}` - Delete a category

### 📝 articles.py

**Prefix:** `/api/articles`  
**Tags:** Articles

**Endpoints:**

- `GET /api/articles` - Get all articles (with filters)
- `GET /api/articles/{article_id}` - Get article by ID
- `GET /api/articles/slug/{slug}` - Get article by slug
- `POST /api/articles` - Create a new article
- `PUT /api/articles/{article_id}` - Update an article
- `DELETE /api/articles/{article_id}` - Delete an article

### 📤 upload.py

**Prefix:** `/api/upload`  
**Tags:** File Upload

**Endpoints:**

- `POST /api/upload` - Upload image or video file
- `DELETE /api/upload` - Delete uploaded file

### 💬 feedback.py

**Prefix:** `/api/feedback`  
**Tags:** Feedback

**Endpoints:**

- `POST /api/feedback/submit` - Submit support request
- `GET /api/feedback/{token}` - Get feedback by tracking token
- `GET /api/feedback` - Get all feedback (admin)
- `PUT /api/feedback/{feedback_id}` - Update feedback status/response
- `DELETE /api/feedback/{feedback_id}` - Delete feedback

### 👤 users.py

**Prefix:** `/api/users`  
**Tags:** Users

**Endpoints:**

- `POST /api/users/create-admin` - Create admin user

## Adding New Routers

To add a new router:

1. Create a new file in `backend/routers/` (e.g., `my_feature.py`)
2. Import necessary dependencies:
   ```python
   from fastapi import APIRouter
   from backend.database import SessionLocal
   from backend.models import MyModel
   ```
3. Create the router:
   ```python
   router = APIRouter(prefix="/api/my-feature", tags=["My Feature"])
   ```
4. Add your endpoints
5. Import and include in `backend/main.py`:
   ```python
   from backend.routers import my_feature
   app.include_router(my_feature.router)
   ```

## Benefits of This Structure

✅ **Better Organization** - Endpoints grouped by functionality  
✅ **Easier Maintenance** - Find and update related endpoints quickly  
✅ **Scalability** - Easy to add new features without cluttering main.py  
✅ **Clear Separation** - Each module has a single responsibility  
✅ **Team Collaboration** - Multiple developers can work on different routers  
✅ **Automatic Documentation** - FastAPI generates organized API docs with tags
