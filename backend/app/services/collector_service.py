"""
services/collector_service.py - Collector / Kabadiwala portal business logic.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from app.repositories.pickup_repository import get_pickup_repository
from app.repositories.inventory_repository import get_inventory_repository
from app.repositories.offer_repository import get_offer_repository
from app.repositories.order_repository import get_order_repository
from app.repositories.listing_repository import get_listing_repository
from app.repositories.transaction_repository import get_transaction_repository
from app.services.notification_service import get_notification_service
from app.validators.business_rules import validate_ownership, validate_transition, validate_quantity_availability


class CollectorService:
    def __init__(self) -> None:
        self.pickup_repo = get_pickup_repository()
        self.inv_repo = get_inventory_repository()
        self.offer_repo = get_offer_repository()
        self.order_repo = get_order_repository()
        self.listing_repo = get_listing_repository()
        self.tx_repo = get_transaction_repository()
        self.notif_service = get_notification_service()

    def get_dashboard(self, collector_id: str) -> Dict[str, Any]:
        available_pickups = self.pickup_repo.get_available()
        my_pickups = self.pickup_repo.get_by_collector(collector_id)
        scheduled = [p for p in my_pickups if p.get("status") in ("ACCEPTED", "SCHEDULED", "IN_PROGRESS")]

        inventory = self.inv_repo.get_by_collector(collector_id)
        active_lots = [i for i in inventory if i.get("status") == "ACTIVE"]
        total_inv_kg = sum(float(i.get("weight_kg") or 0) for i in active_lots)

        # Pending offers on collector's lots
        lot_ids = {lot["id"] for lot in inventory}
        pending_offers = [o for o in self.offer_repo.get_all() if o.get("lot_id") in lot_ids and o.get("status") == "PENDING"]

        # Completed sales & earnings
        orders = self.order_repo.get_by_user(collector_id, role="COLLECTOR")
        completed_orders = [o for o in orders if o.get("status") == "COMPLETED"]
        earnings = sum(float(o.get("agreed_price") or 0) for o in completed_orders)

        return {
            "available_pickups_count": len(available_pickups),
            "scheduled_pickups_count": len(scheduled),
            "inventory_lots_count": len(active_lots),
            "total_inventory_weight_kg": total_inv_kg,
            "pending_offers_count": len(pending_offers),
            "completed_sales_count": len(completed_orders),
            "total_earnings": earnings,
            "recent_pickups": my_pickups[:5],
            "recent_inventory": inventory[:5],
        }

    def get_available_pickups(self, city: Optional[str] = None) -> List[Dict[str, Any]]:
        pickups = self.pickup_repo.get_available()
        if city:
            city_lower = city.lower()
            filtered = []
            for p in pickups:
                listing = self.listing_repo.get_by_id(p.get("listing_id", ""))
                if listing and listing.get("city", "").lower() == city_lower:
                    filtered.append({**p, "listing": listing})
                elif not listing:
                    filtered.append(p)
            return filtered
        # Enrich with listing details
        enriched = []
        for p in pickups:
            listing = self.listing_repo.get_by_id(p.get("listing_id", ""))
            enriched.append({**p, "listing": listing})
        return enriched

    def accept_pickup(self, pickup_id: str, collector_id: str) -> Dict[str, Any]:
        pickup = self.pickup_repo.get_by_id(pickup_id)
        if not pickup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup request not found.")
        if pickup.get("status") != "REQUESTED":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pickup is no longer available.")

        updated = self.pickup_repo.update(pickup_id, {
            "collector_id": collector_id,
            "status": "ACCEPTED",
        })

        # Notify seller
        self.notif_service.send(
            user_id=pickup["seller_id"],
            title="Pickup Accepted",
            body="A local collector has accepted your pickup request.",
            notification_type="PICKUP",
            related_entity_type="pickup_requests",
            related_entity_id=pickup_id,
        )
        return updated or pickup

    def schedule_pickup(self, pickup_id: str, collector_id: str, scheduled_time: str) -> Dict[str, Any]:
        pickup = self.pickup_repo.get_by_id(pickup_id)
        if not pickup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup not found.")
        validate_ownership(pickup, collector_id, owner_field="collector_id")

        updated = self.pickup_repo.update(pickup_id, {
            "actual_scheduled_at": scheduled_time,
            "status": "SCHEDULED",
        })

        self.notif_service.send(
            user_id=pickup["seller_id"],
            title="Pickup Scheduled",
            body=f"Your pickup has been scheduled for {scheduled_time}.",
            notification_type="PICKUP",
            related_entity_type="pickup_requests",
            related_entity_id=pickup_id,
        )
        return updated or pickup

    def complete_pickup(
        self,
        pickup_id: str,
        collector_id: str,
        actual_weight_kg: float,
        notes: str = "",
        evidence_paths: str = "",
    ) -> Dict[str, Any]:
        pickup = self.pickup_repo.get_by_id(pickup_id)
        if not pickup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup not found.")
        validate_ownership(pickup, collector_id, owner_field="collector_id")

        updated = self.pickup_repo.update(pickup_id, {
            "actual_weight_kg": actual_weight_kg,
            "collection_notes": notes,
            "evidence_paths": evidence_paths,
            "status": "COMPLETED",
        })

        # Update listing status to SOLD
        listing_id = pickup.get("listing_id")
        if listing_id:
            self.listing_repo.update(listing_id, {"status": "SOLD"})

        # Auto-create inventory lot for the collector from collected item
        listing = self.listing_repo.get_by_id(listing_id) if listing_id else {}
        self.inv_repo.create({
            "collector_id": collector_id,
            "source_listing_id": listing_id or "",
            "source_pickup_id": pickup_id,
            "material_category": listing.get("material_category", ""),
            "subcategory": listing.get("subcategory", ""),
            "quantity": listing.get("quantity", "1"),
            "unit": listing.get("unit", "kg"),
            "weight_kg": actual_weight_kg,
            "condition": listing.get("condition", "Fair"),
            "grade": "B",
            "asking_price": listing.get("price_expectation", "0"),
            "city": listing.get("city", ""),
            "status": "ACTIVE",
            "image_paths": evidence_paths or listing.get("image_paths", ""),
        })

        self.notif_service.send(
            user_id=pickup["seller_id"],
            title="Pickup Completed",
            body=f"Pickup completed. Recorded weight: {actual_weight_kg} kg.",
            notification_type="PICKUP",
            related_entity_type="pickup_requests",
            related_entity_id=pickup_id,
        )
        return updated or pickup

    # Inventory Lots
    def get_inventory(self, collector_id: str) -> List[Dict[str, Any]]:
        return self.inv_repo.get_by_collector(collector_id)

    def create_lot(self, collector_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        record = {
            **data,
            "collector_id": collector_id,
            "status": "ACTIVE",
        }
        return self.inv_repo.create(record)

    def update_lot(self, lot_id: str, collector_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        lot = self.inv_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found.")
        validate_ownership(lot, collector_id, owner_field="collector_id")
        return self.inv_repo.update(lot_id, data) or lot

    # Offers on collector's inventory
    def get_offers(self, collector_id: str) -> List[Dict[str, Any]]:
        my_lots = {l["id"]: l for l in self.inv_repo.get_by_collector(collector_id)}
        all_offers = self.offer_repo.get_all()
        collector_offers = []
        for o in all_offers:
            lot = my_lots.get(o.get("lot_id"))
            if lot:
                collector_offers.append({**o, "lot": lot})
        return collector_offers

    def accept_offer(self, offer_id: str, collector_id: str) -> Dict[str, Any]:
        offer = self.offer_repo.get_by_id(offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found.")

        lot = self.inv_repo.get_by_id(offer.get("lot_id", ""))
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory lot not found.")
        validate_ownership(lot, collector_id, owner_field="collector_id")

        validate_transition("offer", offer.get("status", "PENDING"), "ACCEPTED")

        # Check inventory quantity and reserve
        current_qty = float(lot.get("quantity") or 0)
        offer_qty = float(offer.get("quantity") or 0)
        validate_quantity_availability(current_qty, offer_qty)

        remaining_qty = current_qty - offer_qty
        new_lot_status = "RESERVED" if remaining_qty == 0 else "ACTIVE"
        self.inv_repo.update(lot["id"], {
            "quantity": remaining_qty,
            "status": new_lot_status,
        })

        updated_offer = self.offer_repo.update(offer_id, {"status": "ACCEPTED"})

        # Auto-create Order
        order = self.order_repo.create({
            "offer_id": offer_id,
            "listing_id": lot.get("source_listing_id", ""),
            "lot_id": lot["id"],
            "seller_id": "",
            "collector_id": collector_id,
            "buyer_id": offer.get("buyer_id", ""),
            "recycler_id": "",
            "quantity": offer_qty,
            "unit": offer.get("unit", "kg"),
            "agreed_price": offer.get("offer_price", 0),
            "status": "CONFIRMED",
        })

        # Notify buyer
        self.notif_service.send(
            user_id=offer["buyer_id"],
            title="Offer Accepted!",
            body=f"Your offer of ₹{offer.get('offer_price')} for lot #{lot['id'][:8]} was accepted.",
            notification_type="OFFER",
            related_entity_type="orders",
            related_entity_id=order["id"],
        )
        return updated_offer or offer

    def reject_offer(self, offer_id: str, collector_id: str) -> Dict[str, Any]:
        offer = self.offer_repo.get_by_id(offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found.")

        lot = self.inv_repo.get_by_id(offer.get("lot_id", ""))
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory lot not found.")
        validate_ownership(lot, collector_id, owner_field="collector_id")

        validate_transition("offer", offer.get("status", "PENDING"), "REJECTED")
        return self.offer_repo.update(offer_id, {"status": "REJECTED"}) or offer


_instance: Optional[CollectorService] = None


def get_collector_service() -> CollectorService:
    global _instance
    if _instance is None:
        _instance = CollectorService()
    return _instance
