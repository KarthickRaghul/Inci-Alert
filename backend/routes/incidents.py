from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from models.incident import Incident
from models.media import Media
from utils.db import SessionLocal

bp = Blueprint("incidents", __name__, url_prefix="/incidents")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "mp4", "mov", "avi"}
UPLOAD_FOLDER = os.path.abspath("uploads")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.get("")
def list_incidents():
    session = SessionLocal()
    try:
        q = session.query(Incident)

        source = request.args.get("source")
        category = request.args.get("category")
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
        incident = session.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return jsonify({"error": "not found"}), 404

        media_files = session.query(Media).filter(Media.incident_id == incident_id).all()
        media_urls = [f"/uploads/{media.filename}" for media in media_files]

        result = {
            "id": incident.id,
            "source": incident.source,
            "category": incident.category,
            "title": incident.title,
            "description": incident.description,
            "url": incident.url,
            "location": incident.location,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "status": incident.status,
            "published_at": incident.published_at.isoformat() if incident.published_at else None,
            "created_at": incident.created_at.isoformat() if incident.created_at else None,
            "updated_at": incident.updated_at.isoformat() if incident.updated_at else None,
            "media_urls": media_urls
        }
        return jsonify(result)
    finally:
        session.close()

@bp.route("", methods=["POST"])
def create_incident():
    session = SessionLocal()
    try:
        title = request.form.get("title")
        category = request.form.get("category")
        location = request.form.get("location")
        description = request.form.get("description")
        if not all([title, category, location, description]):
            return jsonify({"error": "Missing required incident fields"}), 400

        incident = Incident(
            title=title,
            category=category,
            location=location,
            description=description,
            status="reported",
        )
        session.add(incident)
        session.flush()

        media_urls = []
        files = request.files.getlist("file")
        for file in files:
            if file and allowed_file(file.filename):
                file.seek(0, os.SEEK_END)
                if file.tell() > 10 * 1024 * 1024:
                    return jsonify({"error": "File too large"}), 400
                file.seek(0)

                filename = secure_filename(file.filename)
                # Prevent filename collisions by prefixing incident id and timestamp
                base, ext = os.path.splitext(filename)
                unique_filename = f"{incident.id}_{int(file.tell())}_{base}{ext}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)

                media = Media(filename=unique_filename, incident_id=incident.id)
                session.add(media)
                media_urls.append(f"/uploads/{unique_filename}")

        session.commit()
        return jsonify({
            "incident_id": incident.id,
            "media_urls": media_urls,
            "message": "Incident created successfully" if not media_urls else "Incident and media created successfully"
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    finally:
        session.close()
