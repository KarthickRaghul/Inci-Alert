from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
from config import Config

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
)

Base = declarative_base()
