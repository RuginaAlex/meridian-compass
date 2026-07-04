import pytest

from app import create_app
from app.extensions import db
from app.models.enums import ContactRole, Department, PersonType, TaskStage
from app.models.person import Person
from app.models.template import OnboardingTaskTemplate
from config import TestConfig


@pytest.fixture
def app():
    """A fresh Flask app + in-memory SQLite database for every single test.

    Function-scoped on purpose: tests that mutate data (completing a task,
    creating an employee) must never leak state into the next test. The
    small cost of recreating the schema per test is worth the isolation.
    """
    flask_app = create_app(TestConfig)
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def hr_person(app):
    """Most onboarding-plan generation needs an HR person to resolve
    ContactRole.HR against - without one, tasks would just end up with no
    contact_person, which is valid but not what most tests want to check.
    """
    person = Person(
        name="Jordan Bailey",
        job_title="HR Business Partner",
        department=Department.HR,
        email="jordan.bailey@meridian.com",
        slack_username="@jordan.hr",
        ask_me_about="Onboarding, contracts, benefits",
        type=PersonType.HR,
    )
    db.session.add(person)
    db.session.commit()
    return person


@pytest.fixture
def sample_templates(app, hr_person):
    """Three templates spanning three different stages - enough to exercise
    plan generation, due-date math, and progress percentages, without
    copy-pasting the full 10-item production seed into every test.
    """
    templates = [
        OnboardingTaskTemplate(
            title="Complete HR paperwork",
            description="Sign your contract and submit your details.",
            why_this_matters="Payroll needs this before day one.",
            stage=TaskStage.BEFORE_FIRST_DAY,
            order=1,
            day_offset=-3,
            contact_role=ContactRole.HR,
        ),
        OnboardingTaskTemplate(
            title="Meet your manager",
            description="A short intro call.",
            why_this_matters="Your manager sets your priorities.",
            stage=TaskStage.FIRST_DAY,
            order=1,
            day_offset=0,
            contact_role=ContactRole.MANAGER,
        ),
        OnboardingTaskTemplate(
            title="Complete your first real task",
            description="Take on a small piece of real work.",
            why_this_matters="Builds confidence in the new role.",
            stage=TaskStage.FIRST_MONTH,
            order=1,
            day_offset=15,
            contact_role=ContactRole.MANAGER,
        ),
    ]
    db.session.add_all(templates)
    db.session.commit()
    return templates
