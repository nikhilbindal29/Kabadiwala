"""
app/dependencies.py - FastAPI route dependencies (auth, role enforcement, pagination).
"""
from typing import Any, Callable, Dict, List, Optional
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.security import decode_token
from app.repositories.user_repository import get_user_repository
from app.schemas.user import UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Validate bearer token and return user record from CSV repository."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: Optional[str] = payload.get("sub")
        token_type: Optional[str] = payload.get("type")
        if not user_id or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_repo = get_user_repository()
    user = user_repo.get_by_id(user_id)
    if not user:
        raise credentials_exception

    if user.get("account_status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact support.",
        )

    return user


def get_current_active_user(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("account_status") not in ("active", "pending"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )
    return user


def require_role(*roles: str) -> Callable:
    """Decorator factory enforcing user role from backend repository data."""
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user.get("role", "").upper()
        allowed = [r.upper() for r in roles]
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{user_role}' is not in authorized roles {allowed}",
            )
        return user
    return role_checker


# Shortcuts
get_admin_user = require_role("ADMIN")
get_seller_user = require_role("SELLER", "ADMIN")
get_collector_user = require_role("COLLECTOR", "ADMIN")
get_buyer_user = require_role("BUYER", "ADMIN")
get_recycler_user = require_role("RECYCLER", "ADMIN")


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Page size"),
    ):
        self.page = page
        self.page_size = page_size
