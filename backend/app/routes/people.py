from flask import Blueprint, jsonify

from app.models.person import Person

people_bp = Blueprint("people", __name__)


@people_bp.get("")
def list_people():
    people = Person.query.order_by(Person.type, Person.name).all()
    return jsonify([p.to_dict() for p in people])
