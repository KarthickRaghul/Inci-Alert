from typing import Dict
import requests
from datetime import datetime, timezone
from config import Config

def fetch_current_weather(city: str) -> Dict:
    if not Config.OPENWEATHER_API_KEY:
        raise RuntimeError("OPENWEATHER_API_KEY not set")
    params = {
        "q": city,
        "appid": Config.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    r = requests.get("https://api.openweathermap.org/data/2.5/weather",
                     params=params, timeout=Config.REQUEST_TIMEOUT)
    r.raise_for_status()
    j = r.json()
    desc = j["weather"][0]["description"]
    temp = j["main"]["temp"]
    lat = j["coord"]["lat"]
    lon = j["coord"]["lon"]
    text = f"Weather in {city}: {desc}, {temp}°C"
    return {
        "title": f"{city} weather",
        "summary": text,
        "url": None,
        "source": "weather",
        "published_at": datetime.now(timezone.utc),
        "location": city,
        "latitude": lat,
        "longitude": lon,
    }
