"""
NEERNETRA — satellite vessel detection model interface.

detect_vessels(image) will eventually run object detection over SAR/optical
imagery to find vessel-like returns, which feed the Dark Vessel Intelligence
pipeline (cross-referenced against AIS in vessel_attribution.py). Phase 1/2
returns the mock dark-contact detections already computed for each incident.
"""
from typing import List
from data.mock_dark_contacts import get_dark_contacts_for_incident


def detect_vessels(incident_id: str) -> List[dict]:
    """Phase 1/2 mock: returns pre-computed satellite vessel-like contacts.
    Phase 3: replace with a real detector; keep same list-of-dict shape
    (contactId, latitude, longitude, estimatedType, satelliteConfidencePct, ...).
    """
    return get_dark_contacts_for_incident(incident_id)
