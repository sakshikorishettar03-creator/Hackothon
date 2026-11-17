"""
database.py — SQLAlchemy engine, session factory, and Base.
Import `get_db` as a FastAPI dependency in routers.
Import `Base` in models to register tables.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings


# SQLite: check_same_thread=False required for FastAPI's async request handling
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG,  # Logs SQL queries; set DEBUG=False in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All ORM models inherit from this Base."""
    pass


def get_db():
    """
    FastAPI dependency that provides a DB session per request.
    Ensures the session is always closed after the request.

    Usage in a router:
        @router.get("/")
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called once at app startup."""
    # Import models here so SQLAlchemy registers them before create_all
    import models.ward        # noqa: F401
    import models.department  # noqa: F401
    import models.issue       # noqa: F401
    import models.audit       # noqa: F401
    Base.metadata.create_all(bind=engine)
