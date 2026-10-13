"""
repositories/notification_repository.py - User notifications repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class NotificationRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("notifications")

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        rows = self._store.find_by(user_id=user_id)
        rows.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return rows

    def get_unread_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return [
            r for r in self.get_by_user(user_id)
            if str(r.get("is_read", "")).lower() in ("false", "0", "")
        ]

    def mark_all_as_read(self, user_id: str) -> int:
        unread = self.get_unread_by_user(user_id)
        count = 0
        for item in unread:
            rec_id = item.get("id")
            if rec_id:
                self._store.update(rec_id, {"is_read": "true"})
                count += 1
        return count


_instance: Optional[NotificationRepository] = None


def get_notification_repository() -> NotificationRepository:
    global _instance
    if _instance is None:
        _instance = NotificationRepository()
    return _instance

