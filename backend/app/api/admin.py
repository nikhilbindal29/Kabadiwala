"""
api/admin.py - Protected administration endpoints.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from app.dependencies import get_admin_user
from app.services.admin_service import get_admin_service
from app.repositories.audit_repository import get_audit_repository
from app.repositories.settings_repository import get_category_repository, get_service_area_repository
from app.repositories.support_repository import get_dispute_repository

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


class UpdateUserStatusRequest(BaseModel):
    status: str
    reason: str = ""


class ReviewVerificationRequest(BaseModel):
    decision: str
    reason: str = ""


class ResolveDisputeRequest(BaseModel):
    resolution: str


class CreateCategoryRequest(BaseModel):
    name: str
    name_hi: str = ""
    parent_id: str = ""
    subcategories: str = ""
    is_active: str = "true"
    sort_order: str = "0"


class CreateServiceAreaRequest(BaseModel):
    city: str
    state: str
    pincode_ranges: str = ""
    is_active: str = "true"


@router.get("/dashboard")
def get_dashboard(user: Dict[str, Any] = Depends(get_admin_user)):
    service = get_admin_service()
    return service.get_dashboard()


@router.get("/users")
def list_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_admin_user),
):
    service = get_admin_service()
    return service.list_users(role=role, account_status=status, search=search)


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    req: UpdateUserStatusRequest,
    user: Dict[str, Any] = Depends(get_admin_user),
):
    service = get_admin_service()
    return service.update_user_status(user_id, req.status, user["id"], reason=req.reason)


@router.put("/verification/{target_user_id}")
def review_verification(
    target_user_id: str,
    req: ReviewVerificationRequest,
    user: Dict[str, Any] = Depends(get_admin_user),
):
    service = get_admin_service()
    return service.review_verification(target_user_id, req.decision, user["id"], reason=req.reason)


@router.get("/audit-log")
def get_audit_log(user: Dict[str, Any] = Depends(get_admin_user)):
    repo = get_audit_repository()
    return sorted(repo.get_all(), key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/categories")
def get_categories():
    repo = get_category_repository()
    return repo.get_all()


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(
    req: CreateCategoryRequest,
    user: Dict[str, Any] = Depends(get_admin_user),
):
    repo = get_category_repository()
    return repo.create(req.model_dump())


@router.get("/service-areas")
def get_service_areas():
    repo = get_service_area_repository()
    return repo.get_all()


@router.post("/service-areas", status_code=status.HTTP_201_CREATED)
def create_service_area(
    req: CreateServiceAreaRequest,
    user: Dict[str, Any] = Depends(get_admin_user),
):
    repo = get_service_area_repository()
    return repo.create(req.model_dump())


@router.get("/disputes")
def list_disputes(user: Dict[str, Any] = Depends(get_admin_user)):
    repo = get_dispute_repository()
    return repo.get_all()


@router.put("/disputes/{dispute_id}/resolve")
def resolve_dispute(
    dispute_id: str,
    req: ResolveDisputeRequest,
    user: Dict[str, Any] = Depends(get_admin_user),
):
    service = get_admin_service()
    return service.resolve_dispute(dispute_id, req.resolution, user["id"])
