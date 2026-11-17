"""
schemas/common.py — Shared Pydantic types used across all schemas.
"""

from pydantic import BaseModel
from typing import TypeVar, Generic, Optional, Any

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Standard envelope for all API responses.
    Frontend always receives: { success, data, message }
    """
    success: bool = True
    data: Optional[T] = None
    message: str = "OK"


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[Any] = None


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20


# Valid issue statuses
VALID_STATUSES = [
    "OPEN", "ASSIGNED", "IN_PROGRESS",
    "ESCALATED", "RESOLVED", "CLOSED",
    "DUPLICATE", "RE_ROUTED"
]

# Valid issue categories
VALID_CATEGORIES = [
    "Road Damage", "Water Supply", "Electricity",
    "Garbage", "Sanitation", "Street Light",
    "Park & Garden", "Other"
]

# Valid officer roles
VALID_ROLES = ["officer", "supervisor", "commissioner"]
