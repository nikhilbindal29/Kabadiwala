"""
repositories/audit_repository.py - Audit logging repository.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class AuditRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("audit_log")

    def log(
        self,
        user_id: str,
        action: str,
        entity_type: str = "",
        entity_id: str = "",
        old_values: str = "",
        new_values: str = "",
        ip_address: str = "",
    ) -> Dict[str, Any]:
        return self.create({
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "old_values": old_values,
            "new_values": new_values,
            "ip_address": ip_address,
        })

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(user_id=user_id)


_instance: Optional[AuditRepository] = None


def get_audit_repository() -> AuditRepository:
    global _instance
    if _instance is None:
        _instance = AuditRepository()
    return _instance

