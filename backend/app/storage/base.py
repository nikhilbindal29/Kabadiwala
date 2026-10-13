"""
storage/base.py - Abstract base for storage adapters.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseStorage(ABC):
    """Abstract storage interface."""

    @abstractmethod
    def find_all(self) -> List[Dict[str, Any]]:
        ...

    @abstractmethod
    def find_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def insert(self, record: Dict[str, Any]) -> Dict[str, Any]:
        ...

    @abstractmethod
    def update(self, record_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def delete(self, record_id: str) -> bool:
        ...

    @abstractmethod
    def find_by(self, **kwargs: Any) -> List[Dict[str, Any]]:
        ...
