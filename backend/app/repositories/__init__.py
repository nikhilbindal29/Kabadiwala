"""
app/repositories/__init__.py - Domain repositories wrapping the CSV storage layer.
"""
from app.repositories.base import BaseRepository
from app.repositories.user_repository import UserRepository, get_user_repository
from app.repositories.listing_repository import ListingRepository, get_listing_repository
from app.repositories.pickup_repository import PickupRepository, get_pickup_repository
from app.repositories.inventory_repository import InventoryRepository, get_inventory_repository
from app.repositories.offer_repository import OfferRepository, get_offer_repository
from app.repositories.order_repository import OrderRepository, get_order_repository
from app.repositories.transaction_repository import (
    TransactionRepository,
    PaymentRepository,
    get_transaction_repository,
    get_payment_repository,
)
from app.repositories.handover_repository import HandoverRepository, get_handover_repository
from app.repositories.recycler_doc_repository import RecyclerDocRepository, get_recycler_doc_repository
from app.repositories.notification_repository import NotificationRepository, get_notification_repository
from app.repositories.support_repository import (
    SupportTicketRepository,
    DisputeRepository,
    get_support_repository,
    get_dispute_repository,
)
from app.repositories.audit_repository import AuditRepository, get_audit_repository
from app.repositories.settings_repository import (
    MaterialCategoryRepository,
    ServiceAreaRepository,
    AppSettingsRepository,
    UserAddressRepository,
    get_category_repository,
    get_service_area_repository,
    get_settings_repository,
    get_address_repository,
)

__all__ = [
    "BaseRepository",
    "UserRepository", "get_user_repository",
    "ListingRepository", "get_listing_repository",
    "PickupRepository", "get_pickup_repository",
    "InventoryRepository", "get_inventory_repository",
    "OfferRepository", "get_offer_repository",
    "OrderRepository", "get_order_repository",
    "TransactionRepository", "get_transaction_repository",
    "PaymentRepository", "get_payment_repository",
    "HandoverRepository", "get_handover_repository",
    "RecyclerDocRepository", "get_recycler_doc_repository",
    "NotificationRepository", "get_notification_repository",
    "SupportTicketRepository", "get_support_repository",
    "DisputeRepository", "get_dispute_repository",
    "AuditRepository", "get_audit_repository",
    "MaterialCategoryRepository", "get_category_repository",
    "ServiceAreaRepository", "get_service_area_repository",
    "AppSettingsRepository", "get_settings_repository",
    "UserAddressRepository", "get_address_repository",
]
