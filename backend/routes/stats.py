from flask import Blueprint, jsonify
from sqlalchemy import func
from models.incident import Incident
from utils.db import SessionLocal

bp = Blueprint("stats", __name__, url_prefix="/stats")

@bp.route("/categories", methods=["GET"])
def stats_categories():
    session = SessionLocal()
    try:
        results = session.query(Incident.type, func.count(Incident.id)).group_by(Incident.type).all()
        return jsonify({t: c for t, c in results})
    finally:
        session.close()

@bp.route("/trends", methods=["GET"])
def stats_trends():
    session = SessionLocal()
    try:
        results = session.query(func.date_trunc("day", Incident.timestamp), func.count(Incident.id))\
            .group_by(func.date_trunc("day", Incident.timestamp)).order_by(func.date_trunc("day", Incident.timestamp)).all()
        return jsonify([
            {"date": str(date), "count": count} for date, count in results
        ])
    finally:
        session.close()

@bp.route("/hotspots", methods=["GET"])
def stats_hotspots():
    session = SessionLocal()
    try:
        results = session.query(Incident.location, func.count(Incident.id))\
            .group_by(Incident.location).order_by(func.count(Incident.id).desc()).limit(5).all()
        return jsonify([
            {"location": loc, "count": count} for loc, count in results
        ])
    finally:
        session.close()