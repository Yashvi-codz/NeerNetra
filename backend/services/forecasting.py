"""
NEERNETRA — forward spill drift forecast.

forecast_spill(...) projects the spill footprint forward (T+6H, T+12H,
T+24H) using current/wind fields. Phase 1/2 returns pre-computed demo
snapshots; Phase 3 wires this to a real drift model (e.g. OpenDrift-style
Lagrangian transport) using the same return contract.

Expected real contract:
    forecast_spill(spill_polygon, environment, horizon_hours) -> dict

Returns:
    {"time": iso8601, "polygon": [[lng, lat], ...], "centroid": {...}, "confidence": float}
"""
from typing import List
from data.mock_analysis import get_forecast


def forecast_spill(incident_id: str) -> List[dict]:
    """Phase 1/2 mock: replay pre-computed forecast snapshots for an incident."""
    return get_forecast(incident_id)
