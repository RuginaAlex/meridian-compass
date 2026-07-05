
from datetime import date, timedelta

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import ContactRole, OnboardingStatus, TaskStatus
from app.models.person import Person
from app.models.task import OnboardingTask
from app.models.template import OnboardingTaskTemplate


def _resolve_contact(employee: Employee, contact_role: ContactRole | None):

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
