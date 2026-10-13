"""
repositories/order_repository.py - Orders repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo

class OrderRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("orders")

    def get_by_user(self, user_id: str, role: Optional[str] = None) -> List[Dict[str, Any]]:
        if role == "SELLER":
            return self._store.find_by(seller_id=user_id)
        elif role == "COLLECTOR":
            return self._store.find_by(collector_id=user_id)
        elif role == "BUYER":
            return self._store.find_by(buyer_id=user_id)
        elif role == "RECYCLER":
            return self._store.find_by(recycler_id=user_id)
        return self.filter_fn(
            lambda r: r.get("seller_id") == user_id
            or r.get("collector_id") == user_id
            or r.get("buyer_id") == user_id
            or r.get("recycler_id") == user_id
        )

    def get_by_offer(self, offer_id: str) -> Optional[Dict[str, Any]]:
        return self.find_one(offer_id=offer_id)
    
_instance: Optional[OrderRepository] = None


def get_order_repository() -> OrderRepository:
    global _instance
    if _instance is None:
        _instance = OrderRepository()
    return _instance
