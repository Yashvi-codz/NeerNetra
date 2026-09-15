"""
NEERNETRA — incident horizon / replay service.

get_incident_replay(...) returns the T-24H..T+24H horizon markers used by
the Investigation page's Incident Horizon strip, and get_replay_events(...)
returns the structured event list (timestamp, type, title, description,
latitude, longitude, relatedVesselId, relatedIncidentId) that drives the
Phase 3 Time-Based Incident Replay page. The frontend mirrors this exact
event list in frontend/src/data/replay.ts so /replay/:incidentId can run
standalone; this backend copy exists so the replay state can eventually be
served from a single source of truth once the frontend fetches from the
API instead of its bundled demo data (see docs/ARCHITECTURE.md).
"""
from typing import List
from data.mock_incidents import get_incident

_HORIZON = {
    "NEER-001": [
        {"id": "h1", "label": "T-24H", "offsetHours": -24, "timestampUtc": "2026-09-12T08:14:00Z"},
        {"id": "h2", "label": "T-12H", "offsetHours": -12, "timestampUtc": "2026-09-12T20:14:00Z"},
        {"id": "h3", "label": "T-6H", "offsetHours": -6, "timestampUtc": "2026-09-13T02:14:00Z", "eventSummary": "Estimated release window begins"},
        {"id": "h4", "label": "T0", "offsetHours": 0, "timestampUtc": "2026-09-13T08:14:00Z", "eventSummary": "Satellite detection"},
        {"id": "h5", "label": "T+6H", "offsetHours": 6, "timestampUtc": "2026-09-13T14:14:00Z", "eventSummary": "Current position"},
        {"id": "h6", "label": "T+12H", "offsetHours": 12, "timestampUtc": "2026-09-13T20:14:00Z"},
        {"id": "h7", "label": "T+24H", "offsetHours": 24, "timestampUtc": "2026-09-14T08:14:00Z"},
    ]
}

# Curated replay for NEER-001, matching frontend/src/data/replay.ts exactly
# (built from the same AIS activity / evidence-chain values — no new
# invented numbers). Other incidents fall back to deriving events from
# their own evidence chain via _derive_from_evidence_chain(...).
_NEER_001_EVENTS = [
    {"id": "rp-001-1", "incidentId": "NEER-001", "timestampUtc": "2026-09-12T14:14:00Z", "offsetHours": -18, "type": "VESSEL", "title": "Candidate vessel enters origin region", "description": "MV OCEAN STAR transits into the approach corridor later identified as the probable release origin.", "latitude": 19.22, "longitude": 73.04, "relatedVesselId": "v-ocean-star", "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-2", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T02:04:00Z", "offsetHours": -6.17, "type": "AIS", "title": "AIS course deviation detected", "description": "MV OCEAN STAR course shifts from 251° to 238°, immediately preceding an AIS reporting gap.", "latitude": 19.1101, "longitude": 72.8955, "relatedVesselId": "v-ocean-star", "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-3", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T02:10:00Z", "offsetHours": -6.07, "type": "AIS", "title": "Possible release window begins", "description": "AIS reporting gap begins (165 min) with a simultaneous speed reduction to 6.2 kn, overlapping the estimated release window.", "latitude": 19.1032, "longitude": 72.8865, "relatedVesselId": "v-ocean-star", "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-4", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T08:02:18Z", "offsetHours": -0.19, "type": "DETECTION", "title": "Sentinel-1 observation", "description": "Sentinel-1 C-SAR pass acquired over the Mumbai approaches.", "latitude": 19.09, "longitude": 72.73, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-5", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T08:14:00Z", "offsetHours": 0, "type": "DETECTION", "title": "Spill segmentation completed", "description": "SAR anomaly segmentation flags a 12.6 km² slick-like signature at 91.4% confidence — POSSIBLE OIL SPILL.", "latitude": 19.0859, "longitude": 72.7316, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-6", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T08:32:00Z", "offsetHours": 0.3, "type": "ORIGIN", "title": "Hindcast initiated", "description": "Reverse-drift hindcast estimates a probable origin and release window (78% confidence).", "latitude": 19.0512, "longitude": 72.7601, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-7", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T08:55:00Z", "offsetHours": 0.68, "type": "VESSEL", "title": "Candidate vessel correlation", "description": "AIS spatio-temporal correlation flags MV OCEAN STAR as the top candidate (association strength 91/100).", "latitude": 19.0764, "longitude": 72.8362, "relatedVesselId": "v-ocean-star", "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-8", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T09:10:00Z", "offsetHours": 0.93, "type": "DARK_CONTACT", "title": "Dark contact identified", "description": "A satellite vessel-like return near the probable origin has no matching AIS report (unresolved).", "latitude": 19.0498, "longitude": 72.7588, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-9", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T14:32:00Z", "offsetHours": 6.3, "type": "FORECAST", "title": "Forecast generated", "description": "Drift forecast projects the footprint expanding to 14.8 km² by T+6H (72% confidence).", "latitude": 19.092, "longitude": 72.741, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-10", "incidentId": "NEER-001", "timestampUtc": "2026-09-13T20:32:00Z", "offsetHours": 12.3, "type": "IMPACT", "title": "Fishing zone impact detected", "description": "Projected footprint growth brings Versova Traditional Fishing Grounds into the modeled affected area.", "latitude": 19.101, "longitude": 72.752, "relatedIncidentId": "NEER-001"},
    {"id": "rp-001-11", "incidentId": "NEER-001", "timestampUtc": "2026-09-14T08:32:00Z", "offsetHours": 24.3, "type": "RESPONSE", "title": "Coastal risk increases", "description": "Coastline ETA (36 hr) and forecast growth trend raise overall response priority to CRITICAL.", "latitude": 19.118, "longitude": 72.769, "relatedIncidentId": "NEER-001"},
]

_STAGE_TO_TYPE = {
    "SATELLITE": "DETECTION", "SPILL": "DETECTION", "ENVIRONMENT": "ORIGIN", "ORIGIN": "ORIGIN",
    "AIS": "AIS", "VESSEL": "VESSEL", "COUNTERFACTUAL": "COUNTERFACTUAL", "DARK CONTACT": "DARK_CONTACT",
    "IMPACT": "IMPACT", "FORECAST": "FORECAST", "RESPONSE": "RESPONSE",
}


def _derive_from_evidence_chain(incident_id: str) -> List[dict]:
    incident = get_incident(incident_id)
    if not incident:
        return []
    from datetime import datetime

    t0 = datetime.fromisoformat(incident["detection"]["detectedUtc"].replace("Z", "+00:00"))
    events = []
    for entry in incident["evidenceChain"]:
        ts = datetime.fromisoformat(entry["timestampUtc"].replace("Z", "+00:00"))
        offset_hours = round((ts - t0).total_seconds() / 3600, 2)
        events.append({
            "id": f"{incident_id}-{entry['id']}",
            "incidentId": incident_id,
            "timestampUtc": entry["timestampUtc"],
            "offsetHours": offset_hours,
            "type": _STAGE_TO_TYPE.get(entry["stage"], "AIS"),
            "title": entry["stage"].replace("_", " "),
            "description": entry["summary"],
            "latitude": incident["characteristics"]["centroid"]["latitude"],
            "longitude": incident["characteristics"]["centroid"]["longitude"],
            "relatedIncidentId": incident_id,
        })
    return events


def get_incident_replay(incident_id: str) -> List[dict]:
    return _HORIZON.get(incident_id, [])


def get_replay_events(incident_id: str) -> List[dict]:
    if incident_id == "NEER-001":
        return _NEER_001_EVENTS
    return _derive_from_evidence_chain(incident_id)
