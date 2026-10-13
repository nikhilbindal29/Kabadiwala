"""
schemas/pickup.py - Pickup request schemas.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class PickupStatus(str, Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class PickupRequestCreate(BaseModel):
    listing_id: str
    pickup_address: Optional[str] = None
    scheduled_at: Optional[str] = None


class PickupStatusUpdate(BaseModel):
    status: PickupStatus
    actual_weight_kg: Optional[float] = Field(None, ge=0)
    collection_notes: Optional[str] = None
    evidence_paths: Optional[str] = None
    actual_scheduled_at: Optional[str] = None


class PickupSchedule(BaseModel):
    scheduled_at: str


class PickupResponse(BaseModel):
    id: str
    listing_id: str
    seller_id: str
    collector_id: Optional[str] = None
    pickup_address: Optional[str] = None
    scheduled_at: Optional[str] = None
    actual_scheduled_at: Optional[str] = None
    status: str
    actual_weight_kg: Optional[float] = None
    collection_notes: Optional[str] = None
    evidence_paths: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
