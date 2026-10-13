"""
api/uploads.py - Secure file uploads and protected file serving.
"""
import os
import uuid
from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app import config
from app.dependencies import get_current_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_DOC_EXTS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_BYTES = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _save_file(file: UploadFile, allowed_exts: set) -> Dict[str, str]:
    original_name = file.filename or "file"
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {list(allowed_exts)}",
        )

    # Read content and check size
    content = file.file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {config.MAX_UPLOAD_SIZE_MB}MB.",
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = config.UPLOADS_DIR / unique_filename
    config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    with open(dest_path, "wb") as f:
        f.write(content)

    relative_path = f"uploads/{unique_filename}"
    return {
        "file_path": relative_path,
        "url": f"/api/uploads/{unique_filename}",
        "filename": unique_filename,
    }


@router.post("/image")
def upload_image(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return _save_file(file, ALLOWED_IMAGE_EXTS)


@router.post("/document")
def upload_document(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return _save_file(file, ALLOWED_DOC_EXTS)


@router.get("/{filename:path}")
def serve_file(
    filename: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    # Path traversal prevention
    safe_name = os.path.basename(filename)
    target = config.UPLOADS_DIR / safe_name

    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")

    return FileResponse(target)

