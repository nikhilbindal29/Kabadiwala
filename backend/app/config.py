"""
config.py - Application configuration loaded from environment variables.

All settings are read from a .env file (or real environment) via python-dotenv.
Sensitive keys are required and will raise ValueError if missing.
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env from the backend directory (parent of app/)
_BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(_BASE_DIR / ".env")


def _require(key: str) -> str:
    """Fetch a required environment variable or raise."""
    val = os.getenv(key)
    if not val:
        raise ValueError(f"Required environment variable '{key}' is not set. Check .env file.")
    return val


def _optional(key: str, default: str = "") -> str:
    return os.getenv(key, default)


def _parse_origins(raw: str) -> List[str]:
    return [o.strip() for o in raw.split(",") if o.strip()]


# ── Application ──────────────────────────────────────────────────────────────
APP_ENV: str = _optional("APP_ENV", "development")
APP_NAME: str = _optional("APP_NAME", "ScrapSetu")
APP_VERSION: str = _optional("APP_VERSION", "1.0.0")

# ── Security ─────────────────────────────────────────────────────────────────
JWT_SECRET_KEY: str = _require("JWT_SECRET_KEY")
JWT_ALGORITHM: str = _optional("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(_optional("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(_optional("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ── Admin Provisioning ───────────────────────────────────────────────────────
ADMIN_SETUP_TOKEN: str = _optional("ADMIN_SETUP_TOKEN", "")

# ── Storage ──────────────────────────────────────────────────────────────────
STORAGE_BACKEND: str = _optional("STORAGE_BACKEND", "csv")
if STORAGE_BACKEND != "csv":
    raise ValueError(f"Unsupported STORAGE_BACKEND='{STORAGE_BACKEND}'. Only 'csv' is supported.")

DATA_DIR: Path = _BASE_DIR / _optional("DATA_DIR", "data")
CSV_DIR: Path = _BASE_DIR / _optional("CSV_DIR", "data/csv")
UPLOADS_DIR: Path = _BASE_DIR / _optional("UPLOADS_DIR", "data/uploads")
EXPORTS_DIR: Path = _BASE_DIR / _optional("EXPORTS_DIR", "data/exports")
BACKUPS_DIR: Path = _BASE_DIR / _optional("BACKUPS_DIR", "data/backups")
MAX_UPLOAD_SIZE_MB: int = int(_optional("MAX_UPLOAD_SIZE_MB", "10"))
MAX_UPLOAD_SIZE_BYTES: int = MAX_UPLOAD_SIZE_MB * 1024 * 1024

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGINS: List[str] = _parse_origins(
    _optional("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
)

# ── Rate Limiting ─────────────────────────────────────────────────────────────
LOGIN_RATE_LIMIT_PER_MINUTE: int = int(_optional("LOGIN_RATE_LIMIT_PER_MINUTE", "10"))

# ── OTP ───────────────────────────────────────────────────────────────────────
OTP_EXPIRE_MINUTES: int = int(_optional("OTP_EXPIRE_MINUTES", "10"))

# ── Directories ───────────────────────────────────────────────────────────────
def ensure_dirs() -> None:
    """Create all required data directories if they don't exist."""
    for d in [DATA_DIR, CSV_DIR, UPLOADS_DIR, EXPORTS_DIR, BACKUPS_DIR]:
        d.mkdir(parents=True, exist_ok=True)
