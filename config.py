"""
config.py — Application settings and SLA configuration.
All tuneable values live here. No magic numbers elsewhere.
"""

from pydantic_settings import BaseSettings
from typing import Dict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "CivicFlow"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./civicflow.db"

    # --- File Upload ---
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    # --- Duplicate Detection ---
    # Radius in metres within which two issues of the same category are considered duplicates
    DUPLICATE_RADIUS_METRES: float = 100.0

    # --- SLA config: hours per category ---
    # Format: { category: (officer_hours, supervisor_extra_hours, commissioner_extra_hours) }
    SLA_HOURS: Dict[str, tuple] = {
        "Road Damage":    (48, 24, 24),
        "Water Supply":   (24, 12, 12),
        "Electricity":    (24, 12, 12),
        "Garbage":        (72, 24, 24),
        "Sanitation":     (48, 24, 24),
        "Street Light":   (36, 12, 12),
        "Park & Garden":  (72, 48, 48),
        "Default":        (72, 48, 48),
    }

    # --- SLA checker task interval (seconds) ---
    SLA_CHECK_INTERVAL_SECONDS: int = 900  # 15 minutes

    # --- CORS ---
    CORS_ORIGINS: list = ["*"]  # Tighten in production

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
