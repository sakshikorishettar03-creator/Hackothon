"""
routers/admin.py — Admin endpoints: escalation overview, SLA trigger, audit log.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from database import get_db
from models.issue import Issue
from models.audit import AuditLog
from schemas.common import APIResponse
from services.sla_service import escalate_overdue_issues

router = APIRouter()


@router.get("/admin/escalations", response_model=APIResponse)
def list_escalations(
    db: Session = Depends(get_db),
    ward_id: Optional[int] = Query(None),
):
    """Returns all issues that are past their SLA deadline and not yet resolved."""
    now = datetime.now(timezone.utc)
    query = db.query(Issue).filter(
        Issue.sla_deadline < now,
        Issue.status.notin_(["RESOLVED", "CLOSED", "DUPLICATE"]),
    )
    if ward_id:
        query = query.filter(Issue.ward_id == ward_id)

    issues = query.all()
    data = [
        {
            "id": i.id,
            "title": i.title,
            "category": i.category,
            "status": i.status,
            "escalation_level": i.escalation_level,
            "sla_deadline": i.sla_deadline.isoformat() if i.sla_deadline else None,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in issues
    ]
    return APIResponse(data=data, message=f"{len(data)} overdue issue(s)")


@router.post("/admin/sla/trigger", response_model=APIResponse)
def trigger_sla_check(db: Session = Depends(get_db)):
    """Manually triggers the SLA escalation check. Useful for testing."""
    count = escalate_overdue_issues(db)
    return APIResponse(message=f"SLA check complete. {count} issue(s) escalated.")


@router.get("/audit-log", response_model=APIResponse)
def get_audit_log(
    db: Session = Depends(get_db),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()) \
                .offset((page - 1) * page_size) \
                .limit(page_size) \
                .all()

    data = [
        {
            "id": log.id,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "action": log.action,
            "performed_by": log.performed_by,
            "details": log.details,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]
    return APIResponse(data={"total": total, "page": page, "results": data})
