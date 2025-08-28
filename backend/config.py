import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://inci-admin:your_strong_password@localhost:5432/inci_alert"
    )
    REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "10"))  # seconds
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
