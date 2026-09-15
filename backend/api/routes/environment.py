"""NEERNETRA — environmental & contextual layer endpoints (fisheries, MPAs, satellite, ocean, weather)."""
from fastapi import APIRouter
from data.mock_environment import FISHING_ZONES, MPAS, SATELLITE_FOOTPRINTS, OCEAN_SAMPLES, WEATHER_SAMPLES

router = APIRouter(prefix="/api", tags=["environment"])


@router.get("/fishing-zones")
def list_fishing_zones():
    return FISHING_ZONES


@router.get("/mpas")
def list_mpas():
    return MPAS


@router.get("/satellite-footprints")
def list_satellite_footprints():
    return SATELLITE_FOOTPRINTS


@router.get("/ocean-samples")
def list_ocean_samples():
    return OCEAN_SAMPLES


@router.get("/weather-samples")
def list_weather_samples():
    return WEATHER_SAMPLES
