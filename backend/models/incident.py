from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from utils.db import Base

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="reported")
    source = Column(String, default="user")