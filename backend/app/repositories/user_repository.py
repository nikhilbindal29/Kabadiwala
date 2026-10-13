"""
repositories/user_repository.py - User CRUD repository.
"""
from typing import Any, Dict, List, Optional

from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class UserRepository(BaseRepository):
    """Repository for the users CSV table."""

    def __init__(self) -> None:
        self._store = get_repo("users")

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find a user by email address (case-insensitive)."""
        email_lower = email.lower()
        for row in self._store.find_all():
            if row.get("email", "").lower() == email_lower:
                return row
        return None

    def email_exists(self, email: str) -> bool:
        return self.get_by_email(email) is not None

    def get_by_role(self, role: str) -> List[Dict[str, Any]]:
        return self._store.find_by(role=role)

    def get_by_status(self, account_status: str) -> List[Dict[str, Any]]:
        return self._store.find_by(account_status=account_status)

    def get_active_users(self) -> List[Dict[str, Any]]:
        return self._store.find_by(account_status="active")


_instance: Optional[UserRepository] = None


def get_user_repository() -> UserRepository:
    global _instance
    if _instance is None:
        _instance = UserRepository()
    return _instance
