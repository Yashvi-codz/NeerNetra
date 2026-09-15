"""
NEERNETRA — reverse-drift hindcast model interface.

hindcast_spill(...) estimates where a detected spill probably originated
and when, by running the observed environment (current, wind) backwards
from the spill polygon. NEERNETRA never presents this as an exact
guaranteed point — always an estimate with confidence and, where possible,
an uncertainty region.

Expected real contract:
    hindcast_spill(spill_polygon, environment, current_field, wind_field) -> dict

Returns:
    {
        "origin_coordinates": {"latitude": float, "longitude": float},
        "estimated_release_start": iso8601 str,
        "estimated_release_end": iso8601 str,
        "trajectory_points": [{"latitude": float, "longitude": float}, ...],
        "confidence": float,   # 0-100
        "is_demo_output": bool,
    }
"""
from typing import Optional
from data.mock_incidents import get_incident


def hindcast_spill(incident_id: str) -> Optional[dict]:
    """Phase 1/2 mock: replay the pre-computed hindcast for a demo incident."""
    incident = get_incident(incident_id)
    if not incident:
        return None
    h = incident["hindcast"]
    return {
        "origin_coordinates": h["probableOriginPoint"],
        "estimated_release_start": h["estimatedReleaseStartUtc"],
        "estimated_release_end": h["estimatedReleaseEndUtc"],
        "trajectory_points": h["trajectoryPoints"],
        "confidence": h["confidencePct"],
        "is_demo_output": True,
    }
