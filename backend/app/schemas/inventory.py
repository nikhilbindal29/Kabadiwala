"""
schemas/inventory.py - Collector inventory lot schemas.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class LotStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"
    INACTIVE = "inactive"


class InventoryLotCreate(BaseModel):
    source_listing_id: Optional[str] = None
    source_pickup_id: Optional[str] = None
    material_category: str = Field(..., min_length=1)
    subcategory: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1)
    weight_kg: Optional[float] = Field(None, ge=0)
    condition: Optional[str] = None
    grade: Optional[str] = None
    asking_price: Optional[float] = Field(None, ge=0)
    city: Optional[str] = None
    image_paths: Optional[str] = None


class InventoryLotUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    weight_kg: Optional[float] = Field(None, ge=0)
    condition: Optional[str] = None
    grade: Optional[str] = None
    asking_price: Optional[float] = Field(None, ge=0)
    city: Optional[str] = None
    image_paths: Optional[str] = None
    status: Optional[LotStatus] = None


class InventoryLotResponse(BaseModel):
    id: str
    collector_id: str
    source_listing_id: Optional[str] = None
    source_pickup_id: Optional[str] = None
    material_category: str
    subcategory: Optional[str] = None
    quantity: float
    unit: str
    weight_kg: Optional[float] = None
    condition: Optional[str] = None
    grade: Optional[str] = None
    asking_price: Optional[float] = None
    city: Optional[str] = None
    status: str
    image_paths: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
