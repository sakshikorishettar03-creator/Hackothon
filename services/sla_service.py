"""
services/sla_service.py — SLA deadline calculation and escalation logic.

Escalation chain (3 levels):
  Level 0 (officer):      assigned_officer owns the issue
  Level 1 (supervisor):   if officer SLA expires → escalate to supervisor
  Level 2 (commissioner): if supervisor SLA expires → escalate to commissioner

SLA hours come from config.py SLA_HOURS dict.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from config import settings
from models.issue import Issue, IssueStatusHistory
from models.ward import RoutingRule
from services.audit_service import log_action


def get_sla_hours(category: str) -> tuple:
    """Returns (officer_hours, supervisor_extra, commissioner_extra) for a category."""
    return settings.SLA_HOURS.get(category, settings.SLA_HOURS["Default"])


def calculate_initial_deadline(category: str, from_time: datetime = None) -> datetime:
    """
    Returns the SLA deadline for the officer level (level 0).
    from_time defaults to now (UTC).
    """
    officer_hours, _, _ = get_sla_hours(category)
    base = from_time or datetime.now(timezone.utc)
    return base + timedelta(hours=officer_hours)


def escalate_overdue_issues(db: Session) -> int:
    """
    Called by the SLA checker task on every tick.
    Finds all non-resolved issues past their SLA deadline and escalates them.
    Returns the number of issues escalated.
    """
    now = datetime.now(timezone.utc)
    escalated_count = 0

    overdue_issues = db.query(Issue).filter(
        Issue.sla_deadline < now,
        Issue.escalation_level < 2,                          # max level = commissioner
        Issue.status.notin_(["RESOLVED", "CLOSED", "DUPLICATE"]),
    ).all()

    for issue in overdue_issues:
        _escalate_issue(db, issue, now)
        escalated_count += 1

    if escalated_count:
        db.commit()

    return escalated_count


def _escalate_issue(db: Session, issue: Issue, now: datetime):
    """Performs one escalation step on a single issue."""
    rule = db.query(RoutingRule).filter(
        RoutingRule.category == issue.category,
        RoutingRule.ward_id == issue.ward_id,
        RoutingRule.is_active == True,
    ).first()

    # Fallback: category-only rule
    if not rule and issue.ward_id:
        rule = db.query(RoutingRule).filter(
            RoutingRule.category == issue.category,
            RoutingRule.is_active == True,
        ).first()

    old_level = issue.escalation_level
    _, supervisor_extra, commissioner_extra = get_sla_hours(issue.category)

    if issue.escalation_level == 0:
        # Officer → Supervisor
        issue.escalation_level = 1
        issue.current_assignee_role = "supervisor"
        issue.is_escalated = True
        if rule and rule.supervisor_id:
            issue.assigned_officer_id = rule.supervisor_id
        issue.sla_deadline = now + timedelta(hours=supervisor_extra)
        new_assignee = "supervisor"

    elif issue.escalation_level == 1:
        # Supervisor → Commissioner
        issue.escalation_level = 2
        issue.current_assignee_role = "commissioner"
        if rule and rule.commissioner_id:
            issue.assigned_officer_id = rule.commissioner_id
        issue.sla_deadline = now + timedelta(hours=commissioner_extra)
        new_assignee = "commissioner"

    else:
        return  # Already at max escalation

    issue.status = "ESCALATED"

    # Write status history entry
    history = IssueStatusHistory(
        issue_id=issue.id,
        old_status="ESCALATED" if old_level > 0 else issue.status,
        new_status="ESCALATED",
        changed_by="system",
        note=f"SLA breached. Escalated to {new_assignee} (level {issue.escalation_level}).",
    )
    db.add(history)

    # Audit trail
    log_action(
        db, "Issue", issue.id, "ESCALATED",
        performed_by="system",
        details={
            "from_level": old_level,
            "to_level": issue.escalation_level,
            "new_assignee_role": new_assignee,
        },
    )


def reset_sla_for_reroute(issue: Issue, new_category: str = None):
    """
    On re-routing, recalculate SLA from now.
    Uses original category unless a new category is specified.
    Preserves history — does not reset escalation_level.
    """
    category = new_category or issue.category
    officer_hours, _, _ = get_sla_hours(category)
    issue.sla_deadline = datetime.now(timezone.utc) + timedelta(hours=officer_hours)
    issue.escalation_level = 0
    issue.is_escalated = False
    issue.current_assignee_role = "officer"
