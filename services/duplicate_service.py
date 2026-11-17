"""
services/duplicate_service.py — Detects duplicate issues using category + geographic proximity.

Algorithm:
1. Find all OPEN/ASSIGNED/IN_PROGRESS issues with the same category.
2. For each, compute the Haversine distance to the new issue's location.
3. If any is within DUPLICATE_RADIUS_METRES, mark the new issue as a duplicate.

No external libraries needed — pure Python math.
"""

import math
from sqlalchemy.orm import Session
from models.issue import Issue
from config import settings


def _haversine_metres(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Returns the great-circle distance in metres between two GPS coordinates.
    Uses the Haversine formula.
    """
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_duplicate(db: Session, category: str, latitude: float, longitude: float) -> Issue | None:
    """
    Returns the first open issue of the same category within the duplicate radius.
    Returns None if no duplicate found, or if location data is missing.
    """
    if latitude is None or longitude is None:
        return None  # Can't do geo check without coordinates

    active_statuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "ESCALATED"]
    candidates = db.query(Issue).filter(
        Issue.category == category,
        Issue.status.in_(active_statuses),
        Issue.is_duplicate == False,
        Issue.latitude.isnot(None),
        Issue.longitude.isnot(None),
    ).all()

    for candidate in candidates:
        distance = _haversine_metres(
            latitude, longitude,
            candidate.latitude, candidate.longitude,
        )
        if distance <= settings.DUPLICATE_RADIUS_METRES:
            return candidate  # Found a nearby duplicate

    return None
