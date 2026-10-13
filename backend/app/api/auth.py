"""
api/auth.py - Authentication and profile endpoints.
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field

from app.dependencies import get_current_user
from app.services.auth_service import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    role: str
    preferred_language: str = "en"
    city: str = ""
    locality: str = ""
    seller_type: str = ""
    business_name: str = ""
    business_details: str = ""
    service_locations: str = ""
    material_categories: str = ""
    capacity: str = ""
    facility_address: str = ""
    authorization_details: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=8)


class ProvisionAdminRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str = Field(..., min_length=8)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    service = get_auth_service()
    return service.register(req.model_dump())


@router.post("/login")
def login(req: LoginRequest, request: Request):
    service = get_auth_service()
    ip = request.client.host if request.client else ""
    return service.login(req.email, req.password, ip_address=ip)


@router.post("/refresh")
def refresh(req: RefreshRequest):
    service = get_auth_service()
    return service.refresh(req.refresh_token)


@router.post("/logout")
def logout(
    req: RefreshRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    service = get_auth_service()
    service.logout(refresh_token=req.refresh_token, user_id=current_user["id"])
    return {"message": "Logged out successfully."}


@router.get("/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    safe = dict(current_user)
    safe.pop("password_hash", None)
    return safe


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    service = get_auth_service()
    service.change_password(current_user["id"], req.current_password, req.new_password)
    return {"message": "Password changed successfully."}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    service = get_auth_service()
    return service.forgot_password(req.email)


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    service = get_auth_service()
    service.reset_password(req.email, req.otp, req.new_password)
    return {"message": "Password reset successfully. You can now login with your new password."}


@router.post("/admin/provision", status_code=status.HTTP_201_CREATED)
def provision_admin(
    req: ProvisionAdminRequest,
    x_admin_setup_token: str = Header(..., alias="X-Admin-Setup-Token"),
):
    service = get_auth_service()
    return service.provision_admin(x_admin_setup_token, req.model_dump())

