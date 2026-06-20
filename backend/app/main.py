"""VidyaFund AI — FastAPI Application Entry Point.

Institutional student-funding routing platform.
No crowdfunding, no donations, no sub-Rs.2000 requests.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables. Shutdown: close connections."""
    # Import models so they register with Base.metadata
    from app.models import (User, Student, FundingRequest, Funder,
                            Match, Transaction, ImpactLog)
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="VidyaFund AI",
    description="Institutional Student-Funding Routing Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files and reports as static
uploads_dir = os.path.abspath(settings.UPLOAD_DIR)
reports_dir = os.path.abspath(settings.REPORTS_DIR)
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(reports_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")

# Register API routers
from app.api.auth import router as auth_router
from app.api.requests import router as requests_router
from app.api.verify import router as verify_router
from app.api.match import router as match_router
from app.api.disburse import router as disburse_router
from app.api.impact import router as impact_router

app.include_router(auth_router)
app.include_router(requests_router)
app.include_router(verify_router)
app.include_router(match_router)
app.include_router(disburse_router)
app.include_router(impact_router)


@app.get("/")
async def root():
    return {
        "name": "VidyaFund AI",
        "description": "Institutional Student-Funding Routing Platform",
        "version": "1.0.0",
        "rules": {
            "min_amount": settings.MIN_REQUEST_AMOUNT,
            "categories": settings.ALLOWED_CATEGORIES,
            "max_requests_per_year": settings.MAX_REQUESTS_PER_YEAR,
            "funding_model": "institutional_only",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
