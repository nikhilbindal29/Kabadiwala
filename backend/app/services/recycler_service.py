"""
services/recycler_service.py - Authorized Recycler portal business logic.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.repositories.inventory_repository import get_inventory_repository
from app.repositories.offer_repository import get_offer_repository
from app.repositories.order_repository import get_order_repository
from app.repositories.handover_repository import get_handover_repository
from app.repositories.recycler_doc_repository import get_recycler_doc_repository
from app.repositories.user_repository import get_user_repository
from app.repositories.transaction_repository import get_transaction_repository
from app.services.notification_service import get_notification_service
from app.validators.business_rules import validate_ownership, validate_transition


class RecyclerService:
    def __init__(self) -> None:
        self.inv_repo = get_inventory_repository()
        self.offer_repo = get_offer_repository()
        self.order_repo = get_order_repository()
        self.handover_repo = get_handover_repository()
        self.doc_repo = get_recycler_doc_repository()
        self.user_repo = get_user_repository()
        self.tx_repo = get_transaction_repository()
        self.notif_service = get_notification_service()

    def get_dashboard(self, recycler_id: str) -> Dict[str, Any]:
        user = self.user_repo.get_by_id(recycler_id) or {}
        verification_status = user.get("verification_status", "unverified")

        available_lots = self.inv_repo.get_available()
        my_offers = self.offer_repo.get_by_buyer(recycler_id)
        pending_offers = [o for o in my_offers if o.get("status") == "PENDING"]

        handovers = self.handover_repo.get_by_user(recycler_id)
        pending_handovers = [h for h in handovers if h.get("status") != "COMPLETED"]

        # Recycler orders
        orders = self.order_repo.get_by_user(recycler_id, role="RECYCLER")
        completed_orders = [o for o in orders if o.get("status") == "COMPLETED"]

        # Real material processed & impact calculations from actual records
        total_weight_kg = sum(float(h.get("weight_kg") or 0) for h in handovers if h.get("status") == "COMPLETED")
        # Standard modeled impact ratios derived strictly from recorded recycled weight
        estimated_co2_saved_kg = round(total_weight_kg * 1.44, 2)
        estimated_landfill_diverted_kg = total_weight_kg

        docs = self.doc_repo.get_by_recycler(recycler_id)

        return {
            "verification_status": verification_status,
            "is_authorized": verification_status == "verified",
            "available_materials_count": len(available_lots),
            "pending_offers_count": len(pending_offers),
            "pending_handovers_count": len(pending_handovers),
            "completed_recycling_orders_count": len(completed_orders),
            "total_material_recycled_kg": total_weight_kg,
            "impact_metrics": {
                "co2_saved_kg": estimated_co2_saved_kg,
                "landfill_diverted_kg": estimated_landfill_diverted_kg,
                "is_modeled_estimate": True,
            },
            "documents_count": len(docs),
            "recent_handovers": handovers[:5],
        }

    def browse_materials(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        min_weight: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        lots = self.inv_repo.get_available()
        if category:
            lots = [l for l in lots if l.get("material_category") == category]
        if city:
            lots = [l for l in lots if l.get("city", "").lower() == city.lower()]
        if min_weight is not None:
            lots = [l for l in lots if float(l.get("weight_kg") or 0) >= min_weight]
        return lots

    def submit_offer(self, recycler_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        lot = self.inv_repo.get_by_id(data.get("lot_id"))
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found.")

        record = {
            **data,
            "buyer_id": recycler_id,
            "status": "PENDING",
        }
        created = self.offer_repo.create(record)

        self.notif_service.send(
            user_id=lot["collector_id"],
            title="Recycler Purchase Offer",
            body=f"An authorized recycler offered ₹{data.get('offer_price')} for your lot #{lot['id'][:8]}.",
            notification_type="OFFER",
            related_entity_type="offers",
            related_entity_id=created["id"],
        )
        return created

    def confirm_handover(
        self,
        order_id: str,
        recycler_id: str,
        actual_weight_kg: float,
        condition: str,
        evidence_paths: str = "",
        notes: str = "",
    ) -> Dict[str, Any]:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

        # Check or create handover record
        existing = self.handover_repo.get_by_order(order_id)
        if existing:
            updated = self.handover_repo.update(existing["id"], {
                "received_by": recycler_id,
                "weight_kg": actual_weight_kg,
                "condition": condition,
                "evidence_paths": evidence_paths,
                "status": "COMPLETED",
                "notes": notes,
            })
        else:
            updated = self.handover_repo.create({
                "order_id": order_id,
                "handed_over_by": order.get("collector_id", ""),
                "received_by": recycler_id,
                "quantity": order.get("quantity", "1"),
                "unit": order.get("unit", "kg"),
                "weight_kg": actual_weight_kg,
                "condition": condition,
                "evidence_paths": evidence_paths,
                "confirmed_at": "",
                "status": "COMPLETED",
                "notes": notes,
            })

        self.order_repo.update(order_id, {"status": "COMPLETED"})

        # Record financial transaction
        self.tx_repo.create({
            "order_id": order_id,
            "transaction_type": "RECYCLER_SETTLEMENT",
            "amount": order.get("agreed_price", 0),
            "currency": "INR",
            "status": "COMPLETED",
            "recorded_at": "",
            "reference": f"RECYC_TXN_{order_id[:8]}",
            "notes": f"Material handover confirmed at {actual_weight_kg} kg.",
        })

        return updated or {}

    def upload_compliance_document(
        self,
        recycler_id: str,
        doc_type: str,
        file_path: str,
        reference: str = "",
        expiry_date: str = "",
    ) -> Dict[str, Any]:
        return self.doc_repo.create({
            "recycler_id": recycler_id,
            "document_type": doc_type,
            "file_path": file_path,
            "document_reference": reference,
            "expiry_date": expiry_date,
            "verification_status": "pending",
            "reviewed_by": "",
            "reviewed_at": "",
            "notes": "",
        })

    def get_documents(self, recycler_id: str) -> List[Dict[str, Any]]:
        return self.doc_repo.get_by_recycler(recycler_id)


_instance: Optional[RecyclerService] = None


def get_recycler_service() -> RecyclerService:
    global _instance
    if _instance is None:
        _instance = RecyclerService()
    return _instance

