from datetime import date

from app.extensions import db
from app.models.enums import TaskStage, TaskStatus


class OnboardingTask(db.Model):

    __tablename__ = "onboarding_tasks"

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)

    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False)
    why_this_matters = db.Column(db.Text, nullable=False)
    stage = db.Column(db.Enum(TaskStage), nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)

    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(
        db.Enum(TaskStatus), nullable=False, default=TaskStatus.NOT_STARTED
    )

    contact_person_id = db.Column(db.Integer, db.ForeignKey("people.id"), nullable=True)
    contact_person = db.relationship("Person", foreign_keys=[contact_person_id])

    blockers = db.relationship(
        "Blocker", backref="task", cascade="all, delete-orphan", lazy=True
    )

    @property
    def is_overdue(self):
        # A blocked task is already flagged to HR through blocked_count /
        # the "Needs attention" blocked list. Also counting it as overdue
        # would just duplicate the same alert under a second label instead
        # of adding new information.
        return (
                self.due_date < date.today()
                and self.status not in (TaskStatus.COMPLETED, TaskStatus.BLOCKED)
        )

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "title": self.title,
            "description": self.description,
            "why_this_matters": self.why_this_matters,
            "stage": self.stage.value,
            "order": self.order,
            "due_date": self.due_date.isoformat(),
            "status": self.status.value,
            "is_overdue": self.is_overdue,
            "contact_person": self.contact_person.to_dict() if self.contact_person else None,
        }
