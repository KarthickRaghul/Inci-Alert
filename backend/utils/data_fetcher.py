import requests
import csv
from models.incident import Incident
from utils.db import SessionLocal
from utils.classifier import classify_incident

def fetch_and_store_external_data(url):
    session = SessionLocal()
    try:
        response = requests.get(url)
        response.raise_for_status()
        reader = csv.DictReader(response.text.splitlines())
        for row in reader:
            description = row.get("description", "")
            incident = Incident(
                type=classify_incident(description),
                location=row.get("location", "Unknown"),
                description=description,
                status=row.get("status", "reported"),
                source="external"
            )
            session.add(incident)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
    finally:
        session.close()