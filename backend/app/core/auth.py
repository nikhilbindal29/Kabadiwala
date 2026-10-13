"""
core/auth.py - Authentication helpers used by dependencies.

Contains token blacklist (in-memory for development) and OTP store.
"""
import threading
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Set, Tuple

# ── In-memory token blacklist (invalidated refresh tokens) ────────────────────
_blacklisted_tokens: Set[str] = set()
_blacklist_lock = threading.Lock()


def blacklist_token(token: str) -> None:
    """Add a refresh token to the blacklist."""
    with _blacklist_lock:
        _blacklisted_tokens.add(token)


def is_token_blacklisted(token: str) -> bool:
    """Check if a refresh token has been invalidated."""
    with _blacklist_lock:
        return token in _blacklisted_tokens


# ── In-memory OTP store ───────────────────────────────────────────────────────
# Maps email -> (otp_code, expires_at)
_otp_store: Dict[str, Tuple[str, datetime]] = {}
_otp_lock = threading.Lock()


def store_otp(email: str, otp: str, expire_minutes: int = 10) -> None:
    """Store an OTP for a given email address."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    with _otp_lock:
        _otp_store[email] = (otp, expires_at)


def verify_otp(email: str, otp: str) -> bool:
    """
    Verify an OTP for a given email.
    Returns True and clears the OTP if valid; False otherwise.
    """
    with _otp_lock:
        entry = _otp_store.get(email)
        if not entry:
            return False
        stored_otp, expires_at = entry
        if datetime.now(timezone.utc) > expires_at:
            del _otp_store[email]
            return False
        if stored_otp != otp:
            return False
        del _otp_store[email]
        return True


def clear_otp(email: str) -> None:
    """Remove OTP for a given email."""
    with _otp_lock:
        _otp_store.pop(email, None)
