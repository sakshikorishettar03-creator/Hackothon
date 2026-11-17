"""
routers/wards.py — Ward and RoutingRule endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.ward import Ward, RoutingRule
from schemas.ward import WardCreate, WardOut, RoutingRuleCreate, RoutingRuleOut
from schemas.common import APIResponse

router = APIRouter()


# ── Wards ─────────────────────────────────────────────────────────────────────

@router.get("/wards", response_model=APIResponse[List[WardOut]])
def list_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).all()
    return APIResponse(data=wards)


@router.post("/wards", response_model=APIResponse[WardOut], status_code=201)
def create_ward(payload: WardCreate, db: Session = Depends(get_db)):
    ward = Ward(**payload.model_dump())
    db.add(ward)
    db.commit()
    db.refresh(ward)
    return APIResponse(data=ward, message="Ward created")


# ── Routing Rules ─────────────────────────────────────────────────────────────

@router.get("/routing-rules", response_model=APIResponse[List[RoutingRuleOut]])
def list_routing_rules(db: Session = Depends(get_db)):
    rules = db.query(RoutingRule).filter(RoutingRule.is_active == True).all()
    return APIResponse(data=rules)


@router.post("/routing-rules", response_model=APIResponse[RoutingRuleOut], status_code=201)
def create_routing_rule(payload: RoutingRuleCreate, db: Session = Depends(get_db)):
    # Deactivate existing rule for same category+ward before creating new one
    existing = db.query(RoutingRule).filter(
        RoutingRule.category == payload.category,
        RoutingRule.ward_id == payload.ward_id,
        RoutingRule.is_active == True,
    ).first()
    if existing:
        existing.is_active = False

    rule = RoutingRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return APIResponse(data=rule, message="Routing rule created")


@router.delete("/routing-rules/{rule_id}", response_model=APIResponse)
def delete_routing_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(RoutingRule).filter(RoutingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    rule.is_active = False   # Soft delete — preserve history
    db.commit()
    return APIResponse(message="Routing rule deactivated")
