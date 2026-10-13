"""
services/auth_service.py - Authentication and user lifecycle service.
"""
from datetime import timedelta
from typing import Any, Dict, Optional
from fastapi import HTTPException, status

from app import config
from app.core.auth import blacklist_token, is_token_blacklisted, store_otp, verify_otp
from app.core.security import (
    create_access_token,
    create_otp,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repository import get_user_repository
from app.repositories.audit_repository import get_audit_repository


class AuthService:
    def __init__(self) -> None:
        self.user_repo = get_user_repository()
        self.audit_repo = get_audit_repository()

    def register(self, data: Dict[str, Any]) -> Dict[str, Any]:
        email = data["email"].strip().lower()
        role = str(data.get("role", "")).upper()

        if role == "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Public registration for ADMIN role is strictly forbidden.",
            )

        if self.user_repo.email_exists(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

        # Phone uniqueness check
        phone = data.get("phone", "")
        if phone:
            existing_phone = self.user_repo.find_one(phone=phone)
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this phone number already exists.",
                )

        password = data.pop("password")
        pwd_hash = hash_password(password)

        record = {
            **data,
            "email": email,
            "role": role,
            "password_hash": pwd_hash,
            "account_status": "active",
            "verification_status": "unverified",
        }

        created = self.user_repo.create(record)
        self.audit_repo.log(
            user_id=created["id"],
            action="USER_REGISTERED",
            entity_type="users",
            entity_id=created["id"],
        )

        safe_user = dict(created)
        safe_user.pop("password_hash", None)
        return safe_user

    def login(self, email: str, password: str, ip_address: str = "") -> Dict[str, Any]:
        email = email.strip().lower()
        user = self.user_repo.get_by_email(email)

        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if user.get("account_status") == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact support.",
            )

        token_data = {"sub": user["id"], "role": user.get("role", "")}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        self.audit_repo.log(
            user_id=user["id"],
            action="USER_LOGIN",
            entity_type="users",
            entity_id=user["id"],
            ip_address=ip_address,
        )

        safe_user = dict(user)
        safe_user.pop("password_hash", None)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": safe_user,
        }

    def refresh(self, refresh_token: str) -> Dict[str, Any]:
        if is_token_blacklisted(refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked.",
            )

        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type.",
                )
            user_id = payload.get("sub")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user = self.user_repo.get_by_id(user_id)
        if not user or user.get("account_status") == "suspended":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer active.",
            )

        new_access = create_access_token({"sub": user["id"], "role": user.get("role", "")})
        return {
            "access_token": new_access,
            "token_type": "bearer",
            "expires_in": config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    def logout(self, refresh_token: Optional[str] = None, user_id: str = "") -> None:
        if refresh_token:
            blacklist_token(refresh_token)
        if user_id:
            self.audit_repo.log(
                user_id=user_id,
                action="USER_LOGOUT",
                entity_type="users",
                entity_id=user_id,
            )

    def change_password(self, user_id: str, old_pwd: str, new_pwd: str) -> None:
        user = self.user_repo.get_by_id(user_id)
        if not user or not verify_password(old_pwd, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password.",
            )

        new_hash = hash_password(new_pwd)
        self.user_repo.update(user_id, {"password_hash": new_hash})
        self.audit_repo.log(
            user_id=user_id,
            action="PASSWORD_CHANGED",
            entity_type="users",
            entity_id=user_id,
        )

    def forgot_password(self, email: str) -> Dict[str, Any]:
        email = email.strip().lower()
        user = self.user_repo.get_by_email(email)
        otp = create_otp()
        store_otp(email, otp)

        response: Dict[str, Any] = {"message": "If this email is registered, a password reset code has been issued."}
        if config.APP_ENV == "development":
            response["dev_otp"] = otp
        return response

    def reset_password(self, email: str, otp: str, new_pwd: str) -> None:
        email = email.strip().lower()
        if not verify_otp(email, otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset code.",
            )

        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        new_hash = hash_password(new_pwd)
        self.user_repo.update(user["id"], {"password_hash": new_hash})
        self.audit_repo.log(
            user_id=user["id"],
            action="PASSWORD_RESET_COMPLETED",
            entity_type="users",
            entity_id=user["id"],
        )

    def provision_admin(self, setup_token: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if not config.ADMIN_SETUP_TOKEN or setup_token != config.ADMIN_SETUP_TOKEN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin setup authorization token.",
            )

        email = data["email"].strip().lower()
        if self.user_repo.email_exists(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

        pwd_hash = hash_password(data["password"])
        record = {
            **data,
            "email": email,
            "role": "ADMIN",
            "password_hash": pwd_hash,
            "account_status": "active",
            "verification_status": "verified",
        }
        created = self.user_repo.create(record)
        self.audit_repo.log(
            user_id=created["id"],
            action="ADMIN_PROVISIONED",
            entity_type="users",
            entity_id=created["id"],
        )

        safe = dict(created)
        safe.pop("password_hash", None)
        return safe


_instance: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _instance
    if _instance is None:
        _instance = AuthService()
    return _instance

