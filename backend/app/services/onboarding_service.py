"""Business logic around onboarding: generating a plan for a new employee,
and computing progress / overdue / needs-attention information.

Kept out of the routes on purpose - routes should stay thin (parse the
request, call a service, return JSON) so this logic can be unit tested
directly with pytest, without spinning up HTTP requests.
"""
from datetime import date, timedelta

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import ContactRole, OnboardingStatus, TaskStatus
from app.models.person import Person
from app.models.task import OnboardingTask
from app.models.template import OnboardingTaskTemplate


def _resolve_contact(employee: Employee, contact_role: ContactRole | None):
    """Turn a template's abstract contact_role into a real Person for this
    employee. Falls back to None (rather than raising) when the company's
    data is incomplete - e.g. no buddy assigned yet - so task generation
    never crashes because of missing setup.
    """
    if contact_role is None:
        return None

    if contact_role == ContactRole.MANAGER:
        return employee.manager_id
    if contact_role == ContactRole.BUDDY:
        return employee.buddy_id
    if contact_role == ContactRole.HR:
        hr_person = Person.query.filter_by(type="HR").first()
        return hr_person.id if hr_person else None
    if contact_role == ContactRole.IT:
        it_person = Person.query.filter_by(type="IT").first()
        return it_person.id if it_person else None
    return None


def generate_onboarding_plan(employee: Employee):
    """Create one OnboardingTask per OnboardingTaskTemplate for this employee.

    This is the single place where "what does onboarding look like" gets
    turned into real, due-dated tasks. Both the demo seed data and the
    "Add Employee" HR form call this function, so the plan is only ever
    defined once (in the templates table).
    """
    templates = OnboardingTaskTemplate.query.order_by(
        OnboardingTaskTemplate.stage, OnboardingTaskTemplate.order
    ).all()

    created_tasks = []
    for template in templates:
        due_date = employee.start_date + timedelta(days=template.day_offset)
        contact_person_id = _resolve_contact(employee, template.contact_role)

        task = OnboardingTask(
            employee_id=employee.id,
            title=template.title,
            description=template.description,
            why_this_matters=template.why_this_matters,
            stage=template.stage,
            order=template.order,
            due_date=due_date,
            status=TaskStatus.NOT_STARTED,
            contact_person_id=contact_person_id,
        )
        db.session.add(task)
        created_tasks.append(task)

    db.session.commit()
    return created_tasks


def calculate_progress(employee: Employee) -> int:
    """Percentage of the employee's tasks that are Completed.

    Deliberately recomputed from the tasks every time, instead of being
    stored as a column on Employee - with a handful of tasks per employee
    this is cheap, and it removes an entire class of "progress became
    stale after a task changed" bugs.
    """
    tasks = employee.tasks
    if not tasks:
        return 0

    completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
    return round((completed / len(tasks)) * 100)


def get_overdue_tasks(employee: Employee):
    return [t for t in employee.tasks if t.is_overdue]


def get_blocked_tasks(employee: Employee):
    return [t for t in employee.tasks if t.status == TaskStatus.BLOCKED]


def refresh_onboarding_status(employee: Employee):
    """Keep onboarding_status roughly in sync with task completion.

    Simple rule, intentionally: no tasks touched yet -> Not started;
    everything completed -> Completed; anything in between -> In progress.
    """
    tasks = employee.tasks
    if not tasks:
        employee.onboarding_status = OnboardingStatus.NOT_STARTED
    elif all(t.status == TaskStatus.COMPLETED for t in tasks):
        employee.onboarding_status = OnboardingStatus.COMPLETED
    elif all(t.status == TaskStatus.NOT_STARTED for t in tasks):
        employee.onboarding_status = OnboardingStatus.NOT_STARTED
    else:
        employee.onboarding_status = OnboardingStatus.IN_PROGRESS


def get_needs_attention():
    """Employees HR should look at right now: blocked tasks, overdue tasks,
    or missing manager/buddy. Used by the HR dashboard's "Needs attention"
    section - this is the whole point of the app, so it lives here as a
    single, directly testable function rather than being assembled ad-hoc
    in a route.
    """
    employees = Employee.query.all()
    attention = {
        "blocked": [],
        "overdue": [],
        "missing_manager": [],
        "missing_buddy": [],
    }

    for employee in employees:
        blocked = get_blocked_tasks(employee)
        overdue = get_overdue_tasks(employee)

        if blocked:
            attention["blocked"].append(
                {"employee": employee.to_dict(), "count": len(blocked)}
            )
        if overdue:
            attention["overdue"].append(
                {"employee": employee.to_dict(), "count": len(overdue)}
            )
        if employee.manager_id is None:
            attention["missing_manager"].append({"employee": employee.to_dict()})
        if employee.buddy_id is None:
            attention["missing_buddy"].append({"employee": employee.to_dict()})

    return attention
