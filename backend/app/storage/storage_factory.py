"""
storage/storage_factory.py - Factory for creating repository instances.
"""
from pathlib import Path
from typing import Dict, List

from app.storage.csv_repository import CSVRepository
from app import config

# ── CSV header definitions ────────────────────────────────────────────────────

CSV_SCHEMAS: Dict[str, List[str]] = {
    "users": [
        "id", "full_name", "email", "phone", "password_hash", "role",
        "account_status", "verification_status", "preferred_language",
        "city", "locality", "seller_type", "business_name", "business_details",
        "service_locations", "material_categories", "capacity",
        "facility_address", "authorization_details", "created_at", "updated_at",
    ],
    "listings": [
        "id", "seller_id", "title", "material_category", "subcategory",
        "description", "condition", "quantity", "unit", "estimated_weight_kg",
        "price_expectation", "image_paths", "pickup_address", "city", "locality",
        "status", "created_at", "updated_at",
    ],
    "pickup_requests": [
        "id", "listing_id", "seller_id", "collector_id", "pickup_address",
        "scheduled_at", "actual_scheduled_at", "status", "actual_weight_kg",
        "collection_notes", "evidence_paths", "created_at", "updated_at",
    ],
    "inventory_lots": [
        "id", "collector_id", "source_listing_id", "source_pickup_id",
        "material_category", "subcategory", "quantity", "unit", "weight_kg",
        "condition", "grade", "asking_price", "city", "status",
        "image_paths", "created_at", "updated_at",
    ],
    "offers": [
        "id", "lot_id", "buyer_id", "offer_price", "quantity", "unit",
        "transport_cost_estimate", "valid_until", "status", "notes",
        "created_at", "updated_at",
    ],
    "orders": [
        "id", "offer_id", "listing_id", "lot_id", "seller_id", "collector_id",
        "buyer_id", "recycler_id", "quantity", "unit", "agreed_price",
        "status", "created_at", "updated_at",
    ],
    "transactions": [
        "id", "order_id", "transaction_type", "amount", "currency",
        "status", "recorded_at", "reference", "notes",
    ],
    "payments": [
        "id", "order_id", "payer_id", "payee_id", "amount", "currency",
        "method", "status", "external_reference", "created_at", "updated_at",
    ],
    "handover_records": [
        "id", "order_id", "handed_over_by", "received_by", "quantity", "unit",
        "weight_kg", "condition", "evidence_paths", "confirmed_at",
        "status", "notes",
    ],
    "recycler_documents": [
        "id", "recycler_id", "document_type", "file_path", "document_reference",
        "expiry_date", "verification_status", "reviewed_by", "reviewed_at", "notes",
    ],
    "notifications": [
        "id", "user_id", "title", "body", "notification_type",
        "related_entity_type", "related_entity_id", "is_read", "created_at",
    ],
    "support_tickets": [
        "id", "user_id", "subject", "description", "status", "category",
        "priority", "assigned_to", "resolution", "created_at", "updated_at",
    ],
    "disputes": [
        "id", "order_id", "raised_by", "against_user_id", "reason",
        "description", "status", "resolution", "resolved_by",
        "created_at", "updated_at",
    ],
    "material_categories": [
        "id", "name", "name_hi", "parent_id", "subcategories",
        "is_active", "sort_order", "created_at",
    ],
    "service_areas": [
        "id", "city", "state", "pincode_ranges", "is_active", "created_at",
    ],
    "app_settings": [
        "id", "key", "value", "description", "updated_by", "updated_at",
    ],
    "audit_log": [
        "id", "user_id", "action", "entity_type", "entity_id",
        "old_values", "new_values", "ip_address", "created_at",
    ],
    "user_addresses": [
        "id", "user_id", "label", "address_line1", "address_line2",
        "city", "state", "pincode", "latitude", "longitude",
        "is_default", "created_at", "updated_at",
    ],
}

# ── Factory ───────────────────────────────────────────────────────────────────

_repo_cache: Dict[str, CSVRepository] = {}


def get_repo(name: str) -> CSVRepository:
    """
    Return a cached CSVRepository for the given table name.

    Args:
        name: Key in CSV_SCHEMAS (e.g. "users", "listings").

    Raises:
        ValueError: If name is unknown.
    """
    if name not in _repo_cache:
        if name not in CSV_SCHEMAS:
            raise ValueError(f"Unknown CSV table: '{name}'")
        headers = CSV_SCHEMAS[name]
        file_path = config.CSV_DIR / f"{name}.csv"
        _repo_cache[name] = CSVRepository(file_path=file_path, headers=headers)
    return _repo_cache[name]


def initialize_all_csv_files() -> None:
    """
    Ensure all CSV files exist with correct headers.
    Called on application startup.
    """
    config.ensure_dirs()
    for name in CSV_SCHEMAS:
        get_repo(name)
