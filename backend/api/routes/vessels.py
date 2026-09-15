"""NEERNETRA — vessel & AIS endpoints (provider-abstracted, see services/vessel_provider.py)."""
from fastapi import APIRouter, HTTPException
from services.vessel_provider import get_vessel_service
from services.vessel_attribution import attribute_vessel, get_vessel_intelligence

router = APIRouter(prefix="/api/vessels", tags=["vessels"])


@router.get("")
def list_vessels():
    service, status_label = get_vessel_service()
    return {"provider": status_label, "vessels": service.list_vessels()}


@router.get("/{vessel_id}")
def read_vessel(vessel_id: str):
    service, status_label = get_vessel_service()
    vessel = service.get_vessel(vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel {vessel_id} not found")
    return {"provider": status_label, "vessel": vessel}


@router.get("/{vessel_id}/trajectory")
def read_trajectory(vessel_id: str):
    service, status_label = get_vessel_service()
    trajectory = service.get_trajectory(vessel_id)
    if not trajectory:
        raise HTTPException(status_code=404, detail=f"No trajectory for vessel {vessel_id}")
    return {"provider": status_label, "trajectory": trajectory}


@router.get("/{vessel_id}/intelligence")
def read_vessel_intelligence(vessel_id: str):
    intel = get_vessel_intelligence(vessel_id)
    if not intel:
        raise HTTPException(status_code=404, detail=f"No NEERNETRA intelligence for vessel {vessel_id}")
    return intel


@router.get("/candidates/{incident_id}")
def read_candidates(incident_id: str):
    """AIS spatio-temporal correlation candidates for an incident, ranked by association strength."""
    return attribute_vessel(incident_id)
