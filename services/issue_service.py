"""
services/issue_service.py — Core business logic for issue lifecycle.

Responsibilities:
  - Create issue: duplicate check → routing → SLA deadline
  - Update issue status + write history
  - Re-route issue: preserve history, reset fair SLA
"""

import os
import uuid
import shutil
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import UploadFile

from config import settings
from models.issue import Issue, IssuePhoto, IssueStatusHistory
from services.duplicate_service import find_duplicate
from services.routing_service import apply_routing, get_rule_for_issue
from services.sla_service import calculate_initial_deadline, reset_sla_for_reroute
from services.audit_service import log_action


def create_issue(
    db: Session,
    title: str,
    category: str,
    description: str = None,
    latitude: float = None,
    longitude: float = None,
    address: str = None,
    ward_id: int = None,
    reporter_name: str = None,
    reporter_phone: str = None,
    reporter_email: str = None,
    photo: UploadFile = None,
) -> Issue:
    """
    Full issue creation flow:
      1. Check for geographic duplicate
      2. Create Issue record
      3. Auto-route (department + officer)
      4. Set SLA deadline
      5. Save photo if provided
      6. Write audit log
    """

    # Step 1: Duplicate detection
    duplicate_parent = find_duplicate(db, category, latitude, longitude)

    # Step 2: Create issue record
    issue = Issue(
        title=title,
        category=category,
        description=description,
        latitude=latitude,
        longitude=longitude,
        address=address,
        ward_id=ward_id,
        reporter_name=reporter_name,
        reporter_phone=reporter_phone,
        reporter_email=reporter_email,
        status="OPEN",
        is_duplicate=bool(duplicate_parent),
        duplicate_of_id=duplicate_parent.id if duplicate_parent else None,
    )

    if duplicate_parent:
        issue.status = "DUPLICATE"

    db.add(issue)
    db.flush()  # Get issue.id without committing

    # Step 3: Auto-route (only if not a duplicate)
    routed = False
    if not duplicate_parent:
        routed = apply_routing(db, issue)
        if not routed:
            issue.status = "OPEN"  # Stays open — needs manual triage

    # Step 4: SLA deadline
    if not duplicate_parent:
        issue.sla_deadline = calculate_initial_deadline(category)

    # Step 5: Save photo
    if photo and photo.filename:
        _save_photo(db, issue, photo)

    # Step 6: Initial status history
    history = IssueStatusHistory(
        issue_id=issue.id,
        old_status=None,
        new_status=issue.status,
        changed_by=reporter_name or "citizen",
        note="Issue submitted" + (" (duplicate detected)" if duplicate_parent else ""),
    )
    db.add(history)

    # Step 7: Audit log
    log_action(
        db, "Issue", issue.id, "CREATED",
        performed_by=reporter_name or "citizen",
        details={
            "category": category,
            "ward_id": ward_id,
            "routed": routed,
            "is_duplicate": bool(duplicate_parent),
            "duplicate_of_id": duplicate_parent.id if duplicate_parent else None,
        },
    )

    db.commit()
    db.refresh(issue)
    return issue


def update_issue_status(
    db: Session,
    issue_id: int,
    new_status: str,
    changed_by: str = "officer",
    note: str = None,
) -> Issue:
    """
    Updates the status of an issue and writes a history entry.
    Raises ValueError if issue not found.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise ValueError(f"Issue {issue_id} not found")

    old_status = issue.status
    issue.status = new_status

    if new_status in ("RESOLVED", "CLOSED"):
        issue.resolved_at = datetime.now(timezone.utc)

    history = IssueStatusHistory(
        issue_id=issue.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        note=note,
    )
    db.add(history)

    log_action(
        db, "Issue", issue.id, "STATUS_CHANGED",
        performed_by=changed_by,
        details={"from": old_status, "to": new_status, "note": note},
    )

    db.commit()
    db.refresh(issue)
    return issue


def reroute_issue(
    db: Session,
    issue_id: int,
    new_department_id: int,
    new_officer_id: int = None,
    reason: str = "",
    performed_by: str = "admin",
) -> Issue:
    """
    Re-routes an issue to a new department/officer.
    - Preserves full status history
    - Resets SLA clock fairly (from now)
    - Resets escalation level to 0 (officer)
    - Records old → new ownership in audit log
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise ValueError(f"Issue {issue_id} not found")

    old_dept = issue.department_id
    old_officer = issue.assigned_officer_id

    issue.department_id       = new_department_id
    issue.assigned_officer_id = new_officer_id
    issue.status              = "RE_ROUTED"

    # Fair SLA reset
    reset_sla_for_reroute(issue)

    # Status history
    history = IssueStatusHistory(
        issue_id=issue.id,
        old_status=issue.status,
        new_status="RE_ROUTED",
        changed_by=performed_by,
        note=f"Re-routed. Reason: {reason}",
    )
    db.add(history)

    # Audit trail
    log_action(
        db, "Issue", issue.id, "RE_ROUTED",
        performed_by=performed_by,
        details={
            "from_department_id": old_dept,
            "to_department_id": new_department_id,
            "from_officer_id": old_officer,
            "to_officer_id": new_officer_id,
            "reason": reason,
        },
    )

    db.commit()
    db.refresh(issue)
    return issue


def _save_photo(db: Session, issue: Issue, upload: UploadFile):
    """Saves uploaded photo to disk and records it in IssuePhoto table."""
    ext = os.path.splitext(upload.filename)[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(upload.file, f)

    photo = IssuePhoto(
        issue_id=issue.id,
        file_path=filename,
        original_filename=upload.filename,
    )
    db.add(photo)
