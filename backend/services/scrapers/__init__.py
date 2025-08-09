from .news_scraper import fetch_news
from .social_scraper import fetch_social_data
from .weather_traffic_scraper import fetch_weather_traffic_alerts

def fetch_all_incident_data():
    results = {}
    results['news'] = fetch_news()
    results['social'] = fetch_social_data()
    results['weather_traffic'] = fetch_weather_traffic_alerts()
    return results
