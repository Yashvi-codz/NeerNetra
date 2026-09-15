"""
NEERNETRA — response priority scoring.

compute_response_priority(...) combines spill severity, affected area,
coast proximity, fisheries/MPA impact, detection confidence, and vessel
association strength into a single CRITICAL/HIGH/MODERATE/LOW priority
with a transparent breakdown of contributing factors. Mirrors
frontend/src/services/responsePriority.ts so both layers agree.
"""
from typing import Optional
from data.mock_incidents import get_incident

SEVERITY_WEIGHT = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4}


def compute_response_priority(incident_id: str) -> Optional[dict]:
    incident = get_incident(incident_id)
    if not incident:
        return None

    c = incident["characteristics"]
    impact = incident["impact"]
    reasons = []

    severity_score = SEVERITY_WEIGHT[c["severity"]] * 12.5
    reasons.append({"factor": "Spill severity", "detail": f"{c['severity']} ({c['areaKm2']:.1f} km²)"})

    area_score = min(impact["affectedAreaKm2"] / 25, 1) * 15
    reasons.append({"factor": "Affected area", "detail": f"{impact['affectedAreaKm2']:.1f} km² potentially affected"})

    if impact["coastlineEtaHours"] is not None:
        coast_score = max(0, 1 - impact["coastlineEtaHours"] / 72) * 15
        coast_detail = f"Est. {impact['coastlineEtaHours']} hr to coastline"
    else:
        coast_score = 3
        coast_detail = "No coastline ETA modeled"
    reasons.append({"factor": "Coast proximity", "detail": coast_detail})

    fisheries_score = SEVERITY_WEIGHT[impact["fisheriesRisk"]] * 6
    reasons.append({"factor": "Fisheries impact", "detail": f"{impact['fisheriesRisk']} risk, {len(impact['fishingZonesAtRisk'])} zone(s)"})

    mpa_score = SEVERITY_WEIGHT[impact["environmentalRisk"]] * 6
    reasons.append({"factor": "MPA / environmental impact", "detail": f"{impact['environmentalRisk']} risk, {len(impact['mpasAtRisk'])} protected area(s)"})

    confidence_score = (c["confidencePct"] / 100) * 10
    reasons.append({"factor": "Detection confidence", "detail": f"{c['confidencePct']:.1f}%"})

    vessel_score = (incident["vesselConnection"]["topAssociationStrength"] / 100) * 10
    reasons.append({"factor": "Vessel association", "detail": f"Top candidate association strength {incident['vesselConnection']['topAssociationStrength']}/100"})

    forecast_score = 6
    reasons.append({"factor": "Forecast risk trend", "detail": "Projected area increasing over 24 hr horizon"})

    total = severity_score + area_score + coast_score + fisheries_score + mpa_score + confidence_score + vessel_score + forecast_score
    score_of_100 = round(min(total, 100))

    if score_of_100 >= 75:
        priority = "CRITICAL"
    elif score_of_100 >= 55:
        priority = "HIGH"
    elif score_of_100 >= 30:
        priority = "MODERATE"
    else:
        priority = "LOW"

    return {"incidentId": incident_id, "priority": priority, "scoreOf100": score_of_100, "reasons": reasons}
