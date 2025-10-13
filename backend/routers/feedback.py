"""
Feedback endpoints for collecting user feedback about the site experience.
This is separate from the support request system.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.models import Feedback
from backend.schemas import FeedbackCreate, FeedbackResponse, CurrentUser
from backend.database import SessionLocal
from backend.routers.auth import require_admin

router = APIRouter(prefix="/api/feedback",
                   tags=["Feedback"])


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=FeedbackResponse, status_code=201)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user experience feedback entry.
    This is a public endpoint that doesn't require authentication.
    """
    # Validate rating if provided
    if payload.rating is not None and (payload.rating < 1 or payload.rating > 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    # Create new feedback entry
    new_feedback = Feedback(
        email=payload.email,
        name=payload.name,
        message=payload.message,
        rating=payload.rating
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return FeedbackResponse.from_orm(new_feedback)


@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin)
):
    """
    Get all user experience feedback entries.
    Requires admin authentication.
    """
    feedback_entries = db.query(Feedback).order_by(
        Feedback.created_at.desc()
    ).all()

    return [FeedbackResponse.from_orm(entry) for entry in feedback_entries]


@router.get("/stats")
def get_feedback_stats(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin)
):
    """
    Get statistics about user experience feedback.
    Requires admin authentication.
    """
    total_feedback = db.query(Feedback).count()

    # Calculate average rating
    feedback_with_ratings = db.query(Feedback).filter(
        Feedback.rating.isnot(None)
    ).all()

    if feedback_with_ratings:
        average_rating = sum(
            f.rating for f in feedback_with_ratings) / len(feedback_with_ratings)
        rating_count = len(feedback_with_ratings)
    else:
        average_rating = 0
        rating_count = 0

    # Rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(Feedback).filter(
            Feedback.rating == i
        ).count()
        rating_distribution[str(i)] = count

    return {
        "total_feedback": total_feedback,
        "average_rating": round(average_rating, 2) if average_rating > 0 else None,
        "rating_count": rating_count,
        "rating_distribution": rating_distribution,
        "feedback_without_rating": total_feedback - rating_count
    }
