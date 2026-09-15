"""NEERNETRA — Dark Vessel Intelligence endpoints."""
from fastapi import APIRouter
from data.mock_dark_contacts import DARK_CONTACTS, get_dark_contacts_for_incident
from services.vessel_detection import detect_vessels

router = APIRouter(prefix="/api/dark-contacts", tags=["dark-contacts"])


@router.get("")
def list_dark_contacts(incident_id: str | None = None):
    if incident_id:
        return get_dark_contacts_for_incident(incident_id)
    return DARK_CONTACTS


@router.get("/detect/{incident_id}")
def detect(incident_id: str):
    """Model-interface passthrough: satellite vessel-detection for an incident."""
    return detect_vessels(incident_id)
