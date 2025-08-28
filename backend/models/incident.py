from sqlalchemy import Column, Integer, String, DateTime, Float, text, UniqueConstraint
from sqlalchemy.sql import func
from utils.db import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True)
    # high-level type you’ll query on (e.g., "news", "weather")
    source = Column(String(32), nullable=False, index=True)

    # normalized/category label (e.g., "accident", "crime", "weather-rain")
    category = Column(String(64), nullable=True, index=True)

    title = Column(String(512), nullable=True)
    description = Column(String, nullable=True)
    url = Column(String(1024), nullable=True, index=True)  # news article url

    # optional geo/text location
    location = Column(String(256), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    status = Column(String(32), nullable=False, server_default=text("'reported'"))

    published_at = Column(DateTime(timezone=True), nullable=True)  # article publish time
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        # avoid duplicate news by URL (NULL allowed for weather)
        UniqueConstraint('url', name='uq_incidents_url'),
    )
