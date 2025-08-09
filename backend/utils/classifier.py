def classify_incident(description):
    desc = description.lower()
    if "fire" in desc:
        return "fire"
    elif "accident" in desc:
        return "accident"
    elif "crime" in desc or "theft" in desc:
        return "crime"
    elif "flood" in desc:
        return "flood"
    else:
        return "other"