"""
schemas/order.py - Order schemas.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    CREATED = "created"
    CONFIRMED = "confirmed"
    HANDOVER_PENDING = "handover_pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class OrderResponse(BaseModel):
    id: str
    offer_id: Optional[str] = None
    listing_id: Optional[str] = None
    lot_id: Optional[str] = None
    seller_id: Optional[str] = None
    collector_id: Optional[str] = None
    buyer_id: Optional[str] = None
    recycler_id: Optional[str] = None
    quantity: float
    unit: str
    agreed_price: float
    status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None
