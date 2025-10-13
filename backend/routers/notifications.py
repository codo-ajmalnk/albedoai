"""
Notification endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from backend.models import Notification, UserNotificationSettings, User
from backend.schemas import (
    NotificationResponse,
    NotificationCreate,
    NotificationUpdate,
    UserNotificationSettingsResponse,
    UserNotificationSettingsUpdate,
    UserNotificationSettingsCreate,
    CurrentUser
)
from backend.database import SessionLocal
from backend.routers.auth import require_admin

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 50,
    unread_only: bool = False,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user."""
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    query = query.order_by(Notification.created_at.desc()).limit(limit)

    return query.all()


@router.put("/mark-all-read")
def mark_all_notifications_read(
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user."""
    try:
        updated_count = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).update({"is_read": True})

        db.commit()

        return {"message": f"Marked {updated_count} notifications as read"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.get("/unread-count", response_model=dict)
def get_unread_count(
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get the count of unread notifications for the current user."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {"unread_count": count}


# User Notification Settings endpoints
@router.get("/settings")
def get_notification_settings(
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get notification settings for the current user."""
    try:
        # Try to get settings with all columns first
        try:
            settings = db.query(UserNotificationSettings).filter(
                UserNotificationSettings.user_id == current_user.id
            ).first()
        except Exception as db_error:
            # If columns don't exist, create a minimal settings object
            if "browser_support_requests" in str(db_error) or "browser_user_created" in str(db_error):
                # Get basic settings without browser columns
                from sqlalchemy import text
                result = db.execute(text("""
                    SELECT id, user_id, email_support_requests, email_user_created, 
                           system_support_requests, system_user_created, created_at, updated_at
                    FROM user_notification_settings 
                    WHERE user_id = :user_id
                    LIMIT 1
                """), {"user_id": current_user.id}).fetchone()

                if result:
                    # Create a dict-like object with default browser settings
                    settings = type('Settings', (), {
                        'id': result[0],
                        'user_id': result[1],
                        'email_support_requests': result[2],
                        'email_user_created': result[3],
                        'system_support_requests': result[4],
                        'system_user_created': result[5],
                        'browser_support_requests': True,  # Default value
                        'browser_user_created': True,      # Default value
                        'created_at': result[6],
                        'updated_at': result[7]
                    })()
                else:
                    settings = None
            else:
                raise db_error

        if not settings:
            # Create default settings if they don't exist
            try:
                settings = UserNotificationSettings(
                    user_id=current_user.id,
                    email_support_requests=True,
                    email_user_created=True,
                    system_support_requests=True,
                    system_user_created=True,
                    browser_support_requests=True,
                    browser_user_created=True
                )
                db.add(settings)
                db.commit()
                db.refresh(settings)
            except Exception as create_error:
                if "browser_support_requests" in str(create_error) or "browser_user_created" in str(create_error):
                    # Create settings without browser columns
                    from sqlalchemy import text
                    db.execute(text("""
                        INSERT INTO user_notification_settings 
                        (user_id, email_support_requests, email_user_created, 
                         system_support_requests, system_user_created, created_at, updated_at)
                        VALUES (:user_id, :email_support_requests, :email_user_created, 
                                :system_support_requests, :system_user_created, NOW(), NOW())
                    """), {
                        "user_id": current_user.id,
                        "email_support_requests": True,
                        "email_user_created": True,
                        "system_support_requests": True,
                        "system_user_created": True
                    })
                    db.commit()

                    # Return the created settings with default browser values
                    settings = type('Settings', (), {
                        'id': 1,  # This will be the actual ID from the database
                        'user_id': current_user.id,
                        'email_support_requests': True,
                        'email_user_created': True,
                        'system_support_requests': True,
                        'system_user_created': True,
                        'browser_support_requests': True,  # Default value
                        'browser_user_created': True,      # Default value
                        'created_at': None,
                        'updated_at': None
                    })()
                else:
                    raise create_error

        return settings
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.put("/settings")
def update_notification_settings(
    payload: UserNotificationSettingsUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update notification settings for the current user."""
    try:
        # Try to update using ORM first
        try:
            settings = db.query(UserNotificationSettings).filter(
                UserNotificationSettings.user_id == current_user.id
            ).first()

            if not settings:
                # Create settings if they don't exist
                settings = UserNotificationSettings(user_id=current_user.id)
                db.add(settings)

            # Update only provided fields
            if payload.email_support_requests is not None:
                settings.email_support_requests = payload.email_support_requests
            if payload.email_user_created is not None:
                settings.email_user_created = payload.email_user_created
            if payload.system_support_requests is not None:
                settings.system_support_requests = payload.system_support_requests
            if payload.system_user_created is not None:
                settings.system_user_created = payload.system_user_created
            if payload.browser_support_requests is not None:
                settings.browser_support_requests = payload.browser_support_requests
            if payload.browser_user_created is not None:
                settings.browser_user_created = payload.browser_user_created

            db.commit()
            db.refresh(settings)

            return settings

        except Exception as orm_error:
            # If browser columns don't exist, use raw SQL
            if "browser_support_requests" in str(orm_error) or "browser_user_created" in str(orm_error):
                from sqlalchemy import text

                # Build dynamic update query
                update_fields = []
                params = {"user_id": current_user.id}

                if payload.email_support_requests is not None:
                    update_fields.append(
                        "email_support_requests = :email_support_requests")
                    params["email_support_requests"] = payload.email_support_requests

                if payload.email_user_created is not None:
                    update_fields.append(
                        "email_user_created = :email_user_created")
                    params["email_user_created"] = payload.email_user_created

                if payload.system_support_requests is not None:
                    update_fields.append(
                        "system_support_requests = :system_support_requests")
                    params["system_support_requests"] = payload.system_support_requests

                if payload.system_user_created is not None:
                    update_fields.append(
                        "system_user_created = :system_user_created")
                    params["system_user_created"] = payload.system_user_created

                if update_fields:
                    update_fields.append("updated_at = NOW()")
                    query = f"""
                        UPDATE user_notification_settings 
                        SET {', '.join(update_fields)}
                        WHERE user_id = :user_id
                    """
                    db.execute(text(query), params)
                    db.commit()

                # Return the updated settings (fetch current state)
                result = db.execute(text("""
                    SELECT id, user_id, email_support_requests, email_user_created, 
                           system_support_requests, system_user_created, created_at, updated_at
                    FROM user_notification_settings 
                    WHERE user_id = :user_id
                    LIMIT 1
                """), {"user_id": current_user.id}).fetchone()

                if result:
                    settings = type('Settings', (), {
                        'id': result[0],
                        'user_id': result[1],
                        'email_support_requests': result[2],
                        'email_user_created': result[3],
                        'system_support_requests': result[4],
                        'system_user_created': result[5],
                        'browser_support_requests': True,  # Default value
                        'browser_user_created': True,      # Default value
                        'created_at': result[6],
                        'updated_at': result[7]
                    })()
                    return settings
                else:
                    raise HTTPException(
                        status_code=404, detail="Settings not found")
            else:
                raise orm_error

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


# Internal function to create notifications
def create_notification(
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    notification_data: dict = None,
    db: Session = None
):
    """Create a notification for a user. Used internally by other services."""
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False

    try:
        print(
            f"[DEBUG] Creating notification: user_id={user_id}, type={notification_type}, title='{title}'")
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            notification_data=notification_data
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        print(
            f"[DEBUG] Notification created successfully with ID: {notification.id}")

        if should_close:
            db.close()

        return notification
    except Exception as e:
        print(f"[DEBUG] Error creating notification: {e}")
        if should_close:
            db.close()
        raise e


# Individual notification endpoints (these must come AFTER specific routes)
@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get a specific notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return notification


@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    notification_id: int,
    payload: NotificationUpdate,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a notification (mark as read/unread)."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if payload.is_read is not None:
        notification.is_read = payload.is_read

    db.commit()
    db.refresh(notification)

    return notification
