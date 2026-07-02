"""Importing every model here means a single `from app import models` (done
inside the app factory) is enough for SQLAlchemy to know about every table
before `db.create_all()` runs. Without this, tables defined in files that
were never imported simply wouldn't exist in the database.
"""
from app.models.person import Person
from app.models.employee import Employee
from app.models.template import OnboardingTaskTemplate
from app.models.task import OnboardingTask
from app.models.blocker import Blocker
from app.models.resource import Resource

__all__ = [
    "Person",
    "Employee",
    "OnboardingTaskTemplate",
    "OnboardingTask",
    "Blocker",
    "Resource",
]
