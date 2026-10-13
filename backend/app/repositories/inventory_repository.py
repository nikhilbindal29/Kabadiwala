"""
repositories/inventory_repository.py - Collector inventory lots repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class InventoryRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("inventory_lots")

    def get_by_collector(self, collector_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(collector_id=collector_id)

    def get_available(self) -> List[Dict[str, Any]]:
        return self._store.find_by(status="ACTIVE")

    def get_by_category(self, category: str) -> List[Dict[str, Any]]:
        return self._store.find_by(material_category=category)

    def get_by_city(self, city: str) -> List[Dict[str, Any]]:
        return self.filter_fn(lambda r: r.get("city", "").lower() == city.lower())


_instance: Optional[InventoryRepository] = None


def get_inventory_repository() -> InventoryRepository:
    global _instance
    if _instance is None:
        _instance = InventoryRepository()
    return _instance

