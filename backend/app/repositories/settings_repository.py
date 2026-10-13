"""
repositories/settings_repository.py - Categories, Service Areas, Settings & Addresses.
"""
from typing import Any, Dict, List, Optional
from app.repositories.base import BaseRepository
from app.storage.storage_factory import get_repo


class MaterialCategoryRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("material_categories")

    def get_active(self) -> List[Dict[str, Any]]:
        return self._store.find_by(is_active="true")


class ServiceAreaRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("service_areas")

    def get_active(self) -> List[Dict[str, Any]]:
        return self._store.find_by(is_active="true")


class AppSettingsRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("app_settings")

    def get_value(self, key: str, default: Optional[str] = None) -> Optional[str]:
        row = self.find_one(key=key)
        return row.get("value") if row else default

    def set_value(self, key: str, value: str, description: str = "", user_id: str = "") -> Dict[str, Any]:
        existing = self.find_one(key=key)
        if existing:
            return self.update(existing["id"], {"value": value, "description": description, "updated_by": user_id}) or {}
        return self.create({"key": key, "value": value, "description": description, "updated_by": user_id})


class UserAddressRepository(BaseRepository):
    def __init__(self) -> None:
        self._store = get_repo("user_addresses")

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return self._store.find_by(user_id=user_id)


_cat_instance: Optional[MaterialCategoryRepository] = None
_area_instance: Optional[ServiceAreaRepository] = None
_set_instance: Optional[AppSettingsRepository] = None
_addr_instance: Optional[UserAddressRepository] = None


def get_category_repository() -> MaterialCategoryRepository:
    global _cat_instance
    if _cat_instance is None:
        _cat_instance = MaterialCategoryRepository()
    return _cat_instance


def get_service_area_repository() -> ServiceAreaRepository:
    global _area_instance
    if _area_instance is None:
        _area_instance = ServiceAreaRepository()
    return _area_instance


def get_settings_repository() -> AppSettingsRepository:
    global _set_instance
    if _set_instance is None:
        _set_instance = AppSettingsRepository()
    return _set_instance


def get_address_repository() -> UserAddressRepository:
    global _addr_instance
    if _addr_instance is None:
        _addr_instance = UserAddressRepository()
    return _addr_instance

