"""
api/exports.py - Data export endpoints.
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from app.dependencies import get_admin_user
from app.services.export_service import get_export_service

router = APIRouter(prefix="/exports", tags=["Exports"])


@router.get("/combined")
def download_combined_export(user: Dict[str, Any] = Depends(get_admin_user)):
    """
    Generate and stream backend/data/exports/scrapsetu_all_data.csv.
    Admin authorization strictly required.
    """
    service = get_export_service()
    export_path = service.generate_combined_export()
    return FileResponse(
        path=export_path,
        filename="scrapsetu_all_data.csv",
        media_type="text/csv",
    )

