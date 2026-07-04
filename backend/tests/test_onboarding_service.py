from datetime import date, timedelta

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import Department, TaskStatus
from app.services.onboarding_service import (
    calculate_progress,
    generate_onboarding_plan,
    get_overdue_tasks,
)


def make_employee(**overrides):
    defaults = dict(
        first_name="Test",
        last_name="Employee",
        email="test.employee@meridian.com",
        job_title="Developer",
        department=Department.ENGINEERING,
        start_date=date.today(),
    )
    defaults.update(overrides)
    employee = Employee(**defaults)
    db.session.add(employee)
    db.session.commit()
    return employee


class TestGenerateOnboardingPlan:
    def test_creates_one_task_per_template(self, app, sample_templates):
        employee = make_employee()
        tasks = generate_onboarding_plan(employee)
        assert len(tasks) == len(sample_templates)
        assert len(employee.tasks) == len(sample_templates)

    def test_due_dates_follow_day_offset(self, app, sample_templates):
        start = date.today()
        employee = make_employee(start_date=start)
        tasks = generate_onboarding_plan(employee)

        hr_task = next(t for t in tasks if t.title == "Complete HR paperwork")
        assert hr_task.due_date == start + timedelta(days=-3)

    def test_resolves_manager_as_contact_person(self, app, sample_templates):
        # A manager assigned to the employee should end up as the
        # contact_person on any task whose template asks for MANAGER.
        from app.models.person import Person
        from app.models.enums import PersonType

        manager = Person(
            name="Priya Nair",
            job_title="Engineering Manager",
            department=Department.ENGINEERING,
            email="priya.nair@meridian.com",
            slack_username="@priya",
            ask_me_about="Priorities",
            type=PersonType.MANAGER,
        )
        db.session.add(manager)
        db.session.commit()

        employee = make_employee(manager_id=manager.id)
        tasks = generate_onboarding_plan(employee)

        manager_task = next(t for t in tasks if t.title == "Meet your manager")
        assert manager_task.contact_person_id == manager.id

    def test_missing_manager_does_not_crash(self, app, sample_templates):
        # No manager assigned - the task should just have no contact person,
        # never raise an exception (see ASSUMPTIONS.md: missing data is
        # expected and must be handled gracefully).
        employee = make_employee(manager_id=None)
        tasks = generate_onboarding_plan(employee)

        manager_task = next(t for t in tasks if t.title == "Meet your manager")
        assert manager_task.contact_person_id is None


class TestCalculateProgress:
    def test_zero_percent_with_no_completed_tasks(self, app, sample_templates):
        employee = make_employee()
        generate_onboarding_plan(employee)
        assert calculate_progress(employee) == 0

    def test_partial_progress_rounds_correctly(self, app, sample_templates):
        employee = make_employee()
        tasks = generate_onboarding_plan(employee)
        tasks[0].status = TaskStatus.COMPLETED
        db.session.commit()

        # 1 out of 3 tasks completed -> 33% (rounded from 33.33...)
        assert calculate_progress(employee) == 33

    def test_all_completed_is_100_percent(self, app, sample_templates):
        employee = make_employee()
        tasks = generate_onboarding_plan(employee)
        for task in tasks:
            task.status = TaskStatus.COMPLETED
        db.session.commit()

        assert calculate_progress(employee) == 100

    def test_employee_with_no_tasks_is_zero_not_a_crash(self, app):
        employee = make_employee()
        assert calculate_progress(employee) == 0


class TestOverdueTasks:
    def test_past_due_incomplete_task_is_overdue(self, app, sample_templates):
        employee = make_employee(start_date=date.today() - timedelta(days=20))
        tasks = generate_onboarding_plan(employee)

        hr_task = next(t for t in tasks if t.title == "Complete HR paperwork")
        assert hr_task in get_overdue_tasks(employee)

    def test_blocked_task_is_not_counted_as_overdue(self, app, sample_templates):
        # A blocked task is already surfaced to HR through blocked_count -
        # it shouldn't also inflate overdue_count for the same reason.
        employee = make_employee(start_date=date.today() - timedelta(days=20))
        tasks = generate_onboarding_plan(employee)
        task = tasks[0]
        task.status = TaskStatus.BLOCKED
        db.session.commit()

        assert task not in get_overdue_tasks(employee)

    def test_completed_task_is_not_overdue_even_if_late(self, app, sample_templates):
        employee = make_employee(start_date=date.today() - timedelta(days=20))
        tasks = generate_onboarding_plan(employee)
        task = tasks[0]
        task.status = TaskStatus.COMPLETED
        db.session.commit()

        assert task not in get_overdue_tasks(employee)
