"""NEERNETRA — environment/config loader."""
import os
from dotenv import load_dotenv

load_dotenv()

VESSEL_DATA_PROVIDER = os.getenv("VESSEL_DATA_PROVIDER", "mock").lower()
VESSELFINDER_API_KEY = os.getenv("VESSELFINDER_API_KEY", "")
VESSELFINDER_BASE_URL = os.getenv("VESSELFINDER_BASE_URL", "https://api.vesselfinder.com")
OCEAN_DATA_PROVIDER = os.getenv("OCEAN_DATA_PROVIDER", "mock").lower()
WEATHER_DATA_PROVIDER = os.getenv("WEATHER_DATA_PROVIDER", "mock").lower()
SATELLITE_PROVIDER = os.getenv("SATELLITE_PROVIDER", "mock").lower()
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


def vessel_provider_is_live() -> bool:
    """True only when VesselFinder is selected AND a key is actually configured."""
    return VESSEL_DATA_PROVIDER == "vesselfinder" and bool(VESSELFINDER_API_KEY)
