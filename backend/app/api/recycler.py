"""
api/recycler.py - Recycler portal endpoints.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_recycler_user
from app.services.recycler_service import get_recycler_service

router = APIRouter(prefix="/recycler", tags=["Recycler Portal"])


class RecyclerOfferRequest(BaseModel):
    lot_id: str
    offer_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    unit: str = "kg"
    transport_cost_estimate: float = 0.0
    valid_until: str = ""
    notes: str = ""


class ConfirmHandoverRequest(BaseModel):
    actual_weight_kg: float = Field(..., gt=0)
    condition: str = "Recyclable"
    evidence_paths: str = ""
    notes: str = ""


class UploadComplianceDocRequest(BaseModel):
    document_type: str
    file_path: str
    document_reference: str = ""
    expiry_date: str = ""


@router.get("/dashboard")
def get_dashboard(user: Dict[str, Any] = Depends(get_recycler_user)):
    service = get_recycler_service()
    return service.get_dashboard(user["id"])


@router.get("/material-marketplace")
def browse_materials(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_weight: Optional[float] = Query(None),
    user: Dict[str, Any] = Depends(get_recycler_user),
):
    service = get_recycler_service()
    return service.browse_materials(category=category, city=city, min_weight=min_weight)


@router.post("/offers", status_code=status.HTTP_201_CREATED)
def submit_offer(
    req: RecyclerOfferRequest,
    user: Dict[str, Any] = Depends(get_recycler_user),
):
    service = get_recycler_service()
    return service.submit_offer(user["id"], req.model_dump())


@router.post("/handovers/{order_id}/confirm")
def confirm_handover(
    order_id: str,
    req: ConfirmHandoverRequest,
    user: Dict[str, Any] = Depends(get_recycler_user),
):
    service = get_recycler_service()
    return service.confirm_handover(
        order_id=order_id,
        recycler_id=user["id"],
        actual_weight_kg=req.actual_weight_kg,
        condition=req.condition,
        evidence_paths=req.evidence_paths,
        notes=req.notes,
    )


@router.get("/documents")
def get_documents(user: Dict[str, Any] = Depends(get_recycler_user)):
    service = get_recycler_service()
    return service.get_documents(user["id"])


@router.post("/documents", status_code=status.HTTP_201_CREATED)
def upload_compliance_document(
    req: UploadComplianceDocRequest,
    user: Dict[str, Any] = Depends(get_recycler_user),
):
    service = get_recycler_service()
    return service.upload_compliance_document(
        recycler_id=user["id"],
        doc_type=req.document_type,
        file_path=req.file_path,
        reference=req.document_reference,
        expiry_date=req.expiry_date,
    )

