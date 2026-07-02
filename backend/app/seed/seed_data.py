"""Populates the database with demo data: people, the onboarding task
templates, resources, and three employees in different onboarding
situations (see README for the full story behind each one).

Run with:  python -m app.seed.seed_data
(from inside backend/, with the virtualenv active)
"""
from datetime import date, timedelta

from app import create_app
from app.extensions import db
from app.models.blocker import Blocker
from app.models.employee import Employee
from app.models.enums import (
    BlockerReason,
    ContactRole,
    Department,
    PersonType,
    TaskStage,
    TaskStatus,
)
from app.models.person import Person
from app.models.resource import Resource
from app.models.template import OnboardingTaskTemplate
from app.services.blocker_service import create_blocker
from app.services.onboarding_service import generate_onboarding_plan, refresh_onboarding_status


def seed_people():
    people = [
        Person(
            name="Jordan Bailey",
            job_title="HR Business Partner",
            department=Department.HR,
            email="jordan.bailey@meridian.com",
            slack_username="@jordan.hr",
            ask_me_about="Onboarding, contracts, benefits",
            type=PersonType.HR,
        ),
        Person(
            name="Priya Nair",
            job_title="Engineering Manager",
            department=Department.ENGINEERING,
            email="priya.nair@meridian.com",
            slack_username="@priya",
            ask_me_about="Team priorities, code review process",
            type=PersonType.MANAGER,
        ),
        Person(
            name="Marcus Webb",
            job_title="Sales Manager",
            department=Department.SALES,
            email="marcus.webb@meridian.com",
            slack_username="@marcus",
            ask_me_about="Pipeline, quotas, CRM access",
            type=PersonType.MANAGER,
        ),
        Person(
            name="Elena Kovac",
            job_title="Marketing Manager",
            department=Department.MARKETING,
            email="elena.kovac@meridian.com",
            slack_username="@elena",
            ask_me_about="Campaigns, brand guidelines",
            type=PersonType.MANAGER,
        ),
        Person(
            name="Sam Rivera",
            job_title="IT Support Specialist",
            department=None,
            email="sam.rivera@meridian.com",
            slack_username="@sam.it",
            ask_me_about="Laptop issues, account access, VPN",
            type=PersonType.IT,
        ),
        Person(
            name="Liam Chen",
            job_title="Software Engineer",
            department=Department.ENGINEERING,
            email="liam.chen@meridian.com",
            slack_username="@liamc",
            ask_me_about="Codebase tour, local environment setup",
            type=PersonType.BUDDY,
        ),
        Person(
            name="Nora Fischer",
            job_title="Account Executive",
            department=Department.SALES,
            email="nora.fischer@meridian.com",
            slack_username="@noraf",
            ask_me_about="Deals in progress, customer calls",
            type=PersonType.BUDDY,
        ),
        Person(
            name="Tom Becker",
            job_title="Senior Software Engineer",
            department=Department.ENGINEERING,
            email="tom.becker@meridian.com",
            slack_username="@tomb",
            ask_me_about="Architecture decisions, best practices",
            type=PersonType.COLLEAGUE,
        ),
    ]
    db.session.add_all(people)
    db.session.commit()
    return {p.name: p for p in people}


