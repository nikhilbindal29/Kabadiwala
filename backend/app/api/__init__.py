"""app/api/__init__.py - API router registration."""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.seller import router as seller_router
from app.api.collector import router as collector_router
from app.api.buyer import router as buyer_router
from app.api.recycler import router as recycler_router
from app.api.admin import router as admin_router
from app.api.notifications import router as notifications_router
from app.api.uploads import router as uploads_router
from app.api.exports import router as exports_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(seller_router)
api_router.include_router(collector_router)
api_router.include_router(buyer_router)
api_router.include_router(recycler_router)
api_router.include_router(admin_router)
api_router.include_router(notifications_router)
api_router.include_router(uploads_router)
api_router.include_router(exports_router)

__all__ = ["api_router"]
