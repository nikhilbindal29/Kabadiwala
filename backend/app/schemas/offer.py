"""
schemas/offer.py - Offer schemas for buyer/recycler bids on lots.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class OfferStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class OfferCreate(BaseModel):
    lot_id: str
    offer_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1)
    transport_cost_estimate: Optional[float] = Field(None, ge=0)
    valid_until: Optional[str] = None  # ISO datetime string
    notes: Optional[str] = None


class OfferUpdate(BaseModel):
    offer_price: Optional[float] = Field(None, gt=0)
    quantity: Optional[float] = Field(None, gt=0)
    transport_cost_estimate: Optional[float] = Field(None, ge=0)
    valid_until: Optional[str] = None
    notes: Optional[str] = None


class OfferResponse(BaseModel):
    id: str
    lot_id: str
    buyer_id: str
    offer_price: float
    quantity: float
    unit: str
    transport_cost_estimate: Optional[float] = None
    valid_until: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class OfferStatusUpdate(BaseModel):
    status: OfferStatus
    notes: Optional[str] = None
