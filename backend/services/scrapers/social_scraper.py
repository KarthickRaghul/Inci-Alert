import tweepy
from tweepy.errors import TooManyRequests, Unauthorized, TweepyException
import requests.exceptions

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAAb63QEAAAAAy5T%2BE2Lv1XnqNX9p5VjsxLs3ojU%3DZtZUzTVV8ikScfQ84gNzLEAfI4jkzNfFdhVx05BdU44E4Dfs4I"

if not BEARER_TOKEN:
    print("No Bearer Token provided. Skipping Twitter scraping.")
    client = None
else:
    client = tweepy.Client(bearer_token=BEARER_TOKEN)

def fetch_tweets_safe(client, query, max_results=100):
    if not client:
        print("Twitter client not initialized. Skipping fetch.")
        return []

    try:
        response = client.search_recent_tweets(
            query=query,
            tweet_fields=["created_at", "lang", "text", "author_id"],
            max_results=max_results,
        )
        if response.data:
            return [tweet.data for tweet in response.data]
        else:
            return []

    except TooManyRequests:
        print("Rate limit exceeded. Skipping Twitter fetch.")
        return []

    except Unauthorized:
        print("Unauthorized access - invalid or expired token. Skipping Twitter fetch.")
        return []

    except requests.exceptions.ConnectionError as e:
        print(f"Connection error: {e}. Skipping Twitter fetch.")
        return []

    except TweepyException as e:
        print(f"Tweepy error: {e}. Skipping Twitter fetch.")
        return []

    except Exception as e:
        print(f"Unexpected error: {e}. Skipping Twitter fetch.")
        return []

# Then your other functions remain the same
ENGLISH_KEYWORDS = ["fire", "accident", "theft", "emergency", "robbery", "crime", "disaster", "flood", "injury"]
TAMIL_KEYWORDS = ["தீ", "விபத்து", "கொள்ளை", "அவசர", "குற்றம்", "வெடிப்பு", "தாக்குதல்", "மழை", "காயம்"]

def build_query(keywords, lang):
    return "(" + " OR ".join(keywords) + f") lang:{lang} -is:retweet"

def fetch_english_tweets():
    query = build_query(ENGLISH_KEYWORDS, "en")
    return fetch_tweets_safe(client, query)

def fetch_tamil_tweets():
    query = build_query(TAMIL_KEYWORDS, "ta")
    return fetch_tweets_safe(client, query)

def fetch_social_data():
    return {
        "english": fetch_english_tweets(),
        "tamil": fetch_tamil_tweets()
    }

if __name__ == "__main__":
    data = fetch_social_data()
    print("English Tweets:")
    for tweet in data["english"]:
        print(tweet["text"])

    print("\nTamil Tweets:")
    for tweet in data["tamil"]:
        print(tweet["text"])
