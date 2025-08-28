from typing import Optional

# lightweight keywords → category
KEYMAP = {
    "accident": ["accident", "crash", "collision", "pile-up"],
    "crime": ["murder", "robbery", "assault", "theft", "burglary"],
    "fire": ["fire", "blaze", "inferno"],
    "flood": ["flood", "inundation", "waterlogging"],
    "storm": ["storm", "cyclone", "typhoon", "wind"],
    "earthquake": ["earthquake", "tremor"],
    "traffic": ["traffic", "jam", "congestion"],
    "health": ["outbreak", "epidemic", "covid", "virus"],
    "weather": ["rain", "heatwave", "cold wave", "hail", "snow"],
}

def categorize(title: Optional[str], summary: Optional[str]) -> str:
    text = f"{title or ''} {summary or ''}".lower()
    best = None
    for label, words in KEYMAP.items():
        if any(w in text for w in words):
            best = label
            break
    return best or "general"
