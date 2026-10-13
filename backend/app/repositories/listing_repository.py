"""
repositories/listing_repository.py - Listing CRUD repository.
"""
from typing import Any, Dict, List, Optional

from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class ListingRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("listings")

    def get_by_seller(self, seller_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(seller_id=seller_id)

    def get_active(self) -> List[Dict[str, Any]]:
        return self._store.find_by(status="active")

    def get_by_category(self, category: str) -> List[Dict[str, Any]]:
        return self._store.find_by(material_category=category)

    def get_by_city(self, city: str) -> List[Dict[str, Any]]:
        return self.filter_fn(lambda r: r.get("city", "").lower() == city.lower())


_instance: Optional[ListingRepository] = None


def get_listing_repository() -> ListingRepository:
    global _instance
    if _instance is None:
        _instance = ListingRepository()
    return _instance
