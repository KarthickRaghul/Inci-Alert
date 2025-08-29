#!/usr/bin/env python3
"""
Test script for news aggregator and classification features
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.scrapers.news_scraper import scrape_all_news
from services.ai_processor import categorize
from services.ingest import ingest_news
import json

def test_news_scraping():
    """Test news scraping functionality"""
    print("=" * 60)
    print("TESTING NEWS SCRAPING")
    print("=" * 60)
    
    try:
        articles = scrape_all_news()
        print(f"✓ Successfully scraped {len(articles)} articles")
        
        if articles:
            print("\nSample articles:")
            for i, article in enumerate(articles[:3]):
                print(f"\n{i+1}. {article['title'][:100]}...")
                print(f"   URL: {article['url']}")
                print(f"   Summary: {article.get('summary', 'No summary')[:150]}...")
        else:
            print("⚠ No articles found - this might be due to website structure changes")
            
        return articles
    except Exception as e:
        print(f"✗ Error scraping news: {e}")
        return []

def test_classification(articles):
    """Test classification functionality"""
    print("\n" + "=" * 60)
    print("TESTING CLASSIFICATION")
    print("=" * 60)
    
    if not articles:
        print("No articles to classify")
        return
    
    print("Testing classification on sample articles:")
    for i, article in enumerate(articles[:5]):
        category = categorize(article.get('title'), article.get('summary'))
        print(f"\n{i+1}. Title: {article['title'][:80]}...")
        print(f"   Classified as: {category}")

def test_keyword_classification():
    """Test classification with known keywords"""
    print("\n" + "=" * 60)
    print("TESTING KEYWORD CLASSIFICATION")
    print("=" * 60)
    
    test_cases = [
        ("Car accident on highway", "Major car crash involving multiple vehicles", "accident"),
        ("Heavy rainfall causes flooding", "Streets waterlogged due to continuous rain", "flood"),
        ("Fire breaks out in building", "Major blaze reported in downtown area", "fire"),
        ("Bank robbery reported", "Armed men rob city bank", "crime"),
        ("Earthquake hits region", "5.2 magnitude tremor felt across the state", "earthquake"),
        ("Traffic jam on main road", "Severe congestion during rush hour", "traffic"),
        ("COVID outbreak in city", "Health officials report virus cases", "health"),
        ("Heatwave sweeps nation", "Temperatures soar above 45 degrees", "weather"),
    ]
    
    print("Testing predefined categories:")
    for title, summary, expected in test_cases:
        result = categorize(title, summary)
        status = "✓" if result == expected else "✗"
        print(f"{status} '{title}' -> Expected: {expected}, Got: {result}")

def test_database_integration():
    """Test database integration"""
    print("\n" + "=" * 60)
    print("TESTING DATABASE INTEGRATION")
    print("=" * 60)
    
    try:
        # This will test the full pipeline
        count = ingest_news()
        print(f"✓ Successfully ingested {count} new articles to database")
        if count == 0:
            print("  (No new articles - they may already exist in database)")
    except Exception as e:
        print(f"✗ Error ingesting news to database: {e}")
        print("  This might be due to database not being set up or connection issues")

if __name__ == "__main__":
    print("Inci-Alert News Aggregator Test Suite")
    print("====================================")
    
    # Test 1: News Scraping
    articles = test_news_scraping()
    
    # Test 2: Classification on real articles
    test_classification(articles)
    
    # Test 3: Classification with known keywords
    test_keyword_classification()
    
    # Test 4: Database integration (optional - requires DB setup)
    print("\nDo you want to test database integration? (y/n): ", end="")
    response = input().strip().lower()
    if response in ['y', 'yes']:
        test_database_integration()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
