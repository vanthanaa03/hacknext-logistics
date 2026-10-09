import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Primary: PostgreSQL database URL as per prompt fixed stack
POSTGRES_DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/drova_db")

# Optional fallback to SQLite if PostgreSQL service is not active on local host
SQLITE_FALLBACK_URL = "sqlite:///./drova.db"

engine = None
SessionLocal = None

try:
    # Try creating PostgreSQL engine first
    engine = create_engine(POSTGRES_DB_URL, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        pass
    print(f"Connected to PostgreSQL database: {POSTGRES_DB_URL}")
except Exception as e:
    print(f"PostgreSQL connection failed ({e}). Falling back to SQLite for local demonstration...")
    engine = create_engine(SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
