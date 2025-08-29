from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from utils.db import Base

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False, index=True)
    
    # media type: image, video, audio, document
    media_type = Column(String(32), nullable=False, index=True)
    
    # file information
    filename = Column(String(512), nullable=False)
    original_filename = Column(String(512), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(128), nullable=True)
    
    # storage information
    file_path = Column(String(1024), nullable=False)  # local path or cloud URL
    thumbnail_path = Column(String(1024), nullable=True)  # for images/videos
    
    # metadata
    caption = Column(String, nullable=True)
    alt_text = Column(String(512), nullable=True)
    
    # timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationship
    incident = relationship("Incident", back_populates="media")
