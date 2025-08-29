from flask import Blueprint, send_from_directory, abort, current_app
from pathlib import Path
import os

bp = Blueprint("media", __name__, url_prefix="/media")

@bp.route('/images/<filename>')
def serve_image(filename):
    """Serve image files."""
    try:
        upload_folder = Path(current_app.config.get('UPLOAD_FOLDER', 'uploads'))
        images_path = upload_folder / 'images'
        
        if not images_path.exists():
            abort(404)
        
        file_path = images_path / filename
        if not file_path.exists() or not file_path.is_file():
            abort(404)
        
        return send_from_directory(str(images_path), filename)
    except Exception as e:
        current_app.logger.error(f"Error serving image {filename}: {str(e)}")
        abort(404)

@bp.route('/videos/<filename>')
def serve_video(filename):
    """Serve video files."""
    try:
        upload_folder = Path(current_app.config.get('UPLOAD_FOLDER', 'uploads'))
        videos_path = upload_folder / 'videos'
        
        if not videos_path.exists():
            abort(404)
        
        file_path = videos_path / filename
        if not file_path.exists() or not file_path.is_file():
            abort(404)
        
        return send_from_directory(str(videos_path), filename)
    except Exception as e:
        current_app.logger.error(f"Error serving video {filename}: {str(e)}")
        abort(404)

@bp.route('/documents/<filename>')
def serve_document(filename):
    """Serve document files."""
    try:
        upload_folder = Path(current_app.config.get('UPLOAD_FOLDER', 'uploads'))
        documents_path = upload_folder / 'documents'
        
        if not documents_path.exists():
            abort(404)
        
        file_path = documents_path / filename
        if not file_path.exists() or not file_path.is_file():
            abort(404)
        
        return send_from_directory(str(documents_path), filename)
    except Exception as e:
        current_app.logger.error(f"Error serving document {filename}: {str(e)}")
        abort(404)

@bp.route('/thumbnails/<filename>')
def serve_thumbnail(filename):
    """Serve thumbnail files."""
    try:
        upload_folder = Path(current_app.config.get('UPLOAD_FOLDER', 'uploads'))
        thumbnails_path = upload_folder / 'thumbnails'
        
        if not thumbnails_path.exists():
            abort(404)
        
        file_path = thumbnails_path / filename
        if not file_path.exists() or not file_path.is_file():
            abort(404)
        
        return send_from_directory(str(thumbnails_path), filename)
    except Exception as e:
        current_app.logger.error(f"Error serving thumbnail {filename}: {str(e)}")
        abort(404)
