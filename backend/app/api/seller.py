"""
api/seller.py - Seller portal endpoints.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_seller_user
from app.services.seller_service import get_seller_service

router = APIRouter(prefix="/seller", tags=["Seller Portal"])


class CreateListingRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    material_category: str
    subcategory: str = ""
    description: str = ""
    condition: str = "Good"
    quantity: float = 1.0
    unit: str = "pieces"
    estimated_weight_kg: float = 0.0
    price_expectation: float = 0.0
    image_paths: str = ""
    pickup_address: str = ""
    city: str = ""
    locality: str = ""
    status: str = "ACTIVE"
    request_pickup: bool = False
    scheduled_at: str = ""


class UpdateListingRequest(BaseModel):
    title: Optional[str] = None
    material_category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_weight_kg: Optional[float] = None
    price_expectation: Optional[float] = None
    image_paths: Optional[str] = None
    pickup_address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    status: Optional[str] = None


class RequestPickupRequest(BaseModel):
    pickup_address: str
    scheduled_at: str


@router.get("/dashboard")
def get_dashboard(user: Dict[str, Any] = Depends(get_seller_user)):
    service = get_seller_service()
    return service.get_dashboard(user["id"])


@router.get("/listings")
def get_listings(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.list_listings(user["id"], status_filter=status, category=category)


@router.post("/listings", status_code=status.HTTP_201_CREATED)
def create_listing(
    req: CreateListingRequest,
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.create_listing(user["id"], req.model_dump())


@router.get("/listings/{listing_id}")
def get_listing(
    listing_id: str,
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.get_listing(listing_id, user["id"])


@router.put("/listings/{listing_id}")
def update_listing(
    listing_id: str,
    req: UpdateListingRequest,
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.update_listing(listing_id, user["id"], req.model_dump(exclude_unset=True))


@router.delete("/listings/{listing_id}")
def cancel_listing(
    listing_id: str,
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.cancel_listing(listing_id, user["id"])


@router.post("/listings/{listing_id}/pickup")
def request_pickup(
    listing_id: str,
    req: RequestPickupRequest,
    user: Dict[str, Any] = Depends(get_seller_user),
):
    service = get_seller_service()
    return service.request_pickup(listing_id, user["id"], req.pickup_address, req.scheduled_at)


@router.get("/pickup-requests")
def get_pickup_requests(user: Dict[str, Any] = Depends(get_seller_user)):
    service = get_seller_service()
    return service.get_pickup_requests(user["id"])


@router.get("/orders")
def get_orders(user: Dict[str, Any] = Depends(get_seller_user)):
    service = get_seller_service()
    return service.get_orders(user["id"])


@router.get("/transactions")
def get_transactions(user: Dict[str, Any] = Depends(get_seller_user)):
    service = get_seller_service()
    return service.get_transactions(user["id"])

