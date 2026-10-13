"""
schemas/common.py - Shared schema types and pagination helpers.
"""
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str
    code: Optional[str] = None


class ErrorResponse(BaseModel):
    """Structured error response."""
    detail: str
    code: str
    errors: Optional[Any] = None


class PaginationParams(BaseModel):
    """Common pagination query parameters."""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


def paginate(items: List[Any], page: int, page_size: int) -> dict:
    """Compute paginated slice and metadata."""
    total = len(items)
    pages = max(1, (total + page_size - 1) // page_size)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }
