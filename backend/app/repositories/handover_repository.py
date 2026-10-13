"""
repositories/handover_repository.py - Handover records repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class HandoverRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("handover_records")

    def get_by_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        return self.find_one(order_id=order_id)

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self.filter_fn(
            lambda r: r.get("handed_over_by") == user_id or r.get("received_by") == user_id
        )


_instance: Optional[HandoverRepository] = None


def get_handover_repository() -> HandoverRepository:
    global _instance
    if _instance is None:
        _instance = HandoverRepository()
    return _instance

