"""
schemas/department.py — Pydantic schemas for Department and Officer.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Department ---

class DepartmentCreate(BaseModel):
    name: str
    contact_email: Optional[str] = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    contact_email: Optional[str] = None

    model_config = {"from_attributes": True}


# --- Officer ---

class OfficerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "officer"          # officer | supervisor | commissioner
    department_id: Optional[int] = None
    ward_id: Optional[int] = None


class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    ward_id: Optional[int] = None
    is_active: Optional[bool] = None


class OfficerOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    department_id: Optional[int] = None
    ward_id: Optional[int] = None
    is_active: bool

    model_config = {"from_attributes": True}
