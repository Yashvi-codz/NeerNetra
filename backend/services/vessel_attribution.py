"""
NEERNETRA — AIS spatio-temporal correlation & candidate scoring service.

attribute_vessel(...) is the Phase 2 "association strength" engine. Given a
probable origin, release window, and spill location, it searches AIS
history around the origin, filters irrelevant vessels, and scores each
candidate. The output is an ASSOCIATION STRENGTH (0-100) and an
INVESTIGATIVE STATUS — never a "guilt score".

Scoring weighting (documented; tune per docs/MODEL_INTEGRATION.md):
    spatial_proximity        30%
    temporal_compatibility   25%
    trajectory_alignment     20%
    environmental_consistency 15%
    behavioral_anomalies      10%

Phase 1/2 returns the pre-computed intelligence payload already attached
to each mock vessel (vessel["intelligence"]) rather than recomputing it
live, but compute_association_strength() below shows the intended real
formula operating on the same inputs, so Phase 3 can drop in real AIS/
environment data without changing the API contract.
"""
from typing import List, Optional
from data.mock_vessels import VESSELS


WEIGHTS = {
    "spatial_proximity": 0.30,
    "temporal_compatibility": 0.25,
    "trajectory_alignment": 0.20,
    "environmental_consistency": 0.15,
    "behavioral_anomalies": 0.10,
}


def compute_association_strength(
    spatial_proximity_score: float,
    temporal_compatibility_score: float,
    trajectory_alignment_score: float,
    environmental_consistency_score: float,
    behavioral_anomaly_score: float,
) -> float:
    """All input scores are 0-100. Returns a weighted composite 0-100.
    This is the transparent, replaceable scoring function referenced by
    docs/MODEL_INTEGRATION.md — proximity alone never determines rank.
    """
    return round(
        spatial_proximity_score * WEIGHTS["spatial_proximity"]
        + temporal_compatibility_score * WEIGHTS["temporal_compatibility"]
        + trajectory_alignment_score * WEIGHTS["trajectory_alignment"]
        + environmental_consistency_score * WEIGHTS["environmental_consistency"]
        + behavioral_anomaly_score * WEIGHTS["behavioral_anomalies"],
        1,
    )


def attribute_vessel(incident_id: str) -> List[dict]:
    """Phase 1/2 mock: returns candidate vessels + their pre-computed
    association scores for the given incident, ranked descending.
    """
    candidates = [v for v in VESSELS if v.get("intelligence") and v["intelligence"]["incidentId"] == incident_id]
    candidates.sort(key=lambda v: v["intelligence"]["associationStrength"], reverse=True)
    return candidates


def get_vessel_intelligence(vessel_id: str) -> Optional[dict]:
    vessel = next((v for v in VESSELS if v["id"] == vessel_id), None)
    return vessel.get("intelligence") if vessel else None
