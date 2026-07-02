from datetime import datetime

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import Department
from app.services.onboarding_service import (
    calculate_progress,
    generate_onboarding_plan,
    get_blocked_tasks,
    get_overdue_tasks,
)

employees_bp = Blueprint("employees", __name__)


@employees_bp.get("")
def list_employees():
    employees = Employee.query.order_by(Employee.start_date).all()
    result = []
    for e in employees:
        data = e.to_dict()
        data["progress"] = calculate_progress(e)
        data["blocked_count"] = len(get_blocked_tasks(e))
        data["overdue_count"] = len(get_overdue_tasks(e))
        result.append(data)
    return jsonify(result)


@employees_bp.get("/<int:employee_id>")
def get_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    data = employee.to_dict()
    data["progress"] = calculate_progress(employee)
    data["blocked_tasks"] = [t.to_dict() for t in get_blocked_tasks(employee)]
    data["overdue_tasks"] = [t.to_dict() for t in get_overdue_tasks(employee)]
    return jsonify(data)


REQUIRED_FIELDS = ["first_name", "last_name", "email", "job_title", "department", "start_date"]


@employees_bp.post("")
def create_employee():
    body = request.get_json(silent=True) or {}

    missing = [f for f in REQUIRED_FIELDS if not body.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if body["department"] not in [d.value for d in Department]:
        return jsonify({"error": f"Invalid department: {body['department']}"}), 400

    try:
        start_date = datetime.strptime(body["start_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "start_date must be in YYYY-MM-DD format"}), 400

    if Employee.query.filter_by(email=body["email"]).first():
        return jsonify({"error": "An employee with this email already exists"}), 400

    employee = Employee(
        first_name=body["first_name"],
        last_name=body["last_name"],
        email=body["email"],
        job_title=body["job_title"],
        department=Department(body["department"]),
        start_date=start_date,
        manager_id=body.get("manager_id"),
        buddy_id=body.get("buddy_id"),
    )
    db.session.add(employee)
    db.session.commit()

    generate_onboarding_plan(employee)

    data = employee.to_dict()
    data["progress"] = calculate_progress(employee)
    return jsonify(data), 201
