"""
api/collector.py - Collector / Kabadiwala portal endpoints.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_collector_user
from app.services.collector_service import get_collector_service

router = APIRouter(prefix="/collector", tags=["Collector Portal"])


class SchedulePickupRequest(BaseModel):
    scheduled_time: str


class CompletePickupRequest(BaseModel):
    actual_weight_kg: float = Field(..., gt=0)
    notes: str = ""
    evidence_paths: str = ""


class CreateLotRequest(BaseModel):
    material_category: str
    subcategory: str = ""
    quantity: float = Field(..., gt=0)
    unit: str = "kg"
    weight_kg: float = Field(..., gt=0)
    condition: str = "Fair"
    grade: str = "B"
    asking_price: float = Field(..., ge=0)
    city: str = ""
    image_paths: str = ""


class UpdateLotRequest(BaseModel):
    quantity: Optional[float] = None
    weight_kg: Optional[float] = None
    condition: Optional[str] = None
    grade: Optional[str] = None
    asking_price: Optional[float] = None
    status: Optional[str] = None


@router.get("/dashboard")
def get_dashboard(user: Dict[str, Any] = Depends(get_collector_user)):
    service = get_collector_service()
    return service.get_dashboard(user["id"])


@router.get("/available-pickups")
def get_available_pickups(
    city: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.get_available_pickups(city=city)


@router.post("/pickups/{pickup_id}/accept")
def accept_pickup(
    pickup_id: str,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.accept_pickup(pickup_id, user["id"])


@router.post("/pickups/{pickup_id}/schedule")
def schedule_pickup(
    pickup_id: str,
    req: SchedulePickupRequest,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.schedule_pickup(pickup_id, user["id"], req.scheduled_time)


@router.post("/pickups/{pickup_id}/complete")
def complete_pickup(
    pickup_id: str,
    req: CompletePickupRequest,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.complete_pickup(
        pickup_id=pickup_id,
        collector_id=user["id"],
        actual_weight_kg=req.actual_weight_kg,
        notes=req.notes,
        evidence_paths=req.evidence_paths,
    )


@router.get("/inventory")
def get_inventory(user: Dict[str, Any] = Depends(get_collector_user)):
    service = get_collector_service()
    return service.get_inventory(user["id"])


@router.post("/inventory", status_code=status.HTTP_201_CREATED)
def create_inventory_lot(
    req: CreateLotRequest,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.create_lot(user["id"], req.model_dump())


@router.put("/inventory/{lot_id}")
def update_inventory_lot(
    lot_id: str,
    req: UpdateLotRequest,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.update_lot(lot_id, user["id"], req.model_dump(exclude_unset=True))


@router.get("/offers")
def get_offers(user: Dict[str, Any] = Depends(get_collector_user)):
    service = get_collector_service()
    return service.get_offers(user["id"])


@router.post("/offers/{offer_id}/accept")
def accept_offer(
    offer_id: str,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.accept_offer(offer_id, user["id"])


@router.post("/offers/{offer_id}/reject")
def reject_offer(
    offer_id: str,
    user: Dict[str, Any] = Depends(get_collector_user),
):
    service = get_collector_service()
    return service.reject_offer(offer_id, user["id"])

