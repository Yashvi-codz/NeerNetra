"""
NEERNETRA — FastAPI application entrypoint.

Run locally with:
    uvicorn main:app --reload --port 8000

The frontend (Vite) proxies /api/* to this server in development — see
frontend/vite.config.ts. In production, set VITE_API_BASE_URL to this
server's public URL.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.config import FRONTEND_ORIGIN
from api.routes import incidents, vessels, dark_contacts, analysis, environment, health

app = FastAPI(
    title="NEERNETRA API",
    description="Maritime intelligence and oil-spill incident forensics backend.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(incidents.router)
app.include_router(vessels.router)
app.include_router(dark_contacts.router)
app.include_router(analysis.router)
app.include_router(environment.router)


@app.get("/")
def root():
    return {
        "name": "NEERNETRA API",
        "tagline": "One Eye. One Ocean. Zero Blind Spots.",
        "docs": "/docs",
    }
