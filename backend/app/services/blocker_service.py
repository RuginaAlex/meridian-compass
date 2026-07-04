"""Business logic for the "I'm blocked" feature: the key differentiator
of this app. Kept in its own service so the blocking/resolving rules can
be unit tested in isolation from the HTTP layer.
"""
from datetime import datetime, timezone

from app.extensions import db
from app.models.blocker import Blocker
from app.models.enums import BlockerStatus, TaskStatus
from app.models.task import OnboardingTask
from app.services.onboarding_service import refresh_onboarding_status


def create_blocker(task: OnboardingTask, reason: str, message: str | None = None) -> Blocker:
    """Mark a task as Blocked and record why.

    The task moves straight to BLOCKED regardless of its previous status -
    a blocked task isn't "in progress" anymore from HR's point of view,
    it's stuck and needs a human to unstick it.
    """
    blocker = Blocker(
        task_id=task.id,
        employee_id=task.employee_id,
        reason=reason,
        message=message,
        status=BlockerStatus.OPEN,
    )
    task.status = TaskStatus.BLOCKED

    db.session.add(blocker)
    refresh_onboarding_status(task.employee)
    db.session.commit()
    return blocker


def resolve_blocker(blocker: Blocker) -> Blocker:
    """Mark a blocker as resolved and move its task back to In progress.

    Moving the task automatically (rather than leaving it Blocked until the
    employee manually restarts it) matches how HR actually thinks about it:
    once they've unblocked someone, the ball is back in the employee's court.
    """
    blocker.status = BlockerStatus.RESOLVED
    blocker.resolved_at = datetime.now(timezone.utc)

    task = db.session.get(OnboardingTask, blocker.task_id)
    if task and task.status == TaskStatus.BLOCKED:
        task.status = TaskStatus.IN_PROGRESS
        refresh_onboarding_status(task.employee)

    db.session.commit()
    return blocker
