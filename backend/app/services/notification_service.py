"""
services/notification_service.py - In-app notifications service.
"""
from typing import Any, Dict, List, Optional
from app.repositories.notification_repository import get_notification_repository
class NotificationService:
    def __init__(self) -> None:
        self.repo = get_notification_repository()
    def send(
        self,
        user_id: str,
        title: str,
        body: str,
        notification_type: str = "SYSTEM",
        related_entity_type: str = "",
        related_entity_id: str = "",
    ) -> Dict[str, Any]:
        return self.repo.create({
            "user_id": user_id,
            "title": title,
            "body": body,
            "notification_type": notification_type,
            "related_entity_type": related_entity_type,
            "related_entity_id": related_entity_id,
            "is_read": "false",
        })

    def get_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self.repo.get_by_user(user_id)

    def mark_read(self, notification_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        record = self.repo.get_by_id(notification_id)
        if record and record.get("user_id") == user_id:
            return self.repo.update(notification_id, {"is_read": "true"})
        return None

    def mark_all_read(self, user_id: str) -> int:
        return self.repo.mark_all_as_read(user_id)


_instance: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    global _instance
    if _instance is None:
        _instance = NotificationService()
    return _instance
