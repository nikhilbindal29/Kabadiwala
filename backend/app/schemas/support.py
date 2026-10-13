"""
schemas/support.py - Support ticket and dispute schemas.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: Optional[str] = None
    priority: TicketPriority = TicketPriority.MEDIUM


class SupportTicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None


class SupportTicketResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
    status: str
    category: Optional[str] = None
    priority: str
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class DisputeStatus(str, Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    CLOSED = "closed"


class DisputeCreate(BaseModel):
    order_id: str
    against_user_id: str
    reason: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)


class DisputeUpdate(BaseModel):
    status: Optional[DisputeStatus] = None
    resolution: Optional[str] = None


class DisputeResponse(BaseModel):
    id: str
    order_id: str
    raised_by: str
    against_user_id: str
    reason: str
    description: str
    status: str
    resolution: Optional[str] = None
    resolved_by: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
