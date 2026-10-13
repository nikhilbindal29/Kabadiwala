"""
core/exceptions.py - Custom exception classes for structured error responses.
"""
from typing import Any, Dict, Optional


class ScrapSetuError(Exception):
    """Base exception for all ScrapSetu application errors."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(self, message: Optional[str] = None, detail: Optional[Any] = None):
        self.message = message or self.message
        self.detail = detail
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {"detail": self.message, "code": self.error_code}
        if self.detail:
            result["errors"] = self.detail
        return result


class NotFoundError(ScrapSetuError):
    status_code = 404
    error_code = "NOT_FOUND"
    message = "Resource not found."


class ValidationError(ScrapSetuError):
    status_code = 422
    error_code = "VALIDATION_ERROR"
    message = "Validation failed."


class AuthenticationError(ScrapSetuError):
    status_code = 401
    error_code = "AUTHENTICATION_FAILED"
    message = "Authentication failed."


class AuthorizationError(ScrapSetuError):
    status_code = 403
    error_code = "FORBIDDEN"
    message = "You do not have permission to perform this action."


class ConflictError(ScrapSetuError):
    status_code = 409
    error_code = "CONFLICT"
    message = "Resource conflict."


class InvalidStateTransitionError(ScrapSetuError):
    status_code = 422
    error_code = "INVALID_STATE_TRANSITION"
    message = "Invalid state transition."


class RateLimitError(ScrapSetuError):
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests. Please try again later."


class StorageError(ScrapSetuError):
    status_code = 500
    error_code = "STORAGE_ERROR"
    message = "A storage error occurred."


class FileSizeError(ScrapSetuError):
    status_code = 413
    error_code = "FILE_TOO_LARGE"
    message = "Uploaded file exceeds the maximum allowed size."


class UnsupportedFileTypeError(ScrapSetuError):
    status_code = 415
    error_code = "UNSUPPORTED_FILE_TYPE"
    message = "File type is not supported."
