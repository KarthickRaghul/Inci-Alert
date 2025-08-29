import os
import uuid
import mimetypes
from pathlib import Path
from PIL import Image
from werkzeug.utils import secure_filename
from config import Config

class FileHandler:
    def __init__(self):
        self.upload_folder = Path(Config.UPLOAD_FOLDER)
        self.upload_folder.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.upload_folder / 'images').mkdir(exist_ok=True)
        (self.upload_folder / 'videos').mkdir(exist_ok=True)
        (self.upload_folder / 'documents').mkdir(exist_ok=True)
        (self.upload_folder / 'thumbnails').mkdir(exist_ok=True)

    def allowed_file(self, filename: str) -> tuple[bool, str]:
        """Check if file extension is allowed and return media type."""
        if '.' not in filename:
            return False, ''
        
        ext = filename.rsplit('.', 1)[1].lower()
        
        for media_type, extensions in Config.ALLOWED_EXTENSIONS.items():
            if ext in extensions:
                return True, media_type
        
        return False, ''

    def validate_file_size(self, file_size: int) -> bool:
        """Validate file size against maximum allowed."""
        return file_size <= Config.MAX_CONTENT_LENGTH

    def generate_filename(self, original_filename: str) -> str:
        """Generate unique filename while preserving extension."""
        ext = Path(original_filename).suffix
        return f"{uuid.uuid4().hex}{ext}"

    def save_file(self, file, media_type: str) -> dict:
        """Save uploaded file and return file information."""
        try:
            # Validate file
            is_allowed, detected_type = self.allowed_file(file.filename)
            if not is_allowed:
                raise ValueError(f"File type not allowed: {file.filename}")
            
            # Generate secure filename
            original_filename = secure_filename(file.filename)
            new_filename = self.generate_filename(original_filename)
            
            # Determine subfolder based on media type
            subfolder = f"{media_type}s" if media_type in ['image', 'video', 'document'] else 'documents'
            file_path = self.upload_folder / subfolder / new_filename
            
            # Save file
            file.save(str(file_path))
            
            # Get file info
            file_size = os.path.getsize(file_path)
            mime_type = mimetypes.guess_type(str(file_path))[0]
            
            # Generate thumbnail for images
            thumbnail_path = None
            if media_type == 'image':
                thumbnail_path = self.generate_thumbnail(file_path, new_filename)
            
            return {
                'filename': new_filename,
                'original_filename': original_filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'mime_type': mime_type,
                'media_type': media_type,
                'thumbnail_path': thumbnail_path
            }
            
        except Exception as e:
            # Clean up if file was partially saved
            if 'file_path' in locals() and os.path.exists(file_path):
                os.remove(file_path)
            raise e

    def generate_thumbnail(self, image_path: Path, filename: str) -> str:
        """Generate thumbnail for image files."""
        try:
            thumbnail_filename = f"thumb_{filename}"
            thumbnail_path = self.upload_folder / 'thumbnails' / thumbnail_filename
            
            with Image.open(image_path) as img:
                # Convert to RGB if necessary (for JPEG)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Create thumbnail
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, 'JPEG', quality=85)
                
            return str(thumbnail_path)
            
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None

    def delete_file(self, file_path: str) -> bool:
        """Delete a file from the filesystem."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False

    def delete_media_files(self, media_record) -> bool:
        """Delete all files associated with a media record."""
        try:
            success = True
            
            # Delete main file
            if media_record.file_path:
                success &= self.delete_file(media_record.file_path)
            
            # Delete thumbnail
            if media_record.thumbnail_path:
                success &= self.delete_file(media_record.thumbnail_path)
            
            return success
        except Exception as e:
            print(f"Error deleting media files: {e}")
            return False
