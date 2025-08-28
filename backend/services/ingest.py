from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from utils.db import SessionLocal
from models.incident import Incident
from services.scrapers.news_scraper import scrape_all_news
from services.scrapers.weather_scraper import fetch_current_weather
from services.ai_processor import categorize

def _insert_incident(session, payload: Dict):
    # map payload → model
    inc = Incident(
        source=payload["source"],
        category=payload.get("category"),
        title=payload.get("title"),
        description=payload.get("summary"),
        url=payload.get("url"),
        location=payload.get("location"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        published_at=payload.get("published_at"),
        status="reported",
    )
    session.add(inc)

def ingest_news() -> int:
    """Scrape TOI+CNN, categorize, write into DB. Returns count inserted."""
    session = SessionLocal()
    created = 0
    try:
        items: List[Dict] = scrape_all_news()
        for it in items:
            it["category"] = categorize(it.get("title"), it.get("summary"))

            # skip if URL already exists
            if it.get("url"):
                exists = session.execute(
                    select(Incident.id).where(Incident.url == it["url"])
                ).first()
                if exists:
                    continue

            try:
                _insert_incident(session, it)
                session.commit()
                created += 1
            except IntegrityError:
                session.rollback()
                # duplicate by unique constraint; ignore
                continue
        return created
    finally:
        session.close()

def ingest_weather(city: str) -> int:
    session = SessionLocal()
    try:
        it = fetch_current_weather(city)
        it["category"] = "weather"
        _insert_incident(session, it)
        session.commit()
        return 1
    finally:
        session.close()
