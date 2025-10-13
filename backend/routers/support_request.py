"""
Support request endpoints.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import uuid
from backend.models import SupportRequest, Category, User, UserNotificationSettings
from backend.schemas import (
    SupportRequestCreate,
    SupportRequestResponse,
    SupportRequestUpdate
)
from backend.database import SessionLocal
from backend.email_utils import (
    send_feedback_confirmation_email,
    send_feedback_response_email,
    send_feedback_status_update_email,
    send_support_request_notification_email
)
from backend.routers.notifications import create_notification


router = APIRouter(prefix="/api/support-request", tags=["Support Request"])


def notify_admins_about_support_request_background(support_request_id: int):
    """Background task to notify all admin users about a new support request."""
    with SessionLocal() as db:
        # Get the support request
        support_request = db.query(SupportRequest).filter(
            SupportRequest.id == support_request_id
        ).first()

        if not support_request:
            print(f"[DEBUG] Support request {support_request_id} not found")
            return

        # Get all admin users
        admin_users = db.query(User).filter(
            User.role == "admin", User.status == "active").all()

        for admin_user in admin_users:
            # Check user's notification settings
            settings = db.query(UserNotificationSettings).filter(
                UserNotificationSettings.user_id == admin_user.id
            ).first()

            # Create default settings if they don't exist
            if not settings:
                try:
                    settings = UserNotificationSettings(
                        user_id=admin_user.id,
                        email_support_requests=True,
                        email_user_created=True,
                        system_support_requests=True,
                        system_user_created=True,
                        browser_support_requests=True,
                        browser_user_created=True
                    )
                    db.add(settings)
                    db.commit()
                except Exception as create_error:
                    # If browser columns don't exist, create without them
                    if "browser_support_requests" in str(create_error) or "browser_user_created" in str(create_error):
                        from sqlalchemy import text
                        db.execute(text("""
                            INSERT INTO user_notification_settings 
                            (user_id, email_support_requests, email_user_created, 
                             system_support_requests, system_user_created, created_at, updated_at)
                            VALUES (:user_id, :email_support_requests, :email_user_created, 
                                    :system_support_requests, :system_user_created, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE
                            email_support_requests = VALUES(email_support_requests),
                            email_user_created = VALUES(email_user_created),
                            system_support_requests = VALUES(system_support_requests),
                            system_user_created = VALUES(system_user_created),
                            updated_at = NOW()
                        """), {
                            "user_id": admin_user.id,
                            "email_support_requests": True,
                            "email_user_created": True,
                            "system_support_requests": True,
                            "system_user_created": True
                        })
                        db.commit()

                        # Get the created settings
                        settings = db.query(UserNotificationSettings).filter(
                            UserNotificationSettings.user_id == admin_user.id
                        ).first()
                    else:
                        raise create_error

            # Create system notification if enabled
            if settings.system_support_requests:
                print(
                    f"[DEBUG] Creating notification for admin user {admin_user.id} about support request {support_request.id}")
                create_notification(
                    user_id=admin_user.id,
                    notification_type="support_request",
                    title="New Support Request",
                    message=f"New support request from {support_request.name or support_request.email}: {support_request.subject}",
                    notification_data={
                        "support_request_id": support_request.id,
                        "email": support_request.email,
                        "subject": support_request.subject
                    },
                    db=db
                )
                print(
                    f"[DEBUG] Notification created successfully for admin user {admin_user.id}")
            else:
                print(
                    f"[DEBUG] System notifications disabled for admin user {admin_user.id}")

            # Send email notification if enabled
            if settings.email_support_requests:
                send_support_request_notification_email(
                    admin_user.email, support_request)


def notify_admins_about_support_request(support_request: SupportRequest, db: SessionLocal):
    """Legacy function - kept for compatibility but notifications now happen in background."""
    pass


@router.post("/submit")
def submit_support_request(payload: SupportRequestCreate, background_tasks: BackgroundTasks):
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

        # Create support request record
        feedback = SupportRequest(
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

        # Prepare response
        response = SupportRequestResponse.from_orm(feedback)

        # Send confirmation email in the background (non-blocking)
        background_tasks.add_task(
            send_feedback_confirmation_email,
            recipient_email=feedback.email,
            recipient_name=feedback.name or "",
            subject=feedback.subject,
            message=feedback.message,
            token=feedback.token,
        )

        # Notify admin users about the new support request in the background (non-blocking)
        background_tasks.add_task(
            notify_admins_about_support_request_background,
            support_request_id=feedback.id
        )

        return {
            "success": True,
            "feedback": response
        }


@router.get("/{token}")
def get_feedback_by_token(token: str):
    """Get feedback details by tracking token."""
    with SessionLocal() as db:
        feedback = db.query(SupportRequest).filter(
            SupportRequest.token == token).first()
        if not feedback:
            raise HTTPException(
                status_code=404, detail="SupportRequest not found")

        return SupportRequestResponse.from_orm(feedback)


@router.get("", response_model=List[SupportRequestResponse])
def get_all_support_requests(status: str = None, limit: int = 100):
    """Get all support requests with optional status filter."""
    with SessionLocal() as db:
        query = db.query(SupportRequest)

        if status:
            query = query.filter(SupportRequest.status == status)

        feedbacks = query.order_by(
            SupportRequest.created_at.desc()).limit(limit).all()
        return [SupportRequestResponse.from_orm(f) for f in feedbacks]


@router.put("/{feedback_id}")
def update_feedback(feedback_id: int, payload: SupportRequestUpdate, background_tasks: BackgroundTasks):
    """Update feedback status or admin response."""
    with SessionLocal() as db:
        feedback = db.query(SupportRequest).filter(
            SupportRequest.id == feedback_id).first()
        if not feedback:
            raise HTTPException(
                status_code=404, detail="SupportRequest not found")

        # Track what was updated
        has_admin_response = payload.admin_response is not None and payload.admin_response.strip()
        has_status_update = payload.status is not None

        # Update fields
        if has_admin_response:
            feedback.admin_response = payload.admin_response

        if has_status_update:
            feedback.status = payload.status

        db.commit()
        db.refresh(feedback)

        # Prepare response first (before scheduling background tasks)
        response = SupportRequestResponse.from_orm(feedback)

        # Schedule emails to be sent in the background (non-blocking)
        if has_status_update and has_admin_response:
            # Both status and response updated - send combined email
            background_tasks.add_task(
                send_feedback_response_email,
                recipient_email=feedback.email,
                recipient_name=feedback.name or "",
                subject=feedback.subject,
                status=feedback.status,
                admin_response=feedback.admin_response,
                token=feedback.token,
            )
        elif has_status_update:
            # Only status updated - send status update email
            background_tasks.add_task(
                send_feedback_status_update_email,
                recipient_email=feedback.email,
                recipient_name=feedback.name or "",
                subject=feedback.subject,
                status=feedback.status,
                token=feedback.token,
            )
        elif has_admin_response:
            # Only admin response - send response email
            background_tasks.add_task(
                send_feedback_response_email,
                recipient_email=feedback.email,
                recipient_name=feedback.name or "",
                subject=feedback.subject,
                status=feedback.status,
                admin_response=feedback.admin_response,
                token=feedback.token,
            )

        return response


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int):
    """Delete a feedback entry."""
    with SessionLocal() as db:
        feedback = db.query(SupportRequest).filter(
            SupportRequest.id == feedback_id).first()
        if not feedback:
            raise HTTPException(
                status_code=404, detail="SupportRequest not found")

        db.delete(feedback)
        db.commit()

        return None
