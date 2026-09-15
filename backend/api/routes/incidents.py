"""NEERNETRA — incident/spill endpoints."""
from fastapi import APIRouter, HTTPException
from data.mock_incidents import INCIDENTS, get_incident
from services.incident_replay import get_incident_replay, get_replay_events

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("")
def list_incidents():
    return INCIDENTS


@router.get("/{incident_id}")
def read_incident(incident_id: str):
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return incident


@router.get("/{incident_id}/horizon")
def read_incident_horizon(incident_id: str):
    return get_incident_replay(incident_id)


@router.get("/{incident_id}/replay-events")
def read_replay_events(incident_id: str):
    """Structured Time-Based Incident Replay events (Phase 3) — timestamp,
    type, title, description, latitude, longitude, relatedVesselId,
    relatedIncidentId. Mirrors frontend/src/data/replay.ts exactly."""
    return get_replay_events(incident_id)
