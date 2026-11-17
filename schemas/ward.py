"""
schemas/ward.py — Pydantic schemas for Ward and RoutingRule.
"""

from pydantic import BaseModel
from typing import Optional


# --- Ward ---

class WardCreate(BaseModel):
    name: str
    city: str = "CivicCity"


class WardOut(BaseModel):
    id: int
    name: str
    city: str

    model_config = {"from_attributes": True}


# --- RoutingRule ---

class RoutingRuleCreate(BaseModel):
    category: str
    ward_id: int
    department_id: int
    assigned_officer_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    commissioner_id: Optional[int] = None


class RoutingRuleOut(BaseModel):
    id: int
    category: str
    ward_id: int
    department_id: int
    assigned_officer_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    commissioner_id: Optional[int] = None
    is_active: bool

    model_config = {"from_attributes": True}
