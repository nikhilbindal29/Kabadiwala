"""
schemas/notification.py - Notification schemas.
"""
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    body: str
    notification_type: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    is_read: bool = False
    created_at: str

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    body: str
    notification_type: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
