"""NEERNETRA — Phase 2 analytical endpoints: hindcast, counterfactual, cause, forecast, impact, response priority."""
from fastapi import APIRouter, HTTPException
from services.hindcasting import hindcast_spill
from services.counterfactual import run_counterfactual
from services.cause_analysis import analyze_cause
from services.forecasting import forecast_spill
from services.response_priority import compute_response_priority
from services.spill_detection import detect_oil_spill
from geospatial.impact_analysis import analyze_impact

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/detect-spill/{incident_id}")
def read_spill_detection(incident_id: str):
    result = detect_oil_spill(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No detection for {incident_id}")
    return result


@router.get("/hindcast/{incident_id}")
def read_hindcast(incident_id: str):
    result = hindcast_spill(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No hindcast for {incident_id}")
    return result


@router.get("/counterfactual/{incident_id}/{vessel_id}")
def read_counterfactual(incident_id: str, vessel_id: str):
    result = run_counterfactual(vessel_id, incident_id)
    if not result:
        raise HTTPException(status_code=404, detail="No counterfactual analysis available for this vessel/incident")
    return result


@router.get("/cause/{incident_id}")
def read_cause(incident_id: str):
    result = analyze_cause(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No cause analysis for {incident_id}")
    return result


@router.get("/forecast/{incident_id}")
def read_forecast(incident_id: str):
    return forecast_spill(incident_id)


@router.get("/impact/{incident_id}")
def read_impact(incident_id: str):
    result = analyze_impact(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No impact analysis for {incident_id}")
    return result


@router.get("/response-priority/{incident_id}")
def read_response_priority(incident_id: str):
    result = compute_response_priority(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No response priority for {incident_id}")
    return result
