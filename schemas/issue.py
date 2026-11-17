"""
schemas/issue.py — Pydantic schemas for Issue, IssuePhoto, IssueStatusHistory.
Photo upload uses multipart/form-data — the file is handled separately via UploadFile.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Issue ---

class IssueCreate(BaseModel):
    """
    Used for JSON body fields alongside multipart photo upload.
    Frontend sends: title, category, description, latitude, longitude,
                    address, ward_id, reporter_name, reporter_phone, reporter_email
    """
    title: str
    category: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    ward_id: Optional[int] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    reporter_email: Optional[str] = None


class IssueStatusUpdate(BaseModel):
    new_status: str
    note: Optional[str] = None
    changed_by: str = "officer"


class IssueReroute(BaseModel):
    new_department_id: int
    new_officer_id: Optional[int] = None
    reason: str
    performed_by: str = "admin"


class IssuePhotoOut(BaseModel):
    id: int
    file_path: str
    original_filename: Optional[str] = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class IssueStatusHistoryOut(BaseModel):
    id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: str
    note: Optional[str] = None
    changed_at: datetime

    model_config = {"from_attributes": True}


class IssueOut(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    ward_id: Optional[int] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    status: str
    department_id: Optional[int] = None
    assigned_officer_id: Optional[int] = None
    current_assignee_role: Optional[str] = None
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    sla_deadline: Optional[datetime] = None
    is_escalated: bool
    escalation_level: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    photos: List[IssuePhotoOut] = []
    status_history: List[IssueStatusHistoryOut] = []

    model_config = {"from_attributes": True}


class IssueListOut(BaseModel):
    """Lightweight version for list views — no history, no photos."""
    id: int
    title: str
    category: str
    status: str
    ward_id: Optional[int] = None
    department_id: Optional[int] = None
    is_duplicate: bool
    is_escalated: bool
    escalation_level: int
    sla_deadline: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
