"""
models/issue.py — Issue, IssuePhoto, and IssueStatusHistory tables.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Issue(Base):
    __tablename__ = "issues"

    id                  = Column(Integer, primary_key=True, index=True)
    title               = Column(String(200), nullable=False)
    category            = Column(String(100), nullable=False, index=True)
    description         = Column(Text, nullable=True)

    # Location
    latitude            = Column(Float, nullable=True)
    longitude           = Column(Float, nullable=True)
    address             = Column(String(300), nullable=True)
    ward_id             = Column(Integer, ForeignKey("wards.id"), nullable=True)

    # Reporter (no auth — just a name string)
    reporter_name       = Column(String(150), nullable=True)
    reporter_phone      = Column(String(20), nullable=True)
    reporter_email      = Column(String(200), nullable=True)

    # Status
    status              = Column(String(50), nullable=False, default="OPEN", index=True)
    # OPEN | ASSIGNED | IN_PROGRESS | ESCALATED | RESOLVED | CLOSED | DUPLICATE | RE_ROUTED

    # Assignment
    department_id       = Column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    current_assignee_role = Column(String(50), nullable=True)
    # Tracks who currently holds the issue: "officer" | "supervisor" | "commissioner"

    # Duplicate linking
    is_duplicate        = Column(Boolean, default=False)
    duplicate_of_id     = Column(Integer, ForeignKey("issues.id"), nullable=True)

    # SLA
    sla_deadline        = Column(DateTime(timezone=True), nullable=True)
    is_escalated        = Column(Boolean, default=False)
    escalation_level    = Column(Integer, default=0)
    # 0=officer, 1=supervisor, 2=commissioner

    # Timestamps
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at         = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    ward_rel            = relationship("Ward", back_populates="issues")
    department          = relationship("Department", back_populates="issues")
    assigned_officer    = relationship("Officer", foreign_keys=[assigned_officer_id])
    photos              = relationship("IssuePhoto", back_populates="issue", cascade="all, delete-orphan")
    status_history      = relationship("IssueStatusHistory", back_populates="issue",
                                       order_by="IssueStatusHistory.changed_at",
                                       cascade="all, delete-orphan")
    duplicate_of        = relationship("Issue", remote_side="Issue.id", foreign_keys=[duplicate_of_id])


class IssuePhoto(Base):
    __tablename__ = "issue_photos"

    id          = Column(Integer, primary_key=True, index=True)
    issue_id    = Column(Integer, ForeignKey("issues.id"), nullable=False)
    file_path   = Column(String(500), nullable=False)   # relative path inside /uploads
    original_filename = Column(String(300), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", back_populates="photos")


class IssueStatusHistory(Base):
    """
    Immutable log of every status transition for an issue.
    Also records re-routing and escalation events.
    """
    __tablename__ = "issue_status_history"

    id          = Column(Integer, primary_key=True, index=True)
    issue_id    = Column(Integer, ForeignKey("issues.id"), nullable=False)
    old_status  = Column(String(50), nullable=True)
    new_status  = Column(String(50), nullable=False)
    changed_by  = Column(String(150), nullable=False, default="system")
    note        = Column(Text, nullable=True)
    changed_at  = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", back_populates="status_history")