def seed_templates():
    templates = [
        OnboardingTaskTemplate(
            title="Complete HR paperwork",
            description="Sign your contract and submit your banking and tax details through the HR portal.",
            why_this_matters="Payroll and benefits can only start correctly once this is done.",
            stage=TaskStage.BEFORE_FIRST_DAY,
            order=1,
            day_offset=-3,
            contact_role=ContactRole.HR,
        ),
        OnboardingTaskTemplate(
            title="Set up laptop and accounts",
            description="IT prepares your laptop and creates your company email and core accounts before day one.",
            why_this_matters="So you can log in and get started instead of losing your first morning to IT tickets.",
            stage=TaskStage.BEFORE_FIRST_DAY,
            order=2,
            day_offset=-1,
            contact_role=ContactRole.IT,
        ),
        OnboardingTaskTemplate(
            title="Meet your manager",
            description="A short intro call with your manager to go over what to expect this week.",
            why_this_matters="Your manager is your main point of contact for goals and priorities.",
            stage=TaskStage.FIRST_DAY,
            order=1,
            day_offset=0,
            contact_role=ContactRole.MANAGER,
        ),
        OnboardingTaskTemplate(
            title="Meet your onboarding buddy",
            description="Say hi to the colleague assigned as your onboarding buddy for day-to-day questions.",
            why_this_matters="A buddy gives you someone low-pressure to ask the small questions to.",
            stage=TaskStage.FIRST_DAY,
            order=2,
            day_offset=0,
            contact_role=ContactRole.BUDDY,
        ),
        OnboardingTaskTemplate(
            title="Get access to team tools and repositories",
            description="Request and confirm access to the systems your team uses daily.",
            why_this_matters="Without access you can't actually do your job, so this needs to happen fast.",
            stage=TaskStage.FIRST_DAY,
            order=3,
            day_offset=0,
            contact_role=ContactRole.IT,
        ),
        OnboardingTaskTemplate(
            title="Join core Slack channels",
            description="Join the general, department, and social Slack channels listed on the Resources page.",
            why_this_matters="This is where most day-to-day company communication actually happens.",
            stage=TaskStage.FIRST_WEEK,
            order=1,
            day_offset=2,
            contact_role=ContactRole.HR,
        ),
        OnboardingTaskTemplate(
            title="Read the company handbook",
            description="Read through the handbook covering policies, values and general expectations.",
            why_this_matters="Gives you context that would otherwise take months to pick up informally.",
            stage=TaskStage.FIRST_WEEK,
            order=2,
            day_offset=4,
            contact_role=ContactRole.HR,
        ),
        OnboardingTaskTemplate(
            title="Have your first 1:1 with your manager",
            description="A slightly longer check-in about how the first week went and goals for what's next.",
            why_this_matters="Catches confusion or blockers early, before they pile up.",
            stage=TaskStage.FIRST_WEEK,
            order=3,
            day_offset=6,
            contact_role=ContactRole.MANAGER,
        ),
        OnboardingTaskTemplate(
            title="Complete your first real task",
            description="Take on a small, real piece of work agreed with your manager.",
            why_this_matters="Nothing builds confidence in a new role like shipping something real.",
            stage=TaskStage.FIRST_MONTH,
            order=1,
            day_offset=15,
            contact_role=ContactRole.MANAGER,
        ),
        OnboardingTaskTemplate(
            title="First month check-in with HR",
            description="A short check-in with HR about how the first month went overall.",
            why_this_matters="Catches anything that fell through the cracks before it becomes a bigger problem.",
            stage=TaskStage.FIRST_MONTH,
            order=2,
            day_offset=25,
            contact_role=ContactRole.HR,
        ),
    ]
    db.session.add_all(templates)
    db.session.commit()


