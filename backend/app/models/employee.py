from datetime import date

from app.extensions import db
from app.models.enums import Department, OnboardingStatus


class Employee(db.Model):


    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    job_title = db.Column(db.String(120), nullable=False)
    department = db.Column(db.Enum(Department), nullable=False)
    start_date = db.Column(db.Date, nullable=False)

    manager_id = db.Column(db.Integer, db.ForeignKey("people.id"), nullable=True)
    buddy_id = db.Column(db.Integer, db.ForeignKey("people.id"), nullable=True)

    onboarding_status = db.Column(
        db.Enum(OnboardingStatus), nullable=False, default=OnboardingStatus.NOT_STARTED
    )

    manager = db.relationship("Person", foreign_keys=[manager_id])
    buddy = db.relationship("Person", foreign_keys=[buddy_id])
    tasks = db.relationship(
        "OnboardingTask", backref="employee", cascade="all, delete-orphan", lazy=True
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def days_since_start(self):
        return (date.today() - self.start_date).days

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "email": self.email,
            "job_title": self.job_title,
            "department": self.department.value,
            "start_date": self.start_date.isoformat(),
            "onboarding_status": self.onboarding_status.value,
            "manager": self.manager.to_dict() if self.manager else None,
            "buddy": self.buddy.to_dict() if self.buddy else None,
        }
