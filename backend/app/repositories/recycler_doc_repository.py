"""
repositories/recycler_doc_repository.py - Recycler compliance documents repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class RecyclerDocRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("recycler_documents")

    def get_by_recycler(self, recycler_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(recycler_id=recycler_id)

    def get_pending_review(self) -> List[Dict[str, Any]]:
        return self._store.find_by(verification_status="pending")


_instance: Optional[RecyclerDocRepository] = None


def get_recycler_doc_repository() -> RecyclerDocRepository:
    global _instance
    if _instance is None:
        _instance = RecyclerDocRepository()
    return _instance

