"""
schemas/transaction.py - Transaction and payment schemas.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    PAYMENT = "payment"
    REFUND = "refund"
    COMMISSION = "commission"
    PAYOUT = "payout"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REVERSED = "reversed"


class TransactionResponse(BaseModel):
    id: str
    order_id: str
    transaction_type: str
    amount: float
    currency: str
    status: str
    recorded_at: str
    reference: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    payer_id: str
    payee_id: str
    amount: float
    currency: str
    method: str
    status: str
    external_reference: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
