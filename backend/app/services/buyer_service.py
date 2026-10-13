"""
services/buyer_service.py - Buyer portal business logic.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from app.repositories.inventory_repository import get_inventory_repository
from app.repositories.offer_repository import get_offer_repository
from app.repositories.order_repository import get_order_repository
from app.repositories.transaction_repository import get_transaction_repository, get_payment_repository
from app.services.notification_service import get_notification_service
from app.validators.business_rules import validate_ownership, validate_transition, validate_quantity_availability
class BuyerService:
    def __init__(self) -> None:
        self.inv_repo = get_inventory_repository()
        self.offer_repo = get_offer_repository()
        self.order_repo = get_order_repository()
        self.tx_repo = get_transaction_repository()
        self.pay_repo = get_payment_repository()
        self.notif_service = get_notification_service()

    def get_dashboard(self, buyer_id: str) -> Dict[str, Any]:
        available_lots = self.inv_repo.get_available()
        my_offers = self.offer_repo.get_by_buyer(buyer_id)
        submitted_offers = [o for o in my_offers if o.get("status") == "PENDING"]
        accepted_offers = [o for o in my_offers if o.get("status") == "ACCEPTED"]

        orders = self.order_repo.get_by_user(buyer_id, role="BUYER")
        active_orders = [o for o in orders if o.get("status") in ("CREATED", "CONFIRMED", "HANDOVER_PENDING")]
        completed_orders = [o for o in orders if o.get("status") == "COMPLETED"]

        total_spent = sum(float(o.get("agreed_price") or 0) for o in completed_orders)

        return {
            "available_lots_count": len(available_lots),
            "pending_offers_count": len(submitted_offers),
            "accepted_offers_count": len(accepted_offers),
            "active_orders_count": len(active_orders),
            "completed_purchases_count": len(completed_orders),
            "total_spent": total_spent,
            "recent_offers": my_offers[:5],
            "recent_orders": orders[:5],
        }

    def browse_marketplace(
        self,
        q: Optional[str] = None,
        category: Optional[str] = None,
        city: Optional[str] = None,
        condition: Optional[str] = None,
        grade: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        lots = self.inv_repo.get_available()

        if q:
            q_lower = q.lower()
            lots = [
                l for l in lots
                if q_lower in l.get("material_category", "").lower()
                or q_lower in l.get("subcategory", "").lower()
                or q_lower in l.get("city", "").lower()
            ]
        if category:
            lots = [l for l in lots if l.get("material_category") == category]
        if city:
            lots = [l for l in lots if l.get("city", "").lower() == city.lower()]
        if condition:
            lots = [l for l in lots if l.get("condition", "").lower() == condition.lower()]
        if grade:
            lots = [l for l in lots if l.get("grade", "").upper() == grade.upper()]
        if min_price is not None:
            lots = [l for l in lots if float(l.get("asking_price") or 0) >= min_price]
        if max_price is not None:
            lots = [l for l in lots if float(l.get("asking_price") or 0) <= max_price]

        # Sorting
        if sort_by == "price_asc":
            lots.sort(key=lambda x: float(x.get("asking_price") or 0))
        elif sort_by == "price_desc":
            lots.sort(key=lambda x: float(x.get("asking_price") or 0), reverse=True)
        elif sort_by == "weight_desc":
            lots.sort(key=lambda x: float(x.get("weight_kg") or 0), reverse=True)
        else:
            lots.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return lots

    def get_lot_details(self, lot_id: str) -> Dict[str, Any]:
        lot = self.inv_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found.")
        return lot

    def submit_offer(self, buyer_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        lot_id = data.get("lot_id")
        lot = self.inv_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory lot not found.")

        # Buyer cannot make offer on their own inventory (if collector is also buyer)
        if lot.get("collector_id") == buyer_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot submit offer on your own lot.")

        offer_qty = float(data.get("quantity") or 0)
        available_qty = float(lot.get("quantity") or 0)
        validate_quantity_availability(available_qty, offer_qty)

        record = {
            **data,
            "buyer_id": buyer_id,
            "status": "PENDING",
        }
        created = self.offer_repo.create(record)

        # Notify collector
        self.notif_service.send(
            user_id=lot["collector_id"],
            title="New Offer Received",
            body=f"You received an offer of ₹{data.get('offer_price')} for your lot #{lot_id[:8]}.",
            notification_type="OFFER",
            related_entity_type="offers",
            related_entity_id=created["id"],
        )
        return created

    def revise_offer(self, offer_id: str, buyer_id: str, new_price: float, new_qty: Optional[float] = None) -> Dict[str, Any]:
        offer = self.offer_repo.get_by_id(offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found.")
        validate_ownership(offer, buyer_id, owner_field="buyer_id")

        if offer.get("status") != "PENDING":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only revise pending offers.")

        update_data: Dict[str, Any] = {"offer_price": new_price}
        if new_qty is not None:
            update_data["quantity"] = new_qty
        return self.offer_repo.update(offer_id, update_data) or offer

    def withdraw_offer(self, offer_id: str, buyer_id: str) -> Dict[str, Any]:
        offer = self.offer_repo.get_by_id(offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found.")
        validate_ownership(offer, buyer_id, owner_field="buyer_id")

        validate_transition("offer", offer.get("status", "PENDING"), "WITHDRAWN")
        return self.offer_repo.update(offer_id, {"status": "WITHDRAWN"}) or offer

    def get_my_offers(self, buyer_id: str) -> List[Dict[str, Any]]:
        offers = self.offer_repo.get_by_buyer(buyer_id)
        enriched = []
        for o in offers:
            lot = self.inv_repo.get_by_id(o.get("lot_id", ""))
            enriched.append({**o, "lot": lot})
        return enriched

    def get_my_purchases(self, buyer_id: str) -> List[Dict[str, Any]]:
        return self.order_repo.get_by_user(buyer_id, role="BUYER")

    def confirm_receipt(self, order_id: str, buyer_id: str) -> Dict[str, Any]:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
        validate_ownership(order, buyer_id, owner_field="buyer_id")

        validate_transition("order", order.get("status", "CONFIRMED"), "COMPLETED")

        updated = self.order_repo.update(order_id, {"status": "COMPLETED"})

        # Record financial transaction
        self.tx_repo.create({
            "order_id": order_id,
            "transaction_type": "PURCHASE_SETTLEMENT",
            "amount": order.get("agreed_price", 0),
            "currency": "INR",
            "status": "COMPLETED",
            "recorded_at": "",
            "reference": f"TXN_{order_id[:8]}",
            "notes": "Order confirmed by buyer receipt.",
        })

        return updated or order


_instance: Optional[BuyerService] = None


def get_buyer_service() -> BuyerService:
    global _instance
    if _instance is None:
        _instance = BuyerService()
    return _instance
