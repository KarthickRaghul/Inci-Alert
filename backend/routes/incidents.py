from flask import Blueprint, request, jsonify, abort
from models.incident import Incident
from utils.db import SessionLocal
from utils.classifier import classify_incident

bp = Blueprint("incidents", __name__, url_prefix="/incidents")

@bp.route("", methods=["POST"])
def create_incident():
    data = request.get_json()
    if not data or not all(k in data for k in ("location", "description")):
        return jsonify({"error": "Missing required fields"}), 400
    session = SessionLocal()
    try:
        category = classify_incident(data["description"])
        incident = Incident(
            type=category,
            location=data["location"],
            description=data["description"],
            status=data.get("status", "reported"),
            source=data.get("source", "user"),
        )
        session.add(incident)
        session.commit()
        return jsonify({"id": incident.id}), 201
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@bp.route("", methods=["GET"])
def list_incidents():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    session = SessionLocal()
    try:
        query = session.query(Incident).order_by(Incident.timestamp.desc())
        total = query.count()
        incidents = query.offset((page-1)*per_page).limit(per_page).all()
        return jsonify({
            "total": total,
            "incidents": [
                {
                    "id": i.id,
                    "type": i.type,
                    "location": i.location,
                    "description": i.description,
                    "timestamp": i.timestamp.isoformat(),
                    "status": i.status,
                    "source": i.source,
                } for i in incidents
            ]
        })
    finally:
        session.close()

@bp.route("/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    session = SessionLocal()
    try:
        incident = session.query(Incident).get(incident_id)
        if not incident:
            abort(404)
        return jsonify({
            "id": incident.id,
            "type": incident.type,
            "location": incident.location,
            "description": incident.description,
            "timestamp": incident.timestamp.isoformat(),
            "status": incident.status,
            "source": incident.source,
        })
    finally:
        session.close()