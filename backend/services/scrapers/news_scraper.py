import requests
from bs4 import BeautifulSoup
import json

TAMIL_INCIDENT_KEYWORDS = [
    "தீ", "அம்பலம்", "கொலை", "கள்ளத்திருட்டு", "விபத்து",
    "ஓட்டுனர்", "பிடிப்பு", "கொலைகள்", "மோசடி", "தாக்குதல்",
    "தடுப்பு", "அவசர", "குற்றம்", "மின்", "கடத்தல்", "பேதகம்"
]

def fetch_tamil_oneindia():
    url = "https://tamil.oneindia.com/news/tamilnadu/"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
    except requests.RequestException:
        return []
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    news_items = soup.select("div.news-sec div.news-list a")  # update if needed
    for a in news_items:
        title = a.get_text(strip=True)
        link = a.get("href")
        if link and not link.startswith("http"):
            link = "https://tamil.oneindia.com" + link
        if any(keyword in title for keyword in TAMIL_INCIDENT_KEYWORDS):
            articles.append({"title": title, "link": link, "source": "Tamil OneIndia"})
    return articles

def fetch_dinamalar():
    url = "https://www.dinamalar.com/latest_news.asp?cat=1"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
    except requests.RequestException:
        return []
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    news_items = soup.select("div.latest_news ul li a")
    for a in news_items:
        title = a.get_text(strip=True)
        link = a.get("href")
        if link and not link.startswith("http"):
            link = "https://www.dinamalar.com" + link
        if any(keyword in title for keyword in TAMIL_INCIDENT_KEYWORDS):
            articles.append({"title": title, "link": link, "source": "Dinamalar"})
    return articles

def fetch_dt_next():
    url = "https://www.dtnext.in/News/TamilNadu"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
    except requests.RequestException:
        return []
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    news_items = soup.select("div.media-body h3 a")
    for a in news_items:
        title = a.get_text(strip=True)
        link = a.get("href")
        if link and not link.startswith("http"):
            link = "https://www.dtnext.in" + link
        if any(keyword in title for keyword in TAMIL_INCIDENT_KEYWORDS):
            articles.append({"title": title, "link": link, "source": "DT Next"})
    return articles

def fetch_news():
    all_articles = []
    for scraper in [fetch_tamil_oneindia, fetch_dinamalar, fetch_dt_next]:
        try:
            articles = scraper()
            all_articles.extend(articles)
        except Exception as e:
            print(f"[NewsScraper] Error fetching from {scraper.__name__}: {e}")
    return all_articles
