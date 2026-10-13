"""
validators/business_rules.py - State machines, authorization and marketplace validation.
"""
from typing import Dict, Any, Optional, Set
from fastapi import HTTPException, status


# ── Allowed State Transitions ──────────────────────────────────────────────────

LISTING_TRANSITIONS: Dict[str, Set[str]] = {
    "DRAFT": {"ACTIVE", "CANCELLED"},
    "ACTIVE": {"RESERVED", "CANCELLED"},
    "RESERVED": {"SOLD", "ACTIVE", "CANCELLED"},
    "SOLD": set(),
    "CANCELLED": set(),
}

PICKUP_TRANSITIONS: Dict[str, Set[str]] = {
    "REQUESTED": {"ACCEPTED", "REJECTED", "CANCELLED"},
    "ACCEPTED": {"SCHEDULED", "CANCELLED"},
    "SCHEDULED": {"IN_PROGRESS", "CANCELLED"},
    "IN_PROGRESS": {"COMPLETED", "CANCELLED"},
    "COMPLETED": set(),
    "REJECTED": set(),
    "CANCELLED": set(),
}

OFFER_TRANSITIONS: Dict[str, Set[str]] = {
    "PENDING": {"ACCEPTED", "REJECTED", "WITHDRAWN", "EXPIRED"},
    "ACCEPTED": set(),
    "REJECTED": set(),
    "WITHDRAWN": set(),
    "EXPIRED": set(),
}

ORDER_TRANSITIONS: Dict[str, Set[str]] = {
    "CREATED": {"CONFIRMED", "CANCELLED"},
    "CONFIRMED": {"HANDOVER_PENDING", "CANCELLED", "DISPUTED"},
    "HANDOVER_PENDING": {"COMPLETED", "DISPUTED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
    "DISPUTED": {"COMPLETED", "CANCELLED"},
}


def validate_transition(entity: str, current_status: str, new_status: str) -> None:
    """Validate status transitions against allowed state graphs."""
    tables = {
        "listing": LISTING_TRANSITIONS,
        "pickup": PICKUP_TRANSITIONS,
        "offer": OFFER_TRANSITIONS,
        "order": ORDER_TRANSITIONS,
    }
    transitions = tables.get(entity.lower())
    if not transitions:
        return

    allowed = transitions.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transition for {entity}: {current_status} -> {new_status}. Allowed: {list(allowed)}",
        )


def validate_ownership(
    record: Dict[str, Any],
    user_id: str,
    owner_field: str = "user_id",
    allow_admin: bool = True,
    user_role: Optional[str] = None,
) -> None:
    """Validate that the requesting user owns the target record or is an Admin."""
    if allow_admin and user_role == "ADMIN":
        return
    actual_owner = record.get(owner_field)
    if str(actual_owner) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this resource.",
        )


def validate_quantity_availability(available_quantity: float, requested_quantity: float) -> None:
    """Ensure requested quantity does not exceed available stock and cannot result in negative inventory."""
    if requested_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity must be greater than zero.",
        )
    if requested_quantity > available_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient inventory available. Requested: {requested_quantity}, Available: {available_quantity}",
        )

