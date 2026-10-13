"""
schemas/user.py - User domain schemas.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class UserRole(str, Enum):
    SELLER = "seller"
    COLLECTOR = "collector"
    BUYER = "buyer"
    RECYCLER = "recycler"
    ADMIN = "admin"


class AccountStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    DEACTIVATED = "deactivated"


class VerificationStatus(str, Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class SellerType(str, Enum):
    INDIVIDUAL = "individual"
    BUSINESS = "business"


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    role: UserRole
    preferred_language: Optional[str] = "en"
    city: Optional[str] = None
    locality: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = re.sub(r"[\s\-\+]", "", v)
        if not digits.isdigit() or len(digits) < 10:
            raise ValueError("Phone must contain at least 10 digits.")
        return digits


class UserRegister(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=128)
    # Seller-specific
    seller_type: Optional[SellerType] = None
    business_name: Optional[str] = None
    business_details: Optional[str] = None
    # Collector-specific
    service_locations: Optional[str] = None
    material_categories: Optional[str] = None
    capacity: Optional[str] = None
    # Recycler-specific
    facility_address: Optional[str] = None
    authorization_details: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserResponse(BaseModel):
    """Public-facing user representation (no password_hash)."""
    id: str
    full_name: str
    email: str
    phone: str
    role: str
    account_status: str
    verification_status: str
    preferred_language: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    seller_type: Optional[str] = None
    business_name: Optional[str] = None
    business_details: Optional[str] = None
    service_locations: Optional[str] = None
    material_categories: Optional[str] = None
    capacity: Optional[str] = None
    facility_address: Optional[str] = None
    authorization_details: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Fields a user can update on their own profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    business_name: Optional[str] = None
    business_details: Optional[str] = None
    service_locations: Optional[str] = None
    material_categories: Optional[str] = None
    capacity: Optional[str] = None
    facility_address: Optional[str] = None
    authorization_details: Optional[str] = None


class AdminUserStatusUpdate(BaseModel):
    account_status: AccountStatus
    reason: Optional[str] = None


class AdminVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    reason: Optional[str] = None
