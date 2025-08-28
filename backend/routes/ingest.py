from flask import Blueprint, request, jsonify
from services.ingest import ingest_news, ingest_weather

bp = Blueprint("ingest", __name__, url_prefix="/ingest")

@bp.get("/news")
def ingest_news_route():
    created = ingest_news()
    return jsonify({"inserted": created})

@bp.get("/weather")
def ingest_weather_route():
    city = request.args.get("city", "Chennai")
    created = ingest_weather(city)
    return jsonify({"inserted": created, "city": city})
