"""
models/audit.py — AuditLog table.
Every significant action (create, update, reroute, escalation) writes here.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id           = Column(Integer, primary_key=True, index=True)
    entity_type  = Column(String(100), nullable=False)   # e.g. "Issue", "RoutingRule"
    entity_id    = Column(Integer, nullable=True)
    action       = Column(String(100), nullable=False)   # e.g. "CREATED", "ESCALATED", "RE_ROUTED"
    performed_by = Column(String(150), nullable=False, default="system")
    details      = Column(Text, nullable=True)           # JSON string with before/after context
    timestamp    = Column(DateTime(timezone=True), server_default=func.now(), index=True)
