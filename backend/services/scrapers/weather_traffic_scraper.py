import requests
from bs4 import BeautifulSoup
from datetime import datetime

IMD_ALERTS_URL = "https://mausam.imd.gov.in/"

def fetch_weather_traffic_alerts():
    try:
        res = requests.get(IMD_ALERTS_URL, timeout=10)
        res.raise_for_status()
    except requests.RequestException as e:
        print(f"[WeatherScraper] Error fetching IMD site: {e}")
        return []

    soup = BeautifulSoup(res.text, "html.parser")

    alerts = []
    alert_divs = soup.select("div.alert-section")  # Update this selector per actual site

    for div in alert_divs:
        title = div.find("h3")
        desc = div.find("p")
        date_str = div.find("span", class_="date")

        alert = {
            "title": title.text.strip() if title else "No title",
            "description": desc.text.strip() if desc else "No description",
            "date": date_str.text.strip() if date_str else datetime.now().isoformat(),
            "source": "IMD"
        }
        alerts.append(alert)

    return alerts
