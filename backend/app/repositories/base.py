"""
repositories/base.py - Base repository mixin with common query helpers.
"""
from typing import Any, Callable, Dict, List, Optional

from app.storage.csv_repository import CSVRepository


class BaseRepository:
    """
    Thin wrapper around CSVRepository providing typed helpers.

    Sub-classes inject a CSVRepository via `_store`.
    """

    _store: CSVRepository

    def get_all(self) -> List[Dict[str, Any]]:
        return self._store.find_all()

    def get_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        return self._store.find_by_id(record_id)

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._store.insert(data)

    def update(self, record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return self._store.update(record_id, data)

    def delete(self, record_id: str) -> bool:
        return self._store.delete(record_id)

    def filter_by(self, **kwargs: Any) -> List[Dict[str, Any]]:
        return self._store.find_by(**kwargs)

    def find_one(self, **kwargs: Any) -> Optional[Dict[str, Any]]:
        return self._store.find_one_by(**kwargs)

    def count(self) -> int:
        return self._store.count()

    def filter_fn(self, predicate: Callable[[Dict[str, Any]], bool]) -> List[Dict[str, Any]]:
        """Filter records using an arbitrary predicate function."""
        return [r for r in self._store.find_all() if predicate(r)]
