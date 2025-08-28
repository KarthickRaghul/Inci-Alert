from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from utils.db import Base

class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True)
    filename = Column(String(260), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
