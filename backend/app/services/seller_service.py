"""
services/seller_service.py - Seller portal business logic.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.repositories.listing_repository import get_listing_repository
from app.repositories.pickup_repository import get_pickup_repository
from app.repositories.offer_repository import get_offer_repository
from app.repositories.order_repository import get_order_repository
from app.repositories.transaction_repository import get_transaction_repository
from app.services.notification_service import get_notification_service
from app.validators.business_rules import validate_ownership, validate_transition


class SellerService:
    def __init__(self) -> None:
        self.listing_repo = get_listing_repository()
        self.pickup_repo = get_pickup_repository()
        self.offer_repo = get_offer_repository()
        self.order_repo = get_order_repository()
        self.tx_repo = get_transaction_repository()
        self.notif_service = get_notification_service()

    def get_dashboard(self, seller_id: str) -> Dict[str, Any]:
        all_listings = self.listing_repo.get_by_seller(seller_id)
        active_listings = [l for l in all_listings if l.get("status") == "ACTIVE"]

        pickups = self.pickup_repo.get_by_seller(seller_id)
        pending_pickups = [p for p in pickups if p.get("status") in ("REQUESTED", "ACCEPTED", "SCHEDULED")]

        orders = self.order_repo.get_by_user(seller_id, role="SELLER")
        completed_orders = [o for o in orders if o.get("status") == "COMPLETED"]

        recent_listings = sorted(all_listings, key=lambda x: x.get("created_at", ""), reverse=True)[:5]

        # Calculate revenue from completed orders
        total_earnings = sum(float(o.get("agreed_price") or 0) for o in completed_orders)

        return {
            "active_listings_count": len(active_listings),
            "pending_pickups_count": len(pending_pickups),
            "completed_sales_count": len(completed_orders),
            "total_earnings": total_earnings,
            "recent_listings": recent_listings,
            "recent_pickups": pickups[:5],
        }

    def list_listings(
        self,
        seller_id: str,
        status_filter: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        listings = self.listing_repo.get_by_seller(seller_id)
        if status_filter:
            listings = [l for l in listings if l.get("status") == status_filter.upper()]
        if category:
            listings = [l for l in listings if l.get("material_category") == category]
        return sorted(listings, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_listing(self, listing_id: str, seller_id: str) -> Dict[str, Any]:
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
        validate_ownership(listing, seller_id, owner_field="seller_id")
        return listing

    def create_listing(self, seller_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        record = {
            **data,
            "seller_id": seller_id,
            "status": data.get("status", "ACTIVE").upper(),
        }
        created = self.listing_repo.create(record)

        # If user directly requested pickup at creation time
        if data.get("request_pickup", False) or data.get("pickup_address"):
            self.pickup_repo.create({
                "listing_id": created["id"],
                "seller_id": seller_id,
                "collector_id": "",
                "pickup_address": data.get("pickup_address", ""),
                "scheduled_at": data.get("scheduled_at", ""),
                "actual_scheduled_at": "",
                "status": "REQUESTED",
                "actual_weight_kg": "",
                "collection_notes": "",
                "evidence_paths": "",
            })

        return created

    def update_listing(self, listing_id: str, seller_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
        validate_ownership(listing, seller_id, owner_field="seller_id")

        if "status" in data:
            validate_transition("listing", listing.get("status", "ACTIVE"), data["status"])

        updated = self.listing_repo.update(listing_id, data)
        return updated or listing

    def cancel_listing(self, listing_id: str, seller_id: str) -> Dict[str, Any]:
        return self.update_listing(listing_id, seller_id, {"status": "CANCELLED"})

    def request_pickup(self, listing_id: str, seller_id: str, pickup_address: str, scheduled_at: str) -> Dict[str, Any]:
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
        validate_ownership(listing, seller_id, owner_field="seller_id")

        existing = self.pickup_repo.get_by_listing(listing_id)
        active_pickups = [p for p in existing if p.get("status") not in ("CANCELLED", "REJECTED")]
        if active_pickups:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A pickup request already exists for this listing.",
            )

        return self.pickup_repo.create({
            "listing_id": listing_id,
            "seller_id": seller_id,
            "collector_id": "",
            "pickup_address": pickup_address,
            "scheduled_at": scheduled_at,
            "actual_scheduled_at": "",
            "status": "REQUESTED",
            "actual_weight_kg": "",
            "collection_notes": "",
            "evidence_paths": "",
        })

    def get_pickup_requests(self, seller_id: str) -> List[Dict[str, Any]]:
        return self.pickup_repo.get_by_seller(seller_id)

    def get_orders(self, seller_id: str) -> List[Dict[str, Any]]:
        return self.order_repo.get_by_user(seller_id, role="SELLER")

    def get_transactions(self, seller_id: str) -> List[Dict[str, Any]]:
        orders = self.get_orders(seller_id)
        order_ids = {o["id"] for o in orders}
        all_tx = self.tx_repo.get_all()
        return [t for t in all_tx if t.get("order_id") in order_ids]


_instance: Optional[SellerService] = None


def get_seller_service() -> SellerService:
    global _instance
    if _instance is None:
        _instance = SellerService()
    return _instance

