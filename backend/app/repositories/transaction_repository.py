"""
repositories/transaction_repository.py - Transactions and payments repositories.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class TransactionRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("transactions")

    def get_by_order(self, order_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(order_id=order_id)


class PaymentRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("payments")

    def get_by_order(self, order_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(order_id=order_id)

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self.filter_fn(
            lambda r: r.get("payer_id") == user_id or r.get("payee_id") == user_id
        )


_tx_instance: Optional[TransactionRepository] = None
_pay_instance: Optional[PaymentRepository] = None


def get_transaction_repository() -> TransactionRepository:
    global _tx_instance
    if _tx_instance is None:
        _tx_instance = TransactionRepository()
    return _tx_instance


def get_payment_repository() -> PaymentRepository:
    global _pay_instance
    if _pay_instance is None:
        _pay_instance = PaymentRepository()
    return _pay_instance

