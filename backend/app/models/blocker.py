from datetime import datetime, timezone

from app.extensions import db
from app.models.enums import BlockerReason, BlockerStatus


class Blocker(db.Model):


    __tablename__ = "blockers"

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("onboarding_tasks.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)

    reason = db.Column(db.Enum(BlockerReason), nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum(BlockerStatus), nullable=False, default=BlockerStatus.OPEN)

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "employee_id": self.employee_id,
            "reason": self.reason.value,
            "message": self.message,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
