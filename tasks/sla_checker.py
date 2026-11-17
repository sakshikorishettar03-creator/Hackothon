"""
tasks/sla_checker.py — Background asyncio task.
Every SLA_CHECK_INTERVAL_SECONDS, finds overdue issues and escalates them.
"""

import asyncio
import logging
from database import SessionLocal
from services.sla_service import escalate_overdue_issues
from config import settings

logger = logging.getLogger("sla_checker")


async def run_sla_check_loop():
    """
    Runs forever in the background.
    On each tick, opens a DB session, escalates overdue issues, closes session.
    """
    logger.info("SLA checker started. Interval: %ds", settings.SLA_CHECK_INTERVAL_SECONDS)
    while True:
        await asyncio.sleep(settings.SLA_CHECK_INTERVAL_SECONDS)
        db = SessionLocal()
        try:
            count = escalate_overdue_issues(db)
            if count:
                logger.info("SLA checker: escalated %d issue(s)", count)
        except Exception as e:
            logger.error("SLA checker error: %s", e)
        finally:
            db.close()
