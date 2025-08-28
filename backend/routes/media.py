from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

from models.incident import Incident
from models.media import Media
from utils.db import SessionLocal

# Use a unique blueprint name and url_prefix for media
bp = Blueprint("media", __name__, url_prefix="/media")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "mp4", "mov", "avi"}
UPLOAD_FOLDER = os.path.abspath("uploads")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("", methods=["POST"])
def create_incident():
    session = SessionLocal()
    try:
        # Parse form values
        title = request.form.get("title")
        category = request.form.get("category")
        location = request.form.get("location")
        description = request.form.get("description")

        if not all([title, category, location, description]):
            return jsonify({"error": "Missing required incident fields"}), 400

        # Create incident record
        incident = Incident(
            title=title,
            category=category,
            location=location,
            description=description,
            status="reported", # adjust per your model
        )
        session.add(incident)
        session.flush()  # Get incident.id before commit

        # Handle optional media files
        media_urls = []
        files = request.files.getlist("file")
        for file in files:
            if file and allowed_file(file.filename):
                # Optional filesize check
                file.seek(0, os.SEEK_END)
                if file.tell() > 10 * 1024 * 1024:
                    return jsonify({"error": "File too large"}), 400
                file.seek(0)
                
                filename = secure_filename(file.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                
                media = Media(filename=filename, incident_id=incident.id)
                session.add(media)
                media_urls.append(f"/uploads/{filename}")

        session.commit()
        return jsonify({
            "incident_id": incident.id,
            "media_urls": media_urls,
            "message": "Incident created successfully" if not media_urls else "Incident and media created successfully"
        }), 201
    finally:
        session.close()