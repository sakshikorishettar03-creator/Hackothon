"""
routers/issues.py — Issue endpoints.
Handles multipart/form-data for photo + field submission.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.issue import Issue
from schemas.issue import IssueOut, IssueListOut, IssueStatusUpdate, IssueReroute, IssueStatusHistoryOut
from schemas.common import APIResponse
from services.issue_service import create_issue, update_issue_status, reroute_issue

router = APIRouter()


# ── Submit Issue ──────────────────────────────────────────────────────────────

@router.post("/issues", response_model=APIResponse[IssueOut], status_code=201)
async def submit_issue(
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    ward_id: Optional[int] = Form(None),
    reporter_name: Optional[str] = Form(None),
    reporter_phone: Optional[str] = Form(None),
    reporter_email: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Submit a new citizen issue.
    Content-Type: multipart/form-data
    All text fields sent as form fields; photo as file upload (optional).
    """
    issue = create_issue(
        db=db,
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
        photo=photo,
    )
    msg = "Issue submitted successfully"
    if issue.is_duplicate:
        msg = f"Issue submitted as duplicate of Issue #{issue.duplicate_of_id}"
    return APIResponse(data=issue, message=msg)


# ── List Issues ───────────────────────────────────────────────────────────────

@router.get("/issues", response_model=APIResponse[List[IssueListOut]])
def list_issues(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    ward_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    is_escalated: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    List issues with optional filters.
    Query params: status, category, ward_id, department_id, is_escalated, page, page_size
    """
    query = db.query(Issue)
    if status:
        query = query.filter(Issue.status == status)
    if category:
        query = query.filter(Issue.category == category)
    if ward_id:
        query = query.filter(Issue.ward_id == ward_id)
    if department_id:
        query = query.filter(Issue.department_id == department_id)
    if is_escalated is not None:
        query = query.filter(Issue.is_escalated == is_escalated)

    total = query.count()
    issues = (
        query.order_by(Issue.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return APIResponse(
        data=issues,
        message=f"{total} issue(s) found",
    )


# ── Issue Detail ──────────────────────────────────────────────────────────────

@router.get("/issues/{issue_id}", response_model=APIResponse[IssueOut])
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    """Full issue detail including photos and status history."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return APIResponse(data=issue)


# ── Public Tracking ───────────────────────────────────────────────────────────

@router.get("/track/{issue_id}", response_model=APIResponse)
def track_issue(issue_id: int, db: Session = Depends(get_db)):
    """
    Public tracking endpoint — no auth required.
    Returns issue status, timeline, and basic details.
    Does NOT expose reporter contact info.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    return APIResponse(data={
        "id": issue.id,
        "title": issue.title,
        "category": issue.category,
        "status": issue.status,
        "address": issue.address,
        "ward_id": issue.ward_id,
        "is_escalated": issue.is_escalated,
        "escalation_level": issue.escalation_level,
        "sla_deadline": issue.sla_deadline.isoformat() if issue.sla_deadline else None,
        "created_at": issue.created_at.isoformat() if issue.created_at else None,
        "resolved_at": issue.resolved_at.isoformat() if issue.resolved_at else None,
        "is_duplicate": issue.is_duplicate,
        "duplicate_of_id": issue.duplicate_of_id,
        "timeline": [
            {
                "status": h.new_status,
                "note": h.note,
                "changed_at": h.changed_at.isoformat() if h.changed_at else None,
            }
            for h in issue.status_history
        ],
        "photos": [
            {"url": f"/uploads/{p.file_path}"}
            for p in issue.photos
        ],
    })


# ── Status History ────────────────────────────────────────────────────────────

@router.get("/issues/{issue_id}/history", response_model=APIResponse[List[IssueStatusHistoryOut]])
def get_issue_history(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return APIResponse(data=issue.status_history)


# ── Update Status ─────────────────────────────────────────────────────────────

@router.patch("/issues/{issue_id}/status", response_model=APIResponse[IssueOut])
def update_status(issue_id: int, payload: IssueStatusUpdate, db: Session = Depends(get_db)):
    """
    Update issue status.
    Body: { new_status, note, changed_by }
    """
    try:
        issue = update_issue_status(
            db,
            issue_id=issue_id,
            new_status=payload.new_status,
            changed_by=payload.changed_by,
            note=payload.note,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(data=issue, message=f"Status updated to {payload.new_status}")


# ── Re-route Issue ────────────────────────────────────────────────────────────

@router.post("/issues/{issue_id}/reroute", response_model=APIResponse[IssueOut])
def reroute(issue_id: int, payload: IssueReroute, db: Session = Depends(get_db)):
    """
    Re-route issue to a new department/officer.
    Preserves full history. Resets SLA clock fairly.
    Body: { new_department_id, new_officer_id, reason, performed_by }
    """
    try:
        issue = reroute_issue(
            db,
            issue_id=issue_id,
            new_department_id=payload.new_department_id,
            new_officer_id=payload.new_officer_id,
            reason=payload.reason,
            performed_by=payload.performed_by,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(data=issue, message="Issue re-routed successfully")