def seed_resources():
    resources = [
        Resource(
            title="Company handbook",
            description="Policies, values, and general expectations at Meridian.",
            category="Company",
            link="https://intranet.meridian.example/handbook",
        ),
        Resource(
            title="FAQ",
            description="Answers to the questions every new employee asks in the first month.",
            category="Company",
            link="https://intranet.meridian.example/faq",
        ),
        Resource(
            title="Office guide",
            description="Where to sit, badge access, meeting rooms, and coffee machine survival tips.",
            category="Workplace",
            link="https://intranet.meridian.example/office-guide",
        ),
        Resource(
            title="Remote work policy",
            description="Rules and expectations for the 2 remote days of the hybrid schedule.",
            category="Workplace",
            link="https://intranet.meridian.example/remote-policy",
        ),
        Resource(
            title="Equipment setup guide",
            description="How to set up your laptop, VPN and required software.",
            category="Tools & Communication",
            link="https://intranet.meridian.example/equipment-setup",
        ),
        Resource(
            title="Slack channel guide",
            description="Which channels to join first and what each one is for.",
            category="Tools & Communication",
            link="https://intranet.meridian.example/slack-guide",
        ),
        Resource(
            title="Google Meet guide",
            description="How meetings are scheduled and run at Meridian.",
            category="Tools & Communication",
            link="https://intranet.meridian.example/meet-guide",
        ),
        Resource(
            title="Security basics",
            description="Password rules, phishing awareness, and reporting a lost device.",
            category="Security",
            link="https://intranet.meridian.example/security-basics",
        ),
    ]
    db.session.add_all(resources)
    db.session.commit()


def seed_employees(people):
    today = date.today()

    emma = Employee(
        first_name="Emma",
        last_name="Turner",
        email="emma.turner@meridian.com",
        job_title="Backend Developer",
        department=Department.ENGINEERING,
        start_date=today - timedelta(days=1),
        manager_id=people["Priya Nair"].id,
        buddy_id=people["Liam Chen"].id,
    )
    db.session.add(emma)
    db.session.commit()

    emma_tasks = generate_onboarding_plan(emma)
    emma_by_title = {t.title: t for t in emma_tasks}

    for title in [
        "Complete HR paperwork",
        "Set up laptop and accounts",
        "Meet your manager",
        "Meet your onboarding buddy",
    ]:
        emma_by_title[title].status = TaskStatus.COMPLETED

    blocked_task = emma_by_title["Get access to team tools and repositories"]
    db.session.commit()  # persist completions before creating the blocker
    create_blocker(
        blocked_task,
        reason=BlockerReason.NO_ACCESS,
        message="I still don't have access to the GitHub org or any repositories, so I can't set up my local environment yet.",
    )
    refresh_onboarding_status(emma)
    db.session.commit()

    # --- David Miller: Sales, almost done, one task fell overdue ---
    david = Employee(
        first_name="David",
        last_name="Miller",
        email="david.miller@meridian.com",
        job_title="Sales Representative",
        department=Department.SALES,
        start_date=today - timedelta(days=20),
        manager_id=people["Marcus Webb"].id,
        buddy_id=people["Nora Fischer"].id,
    )
    db.session.add(david)
    db.session.commit()

    david_tasks = generate_onboarding_plan(david)
    david_by_title = {t.title: t for t in david_tasks}

    for title in [
        "Complete HR paperwork",
        "Set up laptop and accounts",
        "Meet your manager",
        "Meet your onboarding buddy",
        "Get access to team tools and repositories",
        "Join core Slack channels",
        "Read the company handbook",
        "Have your first 1:1 with your manager",
    ]:
        david_by_title[title].status = TaskStatus.COMPLETED

    # "Complete your first real task" is left Not started, and its due date
    # (start_date + 15 days) is now in the past -> shows up as overdue.
    refresh_onboarding_status(david)
    db.session.commit()

    # --- Sofia Brown: Marketing, starts in 3 days, buddy not assigned yet ---
    sofia = Employee(
        first_name="Sofia",
        last_name="Brown",
        email="sofia.brown@meridian.com",
        job_title="Marketing Specialist",
        department=Department.MARKETING,
        start_date=today + timedelta(days=3),
        manager_id=people["Elena Kovac"].id,
        buddy_id=None,
    )
    db.session.add(sofia)
    db.session.commit()

    generate_onboarding_plan(sofia)
    refresh_onboarding_status(sofia)
    db.session.commit()


def seed_database():
    db.drop_all()
    db.create_all()

    people = seed_people()
    seed_templates()
    seed_resources()
    seed_employees(people)

    print("Database seeded: 8 people, 10 task templates, 8 resources, 3 employees.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_database()
