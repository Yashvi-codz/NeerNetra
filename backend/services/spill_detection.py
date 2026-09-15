"""
NEERNETRA — spill detection model interface.

detect_oil_spill(image) is the contract Phase 3 will wire to a real
SAR/optical anomaly-segmentation model. Phase 1/2 returns DEMO MODEL
OUTPUT drawn from the matching mock incident so the rest of the pipeline
(environment -> hindcast -> AIS -> vessel -> impact -> cause -> response)
has something coherent to operate on.

Expected real contract:
    detect_oil_spill(image: bytes | np.ndarray, metadata: dict) -> dict

Returns:
    {
        "spill_detected": bool,
        "confidence": float,        # 0-100
        "mask": <raster mask>,      # omitted in mock mode
        "polygon": [[lng, lat], ...],
        "area_km2": float,
        "centroid": {"latitude": float, "longitude": float},
        "severity": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
        "is_demo_output": bool,
    }
"""
from typing import Optional
from data.mock_incidents import get_incident


def detect_oil_spill(incident_id: str = "NEER-001") -> Optional[dict]:
    """Phase 1/2 mock: replay the pre-computed detection for a demo incident.
    Phase 3: replace body with a real model call; keep the same return shape.
    """
    incident = get_incident(incident_id)
    if not incident:
        return None
    c = incident["characteristics"]
    d = incident["detection"]
    return {
        "spill_detected": True,
        "confidence": d["confidencePct"],
        "mask": None,  # raster mask omitted in Phase 1/2 mock mode
        "polygon": c["polygon"]["ring"],
        "area_km2": c["areaKm2"],
        "centroid": c["centroid"],
        "severity": c["severity"],
        "is_demo_output": True,
    }
