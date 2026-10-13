"""
services/admin_service.py - Administrator management and oversight service.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.repositories.user_repository import get_user_repository
from app.repositories.listing_repository import get_listing_repository
from app.repositories.pickup_repository import get_pickup_repository
from app.repositories.order_repository import get_order_repository
from app.repositories.transaction_repository import get_transaction_repository
from app.repositories.recycler_doc_repository import get_recycler_doc_repository
from app.repositories.support_repository import get_support_repository, get_dispute_repository
from app.repositories.audit_repository import get_audit_repository
from app.repositories.settings_repository import get_category_repository, get_service_area_repository
from app.services.notification_service import get_notification_service


class AdminService:
    def __init__(self) -> None:
        self.user_repo = get_user_repository()
        self.listing_repo = get_listing_repository()
        self.pickup_repo = get_pickup_repository()
        self.order_repo = get_order_repository()
        self.tx_repo = get_transaction_repository()
        self.doc_repo = get_recycler_doc_repository()
        self.support_repo = get_support_repository()
        self.dispute_repo = get_dispute_repository()
        self.audit_repo = get_audit_repository()
        self.cat_repo = get_category_repository()
        self.area_repo = get_service_area_repository()
        self.notif_service = get_notification_service()

    def get_dashboard(self) -> Dict[str, Any]:
        users = self.user_repo.get_all()
        roles_count: Dict[str, int] = {}
        for u in users:
            r = u.get("role", "UNKNOWN").upper()
            roles_count[r] = roles_count.get(r, 0) + 1

        listings = self.listing_repo.get_all()
        listing_status_count: Dict[str, int] = {}
        for l in listings:
            st = l.get("status", "UNKNOWN").upper()
            listing_status_count[st] = listing_status_count.get(st, 0) + 1

        pickups = self.pickup_repo.get_all()
        pickup_status_count: Dict[str, int] = {}
        for p in pickups:
            st = p.get("status", "UNKNOWN").upper()
            pickup_status_count[st] = pickup_status_count.get(st, 0) + 1

        pending_verifications = [u for u in users if u.get("verification_status") == "pending" or (u.get("role") == "RECYCLER" and u.get("verification_status") == "unverified")]
        open_disputes = self.dispute_repo.get_open()
        recent_audit = sorted(self.audit_repo.get_all(), key=lambda x: x.get("created_at", ""), reverse=True)[:10]

        return {
            "total_users": len(users),
            "users_by_role": roles_count,
            "listings_by_status": listing_status_count,
            "pickups_by_status": pickup_status_count,
            "pending_verifications_count": len(pending_verifications),
            "open_disputes_count": len(open_disputes),
            "recent_audit_events": recent_audit,
        }

    def list_users(
        self,
        role: Optional[str] = None,
        account_status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        users = self.user_repo.get_all()
        if role:
            users = [u for u in users if u.get("role", "").upper() == role.upper()]
        if account_status:
            users = [u for u in users if u.get("account_status", "").lower() == account_status.lower()]
        if search:
            s_lower = search.lower()
            users = [
                u for u in users
                if s_lower in u.get("full_name", "").lower()
                or s_lower in u.get("email", "").lower()
                or s_lower in u.get("phone", "")
            ]

        # Strip password hashes
        safe_users = []
        for u in users:
            item = dict(u)
            item.pop("password_hash", None)
            safe_users.append(item)
        return safe_users

    def update_user_status(self, user_id: str, new_status: str, admin_id: str, reason: str = "") -> Dict[str, Any]:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        updated = self.user_repo.update(user_id, {"account_status": new_status})
        self.audit_repo.log(
            user_id=admin_id,
            action=f"USER_STATUS_{new_status.upper()}",
            entity_type="users",
            entity_id=user_id,
            old_values=user.get("account_status", ""),
            new_values=new_status,
        )

        safe = dict(updated or user)
        safe.pop("password_hash", None)
        return safe

    def review_verification(
        self,
        user_id: str,
        decision: str,
        admin_id: str,
        reason: str = "",
    ) -> Dict[str, Any]:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        valid_decisions = {"verified", "rejected", "pending"}
        if decision.lower() not in valid_decisions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid decision.")

        updated = self.user_repo.update(user_id, {"verification_status": decision.lower()})

        self.audit_repo.log(
            user_id=admin_id,
            action=f"VERIFICATION_{decision.upper()}",
            entity_type="users",
            entity_id=user_id,
            new_values=reason,
        )

        self.notif_service.send(
            user_id=user_id,
            title="Verification Status Updated",
            body=f"Your verification status has been updated to '{decision}'. {reason}",
            notification_type="VERIFICATION",
            related_entity_type="users",
            related_entity_id=user_id,
        )

        safe = dict(updated or user)
        safe.pop("password_hash", None)
        return safe

    def resolve_dispute(self, dispute_id: str, resolution: str, admin_id: str) -> Dict[str, Any]:
        dispute = self.dispute_repo.get_by_id(dispute_id)
        if not dispute:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found.")

        updated = self.dispute_repo.update(dispute_id, {
            "status": "resolved",
            "resolution": resolution,
            "resolved_by": admin_id,
        })
        self.audit_repo.log(
            user_id=admin_id,
            action="DISPUTE_RESOLVED",
            entity_type="disputes",
            entity_id=dispute_id,
            new_values=resolution,
        )
        return updated or dispute


_instance: Optional[AdminService] = None


def get_admin_service() -> AdminService:
    global _instance
    if _instance is None:
        _instance = AdminService()
    return _instance

