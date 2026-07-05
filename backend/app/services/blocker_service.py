from datetime import datetime, timezone

from app.extensions import db
from app.models.blocker import Blocker
from app.models.enums import BlockerStatus, TaskStatus
from app.models.task import OnboardingTask
from app.services.onboarding_service import refresh_onboarding_status


def create_blocker(task: OnboardingTask, reason: str, message: str | None = None) -> Blocker:

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

    blocker.status = BlockerStatus.RESOLVED
    blocker.resolved_at = datetime.now(timezone.utc)

    task = db.session.get(OnboardingTask, blocker.task_id)
    if task and task.status == TaskStatus.BLOCKED:
        task.status = TaskStatus.IN_PROGRESS
        refresh_onboarding_status(task.employee)

    db.session.commit()
    return blocker
