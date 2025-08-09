import json
from datetime import datetime
from scrapers import fetch_all_incident_data

def scrape_and_save(filename=None):
    data = fetch_all_incident_data()
    if not filename:
        filename = f"incident_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved scraped data to {filename}")
    return filename

if __name__ == "__main__":
    scrape_and_save()
