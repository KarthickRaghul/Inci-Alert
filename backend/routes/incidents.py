from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import select, and_
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import ValidationError
from utils.db import SessionLocal
from models.incident import Incident
from models.media import Media
from utils.file_handler import FileHandler
from utils.validation import IncidentCreateSchema, IncidentUpdateSchema, validate_request_data
import traceback
from datetime import datetime

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
        data = []
        for r in rows:
            # Get media files for this incident
            media_files = []
            for media in r.media:
                media_files.append({
                    "id": media.id,
                    "media_type": media.media_type,
                    "filename": media.filename,
                    "original_filename": media.original_filename,
                    "file_size": media.file_size,
                    "mime_type": media.mime_type,
                    "caption": media.caption,
                    "alt_text": media.alt_text,
                    "thumbnail_url": f"/media/thumbnails/{media.filename}" if media.media_type == 'image' else None,
                    "file_url": f"/media/{media.media_type}s/{media.filename}",
                    "created_at": media.created_at.isoformat() if media.created_at else None
                })
                
            incident_data = {
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
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
                "media": media_files
            }
            data.append(incident_data)
        return jsonify(data)
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in list_incidents: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in list_incidents: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.post("")
def create_incident():
    """Create a new incident with optional media upload."""
    session = SessionLocal()
    file_handler = FileHandler()
    
    try:
        # Handle multipart form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            media_files = request.files.getlist('media')
        else:
            data = request.get_json() or {}
            media_files = []
        
        # Convert string coordinates to float if present
        if 'latitude' in data and data['latitude']:
            try:
                data['latitude'] = float(data['latitude'])
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid latitude value"}), 400
                
        if 'longitude' in data and data['longitude']:
            try:
                data['longitude'] = float(data['longitude'])
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid longitude value"}), 400
        
        # Validate the incident data
        try:
            validated_data = validate_request_data(IncidentCreateSchema, data)
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.messages}), 400
        
        # Create incident
        incident = Incident(**validated_data)
        session.add(incident)
        session.flush()  # Get the ID without committing
        
        # Handle media uploads
        media_records = []
        for media_file in media_files:
            if media_file and media_file.filename:
                try:
                    # Validate file
                    is_allowed, media_type = file_handler.allowed_file(media_file.filename)
                    if not is_allowed:
                        return jsonify({
                            "error": f"File type not allowed: {media_file.filename}"
                        }), 400
                    
                    # Validate file size
                    media_file.seek(0, 2)  # Seek to end
                    file_size = media_file.tell()
                    media_file.seek(0)  # Reset to beginning
                    
                    if not file_handler.validate_file_size(file_size):
                        return jsonify({
                            "error": f"File too large: {media_file.filename}. Maximum size is {current_app.config['MAX_CONTENT_LENGTH'] / 1024 / 1024:.1f}MB"
                        }), 400
                    
                    # Save file
                    file_info = file_handler.save_file(media_file, media_type)
                    
                    # Create media record
                    media = Media(
                        incident_id=incident.id,
                        media_type=file_info['media_type'],
                        filename=file_info['filename'],
                        original_filename=file_info['original_filename'],
                        file_size=file_info['file_size'],
                        mime_type=file_info['mime_type'],
                        file_path=file_info['file_path'],
                        thumbnail_path=file_info['thumbnail_path']
                    )
                    session.add(media)
                    media_records.append(media)
                    
                except Exception as e:
                    # Cleanup uploaded files on error
                    for media_record in media_records:
                        file_handler.delete_media_files(media_record)
                    
                    return jsonify({
                        "error": f"Failed to process media file {media_file.filename}: {str(e)}"
                    }), 400
        
        # Commit transaction
        session.commit()
        
        # Prepare response
        response_data = {
            "id": incident.id,
            "source": incident.source,
            "category": incident.category,
            "title": incident.title,
            "description": incident.description,
            "location": incident.location,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "status": incident.status,
            "created_at": incident.created_at.isoformat(),
            "media": [
                {
                    "id": media.id,
                    "media_type": media.media_type,
                    "filename": media.filename,
                    "original_filename": media.original_filename,
                    "file_size": media.file_size,
                    "mime_type": media.mime_type,
                    "thumbnail_url": f"/media/thumbnails/{media.filename}" if media.thumbnail_path else None,
                    "file_url": f"/media/{media.media_type}s/{media.filename}"
                }
                for media in media_records
            ]
        }
        
        current_app.logger.info(f"Created incident {incident.id} with {len(media_records)} media files")
        return jsonify(response_data), 201
        
    except ValidationError as e:
        session.rollback()
        return jsonify({"error": "Validation failed", "details": e.messages}), 400
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in create_incident: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in create_incident: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.get("/<int:incident_id>")
def get_incident(incident_id: int):
    """Get incident details with media information."""
    session = SessionLocal()
    try:
        # Get incident with media
        incident = session.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return jsonify({"error": "Incident not found"}), 404
        
        # Get associated media
        media_records = session.query(Media).filter(Media.incident_id == incident_id).all()
        
        response_data = {
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
            "media": [
                {
                    "id": media.id,
                    "media_type": media.media_type,
                    "filename": media.filename,
                    "original_filename": media.original_filename,
                    "file_size": media.file_size,
                    "mime_type": media.mime_type,
                    "caption": media.caption,
                    "alt_text": media.alt_text,
                    "thumbnail_url": f"/media/thumbnails/{media.filename}" if media.thumbnail_path else None,
                    "file_url": f"/media/{media.media_type}s/{media.filename}",
                    "created_at": media.created_at.isoformat()
                }
                for media in media_records
            ]
        }
        
        return jsonify(response_data)
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_incident: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_incident: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.put("/<int:incident_id>")
def update_incident(incident_id: int):
    """Update an existing incident."""
    session = SessionLocal()
    
    try:
        # Get incident
        incident = session.get(Incident, incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404
        
        # Get and validate data
        data = request.get_json() or {}
        try:
            validated_data = validate_request_data(IncidentUpdateSchema, data)
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.messages}), 400
        
        # Update incident fields
        for field, value in validated_data.items():
            setattr(incident, field, value)
        
        session.commit()
        
        # Return updated incident
        return jsonify({
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
        })
        
    except ValidationError as e:
        session.rollback()
        return jsonify({"error": "Validation failed", "details": e.messages}), 400
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in update_incident: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in update_incident: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.delete("/<int:incident_id>")
def delete_incident(incident_id: int):
    """Delete an incident and its associated media."""
    session = SessionLocal()
    file_handler = FileHandler()
    
    try:
        # Get incident
        incident = session.get(Incident, incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404
        
        # Get associated media for cleanup
        media_records = session.query(Media).filter(Media.incident_id == incident_id).all()
        
        # Delete media files from filesystem
        for media in media_records:
            file_handler.delete_media_files(media)
        
        # Delete from database (cascade will handle media records)
        session.delete(incident)
        session.commit()
        
        current_app.logger.info(f"Deleted incident {incident_id} with {len(media_records)} media files")
        return jsonify({"message": "Incident deleted successfully"}), 200
        
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in delete_incident: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in delete_incident: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()
