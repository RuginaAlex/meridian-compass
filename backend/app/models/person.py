from app.extensions import db
from app.models.enums import Department, PersonType


class Person(db.Model):


    __tablename__ = "people"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    job_title = db.Column(db.String(120), nullable=False)
    department = db.Column(db.Enum(Department), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    slack_username = db.Column(db.String(80), nullable=True)
    ask_me_about = db.Column(db.String(255), nullable=True)
    type = db.Column(db.Enum(PersonType), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "job_title": self.job_title,
            "department": self.department.value if self.department else None,
            "email": self.email,
            "slack_username": self.slack_username,
            "ask_me_about": self.ask_me_about,
            "type": self.type.value,
        }
