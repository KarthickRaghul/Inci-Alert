from typing import List, Dict
from bs4 import BeautifulSoup
import requests
from datetime import datetime, timezone
import dateparser
from config import Config

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}

def _get(url: str):
    r = requests.get(url, headers=HEADERS, timeout=Config.REQUEST_TIMEOUT)
    r.raise_for_status()
    return r

def _parse_date(text: str):
    if not text:
        return None
    dt = dateparser.parse(text)
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt

def _summary_from_article(url: str) -> str:
    try:
        res = _get(url)
        soup = BeautifulSoup(res.content, "html.parser")
        paras = [p.get_text(strip=True) for p in soup.find_all("p")]
        return " ".join(paras[:3])[:1200] if paras else ""
    except Exception:
        return ""

def scrape_toi() -> List[Dict]:
    base = "https://timesofindia.indiatimes.com"
    res = _get(base)
    soup = BeautifulSoup(res.content, "html.parser")
    items = []

    # common tiles
    for div in soup.select("div.col_l_6 a[href]"):
        title = (div.get_text() or "").strip()
        href = div.get("href")
        if not title or not href:
            continue
        url = href if href.startswith("http") else (base + href)
        summary = _summary_from_article(url)
        # TOI shows date elsewhere; fallback to now
        items.append({
            "title": title,
            "summary": summary,
            "url": url,
            "source": "news",
            "published_at": datetime.now(timezone.utc),
        })

    # linktype2 section
    for div in soup.select("div.linktype2 a[href]"):
        title = (div.get_text() or "").strip()
        href = div.get("href")
        if not title or not href:
            continue
        url = href if href.startswith("http") else (base + href)
        summary = _summary_from_article(url)
        items.append({
            "title": title,
            "summary": summary,
            "url": url,
            "source": "news",
            "published_at": datetime.now(timezone.utc),
        })

    return items

def scrape_cnn() -> List[Dict]:
    base = "https://edition.cnn.com"
    items = []
    # homepage
    soup = BeautifulSoup(_get(base).content, "html.parser")
    for h in soup.select("h2 a[href], h3 a[href]"):
        title = (h.get_text() or "").strip()
        href = h.get("href")
        if not title or not href:
            continue
        url = href if href.startswith("http") else (base + href)
        summary = _summary_from_article(url)
        items.append({
            "title": title,
            "summary": summary,
            "url": url,
            "source": "news",
            "published_at": datetime.now(timezone.utc),
        })

    # articles listing
    soup2 = BeautifulSoup(_get(base + "/articles").content, "html.parser")
    for a in soup2.select("h3.cd__headline a[href]"):
        title = (a.get_text() or "").strip()
        href = a.get("href")
        url = href if href.startswith("http") else (base + href)
        summary = _summary_from_article(url)
        items.append({
            "title": title,
            "summary": summary,
            "url": url,
            "source": "news",
            "published_at": datetime.now(timezone.utc),
        })

    return items

def scrape_all_news() -> List[Dict]:
    # you can parallelize if needed; kept simple & robust
    out = []
    try:
        out.extend(scrape_toi())
    except Exception:
        pass
    try:
        out.extend(scrape_cnn())
    except Exception:
        pass
    # dedupe by URL
    seen = set()
    uniq = []
    for it in out:
        if it["url"] in seen:
            continue
        seen.add(it["url"])
        uniq.append(it)
    return uniq
