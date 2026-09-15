"""NEERNETRA — mock Phase 2 analytical outputs: counterfactual, cause, forecast."""

COUNTERFACTUAL_RESULTS = [
    {
        "vesselId": "v-ocean-star", "incidentId": "NEER-001",
        "spatialConsistency": "HIGH", "temporalConsistency": "HIGH",
        "trajectoryConsistency": "HIGH", "environmentalConsistency": "HIGH",
        "overall": "PHYSICALLY CONSISTENT", "confidencePct": 86,
        "reasoning": [
            "Vessel position at estimated release start is within 0.3 km of hindcast probable origin.",
            "AIS gap (165 min) fully overlaps the estimated release window.",
            "Post-gap course (245°) is consistent with observed slick elongation axis.",
            "Current + wind vectors during the window would carry a release from this position to the observed slick centroid.",
        ],
        "isDemoOutput": True,
    },
    {
        "vesselId": "v-pacific-voyager", "incidentId": "NEER-001",
        "spatialConsistency": "LOW", "temporalConsistency": "LOW",
        "trajectoryConsistency": "MODERATE", "environmentalConsistency": "LOW",
        "overall": "INCONSISTENT", "confidencePct": 74,
        "reasoning": [
            "Vessel remained 8+ km from probable origin throughout the release window.",
            "No AIS gap or speed anomaly during the release window.",
        ],
        "isDemoOutput": True,
    },
    {
        "vesselId": "v-horizon-9", "incidentId": "NEER-001",
        "spatialConsistency": "LOW", "temporalConsistency": "LOW",
        "trajectoryConsistency": "LOW", "environmentalConsistency": "LOW",
        "overall": "INCONSISTENT", "confidencePct": 81,
        "reasoning": [
            "Vessel outside the 6 km search radius around probable origin for the full release window.",
            "Continuous AIS coverage shows no course or speed irregularities.",
        ],
        "isDemoOutput": True,
    },
    {
        "vesselId": "v-crimson-tide", "incidentId": "NEER-002",
        "spatialConsistency": "MODERATE", "temporalConsistency": "MODERATE",
        "trajectoryConsistency": "MODERATE", "environmentalConsistency": "MODERATE",
        "overall": "PARTIALLY CONSISTENT", "confidencePct": 58,
        "reasoning": [
            "Vessel within 5 km of probable origin during part of the release window.",
            "Single course change of 14° is consistent with, but does not confirm, a discharge maneuver.",
        ],
        "isDemoOutput": True,
    },
]

CAUSE_ANALYSIS_RESULTS = [
    {
        "incidentId": "NEER-001", "cause": "Operational discharge", "confidencePct": 68,
        "featureContributions": [
            {"feature": "Vessel counterfactual consistency", "weightPct": 34, "note": "MV OCEAN STAR physically consistent with release (86% confidence)"},
            {"feature": "AIS gap overlapping release window", "weightPct": 24, "note": "165-minute gap during estimated release start/end"},
            {"feature": "Slick shape / current alignment", "weightPct": 22, "note": "Elongation axis matches current-driven transport from origin"},
            {"feature": "Dark contact corroboration", "weightPct": 12, "note": "Unresolved satellite contact near probable origin"},
            {"feature": "Detection confidence", "weightPct": 8, "note": "SAR anomaly segmentation confidence 91.4%"},
        ],
        "isDemoOutput": True,
    },
    {
        "incidentId": "NEER-002", "cause": "Unknown / insufficient evidence", "confidencePct": 41,
        "featureContributions": [
            {"feature": "Vessel counterfactual consistency", "weightPct": 30, "note": "CRIMSON TIDE only partially consistent (58%)"},
            {"feature": "Detection confidence", "weightPct": 28, "note": "SAR anomaly segmentation confidence 76.8% — moderate"},
            {"feature": "Dark contact corroboration", "weightPct": 22, "note": "Partial AIS match on nearby small craft — inconclusive"},
            {"feature": "Environmental consistency", "weightPct": 20, "note": "Weak current alignment; multiple plausible origins"},
        ],
        "isDemoOutput": True,
    },
    {
        "incidentId": "NEER-003", "cause": "Operational discharge", "confidencePct": 92,
        "featureContributions": [
            {"feature": "Port authority corroboration", "weightPct": 60, "note": "Bilge discharge confirmed at berth by terminal operator"},
            {"feature": "Detection confidence", "weightPct": 25, "note": "Optical classification confidence 96.2%"},
            {"feature": "Spatial containment", "weightPct": 15, "note": "Compact sheen adjacent to single berth"},
        ],
        "isDemoOutput": True,
    },
    {
        "incidentId": "NEER-004", "cause": "Natural seep", "confidencePct": 77,
        "featureContributions": [
            {"feature": "Known seep field overlap", "weightPct": 55, "note": "Signature location matches catalogued natural seep field"},
            {"feature": "SAR contrast characteristics", "weightPct": 25, "note": "Diffuse, low-contrast signature typical of natural seepage"},
            {"feature": "Vessel correlation", "weightPct": 20, "note": "No vessels analyzed near origin during release window"},
        ],
        "isDemoOutput": True,
    },
]

FORECAST_SNAPSHOTS = [
    {"incidentId": "NEER-001", "horizonHours": 6, "projectedAreaKm2": 14.8, "projectedCentroid": {"latitude": 19.092, "longitude": 72.741}, "confidencePct": 72, "isDemoOutput": True},
    {"incidentId": "NEER-001", "horizonHours": 12, "projectedAreaKm2": 17.1, "projectedCentroid": {"latitude": 19.101, "longitude": 72.752}, "confidencePct": 61, "isDemoOutput": True},
    {"incidentId": "NEER-001", "horizonHours": 24, "projectedAreaKm2": 21.6, "projectedCentroid": {"latitude": 19.118, "longitude": 72.769}, "confidencePct": 47, "isDemoOutput": True},
]


def get_counterfactual(vessel_id: str, incident_id: str):
    return next((c for c in COUNTERFACTUAL_RESULTS if c["vesselId"] == vessel_id and c["incidentId"] == incident_id), None)


def get_cause_analysis(incident_id: str):
    return next((c for c in CAUSE_ANALYSIS_RESULTS if c["incidentId"] == incident_id), None)


def get_forecast(incident_id: str):
    return [f for f in FORECAST_SNAPSHOTS if f["incidentId"] == incident_id]
