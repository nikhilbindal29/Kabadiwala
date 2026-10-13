"""
repositories/pickup_repository.py - Pickup requests repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class PickupRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("pickup_requests")

    def get_by_seller(self, seller_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(seller_id=seller_id)

    def get_by_collector(self, collector_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(collector_id=collector_id)

    def get_available(self) -> List[Dict[str, Any]]:
        return self._store.find_by(status="REQUESTED")

    def get_by_listing(self, listing_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(listing_id=listing_id)


_instance: Optional[PickupRepository] = None


def get_pickup_repository() -> PickupRepository:
    global _instance
    if _instance is None:
        _instance = PickupRepository()
    return _instance

