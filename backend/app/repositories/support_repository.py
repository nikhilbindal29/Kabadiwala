"""
repositories/support_repository.py - Support tickets and disputes repositories.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class SupportTicketRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("support_tickets")

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(user_id=user_id)

    def get_open(self) -> List[Dict[str, Any]]:
        return self.filter_fn(lambda r: r.get("status") in ("open", "pending", "in_progress"))


class DisputeRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("disputes")

    def get_by_order(self, order_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(order_id=order_id)

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self.filter_fn(
            lambda r: r.get("raised_by") == user_id or r.get("against_user_id") == user_id
        )

    def get_open(self) -> List[Dict[str, Any]]:
        return self.filter_fn(lambda r: r.get("status") in ("open", "investigating", "pending"))


_ticket_instance: Optional[SupportTicketRepository] = None
_dispute_instance: Optional[DisputeRepository] = None


def get_support_repository() -> SupportTicketRepository:
    global _ticket_instance
    if _ticket_instance is None:
        _ticket_instance = SupportTicketRepository()
    return _ticket_instance


def get_dispute_repository() -> DisputeRepository:
    global _dispute_instance
    if _dispute_instance is None:
        _dispute_instance = DisputeRepository()
    return _dispute_instance

