from flask import Blueprint, jsonify

from app.models.resource import Resource

resources_bp = Blueprint("resources", __name__)


@resources_bp.get("")
def list_resources():
    resources = Resource.query.order_by(Resource.category, Resource.title).all()
    return jsonify([r.to_dict() for r in resources])
