"""
schemas/listing.py - E-waste listing schemas.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ListingStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    RESERVED = "reserved"
    SOLD = "sold"
    CANCELLED = "cancelled"


class MaterialCondition(str, Enum):
    WORKING = "working"
    PARTIALLY_WORKING = "partially_working"
    NOT_WORKING = "not_working"
    FOR_PARTS = "for_parts"


class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    material_category: str = Field(..., min_length=1)
    subcategory: Optional[str] = None
    description: Optional[str] = None
    condition: MaterialCondition
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=20)
    estimated_weight_kg: Optional[float] = Field(None, ge=0)
    price_expectation: Optional[float] = Field(None, ge=0)
    image_paths: Optional[str] = None  # JSON list or comma-separated
    pickup_address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    status: ListingStatus = ListingStatus.DRAFT


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    subcategory: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[MaterialCondition] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    estimated_weight_kg: Optional[float] = Field(None, ge=0)
    price_expectation: Optional[float] = Field(None, ge=0)
    image_paths: Optional[str] = None
    pickup_address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    status: Optional[ListingStatus] = None


class ListingResponse(BaseModel):
    id: str
    seller_id: str
    title: str
    material_category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    condition: str
    quantity: float
    unit: str
    estimated_weight_kg: Optional[float] = None
    price_expectation: Optional[float] = None
    image_paths: Optional[str] = None
    pickup_address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
