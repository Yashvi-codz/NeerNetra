"""NEERNETRA — system status endpoint (drives the tactical header telemetry)."""
from fastapi import APIRouter
from services.config import VESSEL_DATA_PROVIDER, OCEAN_DATA_PROVIDER, WEATHER_DATA_PROVIDER, SATELLITE_PROVIDER
from services.vessel_provider import get_vessel_service

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health():
    _, vessel_status = get_vessel_service()
    return {
        "system": "ONLINE",
        "satellite": {"provider": SATELLITE_PROVIDER.upper(), "status": "DEMO" if SATELLITE_PROVIDER == "mock" else "LIVE"},
        "ais": {"provider": VESSEL_DATA_PROVIDER.upper(), "status": vessel_status},
        "ocean": {"provider": OCEAN_DATA_PROVIDER.upper(), "status": "DEMO" if OCEAN_DATA_PROVIDER == "mock" else "LIVE"},
        "weather": {"provider": WEATHER_DATA_PROVIDER.upper(), "status": "DEMO" if WEATHER_DATA_PROVIDER == "mock" else "LIVE"},
    }
