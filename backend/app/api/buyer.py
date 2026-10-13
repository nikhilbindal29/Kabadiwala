"""
api/buyer.py - Bulk Buyer portal endpoints.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_buyer_user
from app.services.buyer_service import get_buyer_service

router = APIRouter(prefix="/buyer", tags=["Buyer Portal"])


class SubmitOfferRequest(BaseModel):
    lot_id: str
    offer_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    unit: str = "kg"
    transport_cost_estimate: float = 0.0
    valid_until: str = ""
    notes: str = ""


class ReviseOfferRequest(BaseModel):
    offer_price: float = Field(..., gt=0)
    quantity: Optional[float] = None


@router.get("/dashboard")
def get_dashboard(user: Dict[str, Any] = Depends(get_buyer_user)):
    service = get_buyer_service()
    return service.get_dashboard(user["id"])


@router.get("/marketplace")
def browse_marketplace(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    grade: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.browse_marketplace(
        q=q,
        category=category,
        city=city,
        condition=condition,
        grade=grade,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
    )


@router.get("/lots/{lot_id}")
def get_lot_details(
    lot_id: str,
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.get_lot_details(lot_id)


@router.post("/offers", status_code=status.HTTP_201_CREATED)
def submit_offer(
    req: SubmitOfferRequest,
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.submit_offer(user["id"], req.model_dump())


@router.put("/offers/{offer_id}")
def revise_offer(
    offer_id: str,
    req: ReviseOfferRequest,
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.revise_offer(offer_id, user["id"], req.offer_price, req.quantity)


@router.delete("/offers/{offer_id}")
def withdraw_offer(
    offer_id: str,
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.withdraw_offer(offer_id, user["id"])


@router.get("/offers")
def get_my_offers(user: Dict[str, Any] = Depends(get_buyer_user)):
    service = get_buyer_service()
    return service.get_my_offers(user["id"])


@router.get("/purchases")
def get_my_purchases(user: Dict[str, Any] = Depends(get_buyer_user)):
    service = get_buyer_service()
    return service.get_my_purchases(user["id"])


@router.post("/purchases/{order_id}/confirm")
def confirm_purchase(
    order_id: str,
    user: Dict[str, Any] = Depends(get_buyer_user),
):
    service = get_buyer_service()
    return service.confirm_receipt(order_id, user["id"])

