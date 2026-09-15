"""NEERNETRA — mock dark contact dataset (backend). Mirrors frontend/src/data/darkContacts.ts."""

DARK_CONTACTS = [
    {
        "contactId": "DC-2026-0913-01", "incidentId": "NEER-001",
        "satelliteTimestampUtc": "2026-09-13T02:31:00Z", "latitude": 19.0498, "longitude": 72.7588,
        "estimatedType": "Tanker-class (estimated, SAR return signature)", "satelliteConfidencePct": 67.0,
        "source": "Sentinel-1", "aisMatchStatus": "NO MATCH", "matchConfidencePct": 22,
        "closestVesselId": "v-ocean-star", "aisLastSeenUtc": "2026-09-13T02:10:00Z",
        "searchRadiusKm": 6, "recordsChecked": 214,
        "distanceToSpillKm": 4.1, "distanceToOriginKm": 0.3, "timeDifferenceMinutes": 21, "positionDifferenceKm": 0.6,
        "priority": "HIGH", "status": "UNRESOLVED",
        "possibleExplanations": [
            "AIS transmission unavailable during observation window",
            "Vessel moved between AIS report and satellite acquisition",
            "Timing mismatch between AIS ping interval and acquisition time",
        ],
    },
    {
        "contactId": "DC-2026-0912-04", "incidentId": "NEER-002",
        "satelliteTimestampUtc": "2026-09-12T22:40:00Z", "latitude": 20.6488, "longitude": 63.2277,
        "estimatedType": "Small craft (estimated)", "satelliteConfidencePct": 44.0,
        "source": "Sentinel-1", "aisMatchStatus": "PARTIAL MATCH", "matchConfidencePct": 51,
        "closestVesselId": "v-crimson-tide", "aisLastSeenUtc": "2026-09-12T22:36:00Z",
        "searchRadiusKm": 8, "recordsChecked": 96,
        "distanceToSpillKm": 1.2, "distanceToOriginKm": 9.8, "timeDifferenceMinutes": 4, "positionDifferenceKm": 2.8,
        "priority": "MODERATE", "status": "NEEDS CORRELATION",
        "possibleExplanations": [
            "Coverage limitation in terrestrial AIS network at this range",
            "Vessel outside expected search area at acquisition time",
            "Identification unresolved pending manual imagery review",
        ],
    },
    {
        "contactId": "DC-2026-0913-02", "incidentId": "NEER-001",
        "satelliteTimestampUtc": "2026-09-13T08:02:00Z", "latitude": 19.0951, "longitude": 72.7402,
        "estimatedType": "Unclassified small return", "satelliteConfidencePct": 38.0,
        "source": "Sentinel-1", "aisMatchStatus": "MATCHED", "matchConfidencePct": 88,
        "closestVesselId": "v-star-fisher", "aisLastSeenUtc": "2026-09-13T08:01:00Z",
        "searchRadiusKm": 6, "recordsChecked": 214,
        "distanceToSpillKm": 5.4, "distanceToOriginKm": 6.1, "timeDifferenceMinutes": 1, "positionDifferenceKm": 0.2,
        "priority": "LOW", "status": "CLEARED",
        "possibleExplanations": ["Matched to STAR FISHER IV with strong spatial and temporal agreement"],
    },
]


def get_dark_contacts_for_incident(incident_id: str):
    return [c for c in DARK_CONTACTS if c["incidentId"] == incident_id]
