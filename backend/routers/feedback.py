"""
Feedback and support request endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from backend.models import Feedback, Category
from backend.schemas import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackUpdate
)
from backend.database import SessionLocal
from backend.email_utils import (
    send_feedback_confirmation_email,
    send_feedback_response_email
)


router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("/submit")
def submit_feedback(payload: FeedbackCreate):
    """
    Submit a support/feedback request.
    Returns the feedback object with a unique tracking token.
    """
    with SessionLocal() as db:
        # Generate unique token for tracking
        tracking_token = str(uuid.uuid4())

        # Parse category ID if provided
        category_id = None
        if payload.categoryId:
            try:
                category_id = int(payload.categoryId)
                # Verify category exists
                category = db.query(Category).filter(
                    Category.id == category_id).first()
                if not category:
                    category_id = None
            except (ValueError, TypeError):
                category_id = None

        # Create feedback record
        feedback = Feedback(
            email=payload.email,
            name=payload.name,
            subject=payload.subject,
            message=payload.message,
            category_id=category_id,
            token=tracking_token,
            status="pending"
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        # Send confirmation email to user
        send_feedback_confirmation_email(
            recipient_email=feedback.email,
            recipient_name=feedback.name or "",
            subject=feedback.subject,
            message=feedback.message,
            token=feedback.token,
        )

        return {
            "success": True,
            "feedback": FeedbackResponse.from_orm(feedback)
        }


@router.get("/{token}")
def get_feedback_by_token(token: str):
    """Get feedback details by tracking token."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(Feedback.token == token).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return FeedbackResponse.from_orm(feedback)


@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback(status: str = None, limit: int = 100):
    """Get all feedback with optional status filter."""
    with SessionLocal() as db:
        query = db.query(Feedback)

        if status:
            query = query.filter(Feedback.status == status)

        feedbacks = query.order_by(
            Feedback.created_at.desc()).limit(limit).all()
        return [FeedbackResponse.from_orm(f) for f in feedbacks]


@router.put("/{feedback_id}")
def update_feedback(feedback_id: int, payload: FeedbackUpdate):
    """Update feedback status or admin response."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(
            Feedback.id == feedback_id).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        # Track if admin_response was updated
        send_notification = False
        if payload.admin_response is not None and payload.admin_response.strip():
            feedback.admin_response = payload.admin_response
            send_notification = True

        if payload.status is not None:
            feedback.status = payload.status

        db.commit()
        db.refresh(feedback)

        # Send email notification if admin responded
        if send_notification:
            send_feedback_response_email(
                recipient_email=feedback.email,
                recipient_name=feedback.name or "",
                subject=feedback.subject,
                admin_response=feedback.admin_response,
                token=feedback.token,
            )

        return FeedbackResponse.from_orm(feedback)


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int):
    """Delete a feedback entry."""
    with SessionLocal() as db:
        feedback = db.query(Feedback).filter(
            Feedback.id == feedback_id).first()
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        db.delete(feedback)
        db.commit()

        return None
