import json

def load_scraped_data(filename):
    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# Usage example:
if __name__ == "__main__":
    filename = "incident_data_20250809_201500.json"  # update accordingly
    data = load_scraped_data(filename)
    print(f"Loaded {len(data.get('news', []))} news items")
    # Add your AI processing logic here
