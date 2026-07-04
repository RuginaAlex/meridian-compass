from datetime import date

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import BlockerReason, BlockerStatus, Department, TaskStatus
from app.services.blocker_service import create_blocker, resolve_blocker
from app.services.onboarding_service import generate_onboarding_plan


def make_employee_with_tasks(**overrides):
    defaults = dict(
        first_name="Test",
        last_name="Employee",
        email="blocker.test@meridian.com",
        job_title="Developer",
        department=Department.ENGINEERING,
        start_date=date.today(),
    )
    defaults.update(overrides)
    employee = Employee(**defaults)
    db.session.add(employee)
    db.session.commit()
    tasks = generate_onboarding_plan(employee)
    return employee, tasks


class TestCreateBlocker:
    def test_blocking_sets_task_status_to_blocked(self, app, sample_templates):
        employee, tasks = make_employee_with_tasks()
        task = tasks[0]

        create_blocker(task, reason=BlockerReason.NO_ACCESS, message="No repo access yet.")

        assert task.status == TaskStatus.BLOCKED

    def test_blocking_creates_an_open_blocker_linked_to_the_task(self, app, sample_templates):
        employee, tasks = make_employee_with_tasks()
        task = tasks[0]

        blocker = create_blocker(task, reason=BlockerReason.DONT_KNOW_WHO, message=None)

        assert blocker.status == BlockerStatus.OPEN
        assert blocker.task_id == task.id
        assert blocker.employee_id == employee.id
        assert blocker.reason == BlockerReason.DONT_KNOW_WHO


class TestResolveBlocker:
    def test_resolving_marks_blocker_as_resolved(self, app, sample_templates):
        _, tasks = make_employee_with_tasks()
        blocker = create_blocker(tasks[0], reason=BlockerReason.OTHER, message=None)

        resolved = resolve_blocker(blocker)

        assert resolved.status == BlockerStatus.RESOLVED
        assert resolved.resolved_at is not None

    def test_resolving_moves_task_back_to_in_progress(self, app, sample_templates):
        _, tasks = make_employee_with_tasks()
        task = tasks[0]
        blocker = create_blocker(task, reason=BlockerReason.TECHNICAL, message="VPN broken")

        resolve_blocker(blocker)

        assert task.status == TaskStatus.IN_PROGRESS
