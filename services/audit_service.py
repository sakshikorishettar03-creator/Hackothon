"""
services/audit_service.py — Writes entries to AuditLog.
Call this from any service whenever a significant state change occurs.
"""

import json
from sqlalchemy.orm import Session
from models.audit import AuditLog


def log_action(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: str,
    performed_by: str = "system",
    details: dict = None,
):
    """
    Write a single audit log entry.

    Args:
        entity_type:  e.g. "Issue", "RoutingRule", "Officer"
        entity_id:    Primary key of the affected record
        action:       e.g. "CREATED", "STATUS_CHANGED", "ESCALATED", "RE_ROUTED"
        performed_by: Name/ID of the actor (officer name, "system", "admin")
        details:      Dict with before/after context; stored as JSON string
    """
    entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        performed_by=performed_by,
        details=json.dumps(details) if details else None,
    )
    db.add(entry)
    # Note: caller is responsible for db.commit()
