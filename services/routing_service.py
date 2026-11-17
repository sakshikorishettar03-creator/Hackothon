"""
services/routing_service.py — Auto-assigns department and officer to an issue.

Logic:
1. Look up an active RoutingRule where category matches AND ward_id matches.
2. If found, assign that rule's department and officer; store supervisor/commissioner IDs.
3. If no ward-specific rule, fall back to any rule with the same category (any ward).
4. If still no match, leave unassigned (manual triage required).
"""

from sqlalchemy.orm import Session
from models.ward import RoutingRule
from models.issue import Issue


def apply_routing(db: Session, issue: Issue) -> bool:
    """
    Finds the best RoutingRule for the issue and applies it.
    Returns True if a rule was found, False if unrouted.

    Mutates the issue object; caller must commit.
    """
    rule = None

    # 1. Exact match: category + ward
    if issue.ward_id:
        rule = db.query(RoutingRule).filter(
            RoutingRule.category == issue.category,
            RoutingRule.ward_id == issue.ward_id,
            RoutingRule.is_active == True,
        ).first()

    # 2. Category-only fallback (any ward)
    if not rule:
        rule = db.query(RoutingRule).filter(
            RoutingRule.category == issue.category,
            RoutingRule.is_active == True,
        ).first()

    if not rule:
        return False  # No routing found — stays OPEN, needs manual triage

    issue.department_id       = rule.department_id
    issue.assigned_officer_id = rule.assigned_officer_id
    issue.current_assignee_role = "officer"
    issue.status              = "ASSIGNED"

    # Store escalation chain on issue for quick SLA escalation lookups
    # We piggyback on the rule; sla_service reads these via the rule table
    issue._routing_rule_id = rule.id  # transient; used by sla_service
    return True


def get_rule_for_issue(db: Session, issue: Issue) -> RoutingRule | None:
    """Returns the active routing rule for an issue's current category + ward."""
    if issue.ward_id:
        rule = db.query(RoutingRule).filter(
            RoutingRule.category == issue.category,
            RoutingRule.ward_id == issue.ward_id,
            RoutingRule.is_active == True,
        ).first()
        if rule:
            return rule

    return db.query(RoutingRule).filter(
        RoutingRule.category == issue.category,
        RoutingRule.is_active == True,
    ).first()
