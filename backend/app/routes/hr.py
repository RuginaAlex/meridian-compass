from flask import Blueprint, jsonify

from app.models.employee import Employee
from app.services.onboarding_service import (
    calculate_progress,
    get_blocked_tasks,
    get_needs_attention,
    get_overdue_tasks,
)

hr_bp = Blueprint("hr", __name__)


@hr_bp.get("/dashboard")
def dashboard():
    employees = Employee.query.order_by(Employee.start_date).all()

    employee_rows = []
    for e in employees:
        data = e.to_dict()
        data["progress"] = calculate_progress(e)
        data["blocked_count"] = len(get_blocked_tasks(e))
        data["overdue_count"] = len(get_overdue_tasks(e))
        employee_rows.append(data)

    return jsonify(
        {
            "employees": employee_rows,
            "needs_attention": get_needs_attention(),
        }
    )
