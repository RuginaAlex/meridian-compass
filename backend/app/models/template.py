from app.extensions import db
from app.models.enums import ContactRole, TaskStage


class OnboardingTaskTemplate(db.Model):


    __tablename__ = "onboarding_task_templates"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False)
    why_this_matters = db.Column(db.Text, nullable=False)
    stage = db.Column(db.Enum(TaskStage), nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)

    # Days relative to the employee's start_date. Can be negative
    # (e.g. -3 for "before the first day" tasks).
    day_offset = db.Column(db.Integer, nullable=False, default=0)

    # Which *kind* of person should be the contact - resolved into an
    # actual Person when the real task is generated for an employee.
    contact_role = db.Column(db.Enum(ContactRole), nullable=True)
