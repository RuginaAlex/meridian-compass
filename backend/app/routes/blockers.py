from flask import Blueprint, jsonify

from app.extensions import db
from app.models.blocker import Blocker
from app.models.employee import Employee
from app.models.enums import BlockerStatus
from app.services.blocker_service import resolve_blocker

blockers_bp = Blueprint("blockers", __name__)


@blockers_bp.get("/employee/<int:employee_id>")
def list_blockers_for_employee(employee_id):
    employee = db.session.get(Employee, employee_id)
    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    blockers = (
        Blocker.query.filter_by(employee_id=employee_id)
        .order_by(Blocker.created_at.desc())
        .all()
    )
    return jsonify([b.to_dict() for b in blockers])


@blockers_bp.post("/<int:blocker_id>/resolve")
def resolve(blocker_id):
    blocker = db.session.get(Blocker, blocker_id)
    if blocker is None:
        return jsonify({"error": "Blocker not found"}), 404

    if blocker.status == BlockerStatus.RESOLVED:
        return jsonify({"error": "Blocker is already resolved"}), 400

    blocker = resolve_blocker(blocker)
    return jsonify(blocker.to_dict())
