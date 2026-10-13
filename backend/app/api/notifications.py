"""
api/notifications.py - User notifications endpoints.
"""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.services.notification_service import get_notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_my_notifications(user: Dict[str, Any] = Depends(get_current_user)):
    service = get_notification_service()
    return service.get_for_user(user["id"])


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    service = get_notification_service()
    return service.mark_read(notification_id, user["id"])


@router.put("/read-all")
def mark_all_notifications_read(user: Dict[str, Any] = Depends(get_current_user)):
    service = get_notification_service()
    count = service.mark_all_read(user["id"])
    return {"marked_read_count": count}

