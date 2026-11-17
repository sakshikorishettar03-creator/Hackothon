"""
main.py — FastAPI application entry point.
Registers routers, initialises the database, and starts the SLA background task.
"""

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import init_db
from tasks.sla_checker import run_sla_check_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: create DB tables, ensure upload dir exists, launch SLA checker.
    Shutdown: cancel the SLA task cleanly.
    """
    # Create DB tables
    init_db()

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Start background SLA checker
    sla_task = asyncio.create_task(run_sla_check_loop())

    yield  # App runs here

    # Shutdown
    sla_task.cancel()
    try:
        await sla_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    description="Ward Issue Router with SLA Escalation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins during hackathon; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded photos as static files at /uploads/<filename>
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# --- Register Routers ---
from routers import issues, departments, wards, admin  # noqa: E402

app.include_router(issues.router,     prefix="/api", tags=["Issues"])
app.include_router(departments.router, prefix="/api", tags=["Departments & Officers"])
app.include_router(wards.router,      prefix="/api", tags=["Wards & Routing Rules"])
app.include_router(admin.router,      prefix="/api", tags=["Admin"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
