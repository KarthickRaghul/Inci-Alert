from flask import Blueprint, request, jsonify
from sqlalchemy import select, and_
from utils.db import SessionLocal
from models.incident import Incident

bp = Blueprint("incidents", __name__, url_prefix="/incidents")

@bp.get("")
def list_incidents():
    session = SessionLocal()
    try:
        q = session.query(Incident)

        source = request.args.get("source")      # e.g., news, weather
        category = request.args.get("category")  # e.g., accident, weather
        search = request.args.get("q")
        limit = int(request.args.get("limit", 100))
        offset = int(request.args.get("offset", 0))

        if source:
            q = q.filter(Incident.source == source)
        if category:
            q = q.filter(Incident.category == category)
        if search:
            like = f"%{search}%"
            q = q.filter(
                (Incident.title.ilike(like)) | (Incident.description.ilike(like))
            )

        q = q.order_by(Incident.published_at.desc().nullslast(),
                       Incident.created_at.desc()).offset(offset).limit(limit)

        rows = q.all()
        data = [
            {
                "id": r.id,
                "source": r.source,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "url": r.url,
                "location": r.location,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "status": r.status,
                "published_at": r.published_at.isoformat() if r.published_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
        return jsonify(data)
    finally:
        session.close()

@bp.get("/<int:incident_id>")
def get_incident(incident_id: int):
    session = SessionLocal()
    try:
        r = session.get(Incident, incident_id)
        if not r:
            return jsonify({"error": "not found"}), 404
        return jsonify({
            "id": r.id,
            "source": r.source,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "url": r.url,
            "location": r.location,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "status": r.status,
            "published_at": r.published_at.isoformat() if r.published_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    finally:
        session.close()
