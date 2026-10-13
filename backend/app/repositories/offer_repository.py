"""
repositories/offer_repository.py - Offers repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class OfferRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("offers")

    def get_by_buyer(self, buyer_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(buyer_id=buyer_id)

    def get_by_lot(self, lot_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(lot_id=lot_id)

    def get_pending_by_lot(self, lot_id: str) -> List[Dict[str, Any]]:
        return [r for r in self._store.find_by(lot_id=lot_id) if r.get("status") == "PENDING"]


_instance: Optional[OfferRepository] = None


def get_offer_repository() -> OfferRepository:
    global _instance
    if _instance is None:
        _instance = OfferRepository()
    return _instance

