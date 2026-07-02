from flask import Blueprint, jsonify

from app.models.blocker import Blocker
from app.models.enums import BlockerStatus
from app.services.blocker_service import resolve_blocker

blockers_bp = Blueprint("blockers", __name__)


@blockers_bp.post("/<int:blocker_id>/resolve")
def resolve(blocker_id):
    blocker = Blocker.query.get(blocker_id)
    if blocker is None:
        return jsonify({"error": "Blocker not found"}), 404

    if blocker.status == BlockerStatus.RESOLVED:
        return jsonify({"error": "Blocker is already resolved"}), 400

    blocker = resolve_blocker(blocker)
    return jsonify(blocker.to_dict())
