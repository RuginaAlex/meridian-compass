from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.employee import Employee
from app.models.enums import BlockerReason, TaskStatus
from app.models.task import OnboardingTask
from app.services.blocker_service import create_blocker
from app.services.onboarding_service import refresh_onboarding_status

tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.get("/employee/<int:employee_id>")
def list_tasks_for_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    tasks = OnboardingTask.query.filter_by(employee_id=employee_id).order_by(
        OnboardingTask.stage, OnboardingTask.order
    ).all()
    return jsonify([t.to_dict() for t in tasks])


@tasks_bp.post("/<int:task_id>/complete")
def complete_task(task_id):
    task = OnboardingTask.query.get(task_id)
    if task is None:
        return jsonify({"error": "Task not found"}), 404

    task.status = TaskStatus.COMPLETED
    refresh_onboarding_status(task.employee)
    db.session.commit()
    return jsonify(task.to_dict())


@tasks_bp.post("/<int:task_id>/block")
def block_task(task_id):
    task = OnboardingTask.query.get(task_id)
    if task is None:
        return jsonify({"error": "Task not found"}), 404

    body = request.get_json(silent=True) or {}
    reason = body.get("reason")
    message = body.get("message")

    if reason not in [r.value for r in BlockerReason]:
        return jsonify({"error": f"Invalid reason: {reason}"}), 400

    blocker = create_blocker(task, reason=BlockerReason(reason), message=message)
    return jsonify({"task": task.to_dict(), "blocker": blocker.to_dict()}), 201
