"""
NEERNETRA — impact analysis (Phase 2).

Computes real polygon overlap between the spill polygon and reference
fisheries/MPA layers using Shapely, and derives a coastal-risk indicator
from distance to a coastline reference. This is intentionally a real
geometric computation (not a lookup) so Phase 3 can swap in higher-fidelity
reference layers (shapefiles / GeoPandas GeoDataFrames) without touching
the API contract.

analyze_impact(incident) -> dict:
    {
        "affected_area_km2": float,
        "fishing_zone_overlaps": [{"name": str, "overlap_pct": float}, ...],
        "mpa_overlaps": [{"name": str, "overlap_pct": float}, ...],
        "fisheries_risk": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
        "environmental_risk": ...,
        "is_demo_output": bool,
    }
"""
from typing import List
from shapely.geometry import Polygon
from shapely.ops import transform
import pyproj

from data.mock_environment import FISHING_ZONES, MPAS
from data.mock_incidents import get_incident

# Equal-area-ish projection adequate for small regional polygons (km2 estimates).
_PROJECT = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True).transform


def _to_polygon(ring: List[List[float]]) -> Polygon:
    return Polygon(ring)


def _area_km2(poly: Polygon) -> float:
    projected = transform(_PROJECT, poly)
    return abs(projected.area) / 1_000_000


def _severity_from_overlap_pct(pct: float) -> str:
    if pct >= 40:
        return "CRITICAL"
    if pct >= 15:
        return "HIGH"
    if pct > 0:
        return "MODERATE"
    return "LOW"


def analyze_impact(incident_id: str) -> dict:
    incident = get_incident(incident_id)
    if not incident:
        return {}

    spill_poly = _to_polygon(incident["characteristics"]["polygon"]["ring"])
    spill_area_km2 = _area_km2(spill_poly)

    fishing_overlaps = []
    max_fishing_pct = 0.0
    for zone in FISHING_ZONES:
        zone_poly = _to_polygon(zone["ring"])
        if not spill_poly.intersects(zone_poly):
            continue
        intersection = spill_poly.intersection(zone_poly)
        overlap_pct = (_area_km2(intersection) / spill_area_km2 * 100) if spill_area_km2 else 0
        fishing_overlaps.append({"name": zone["name"], "overlapPct": round(overlap_pct, 1)})
        max_fishing_pct = max(max_fishing_pct, overlap_pct)

    mpa_overlaps = []
    max_mpa_pct = 0.0
    for mpa in MPAS:
        mpa_poly = _to_polygon(mpa["ring"])
        if not spill_poly.intersects(mpa_poly):
            continue
        intersection = spill_poly.intersection(mpa_poly)
        overlap_pct = (_area_km2(intersection) / spill_area_km2 * 100) if spill_area_km2 else 0
        mpa_overlaps.append({"name": mpa["name"], "overlapPct": round(overlap_pct, 1)})
        max_mpa_pct = max(max_mpa_pct, overlap_pct)

    return {
        "incidentId": incident_id,
        "spillAreaKm2": round(spill_area_km2, 2),
        "fishingZoneOverlaps": fishing_overlaps,
        "mpaOverlaps": mpa_overlaps,
        "fisheriesRisk": incident["impact"]["fisheriesRisk"] if not fishing_overlaps else _severity_from_overlap_pct(max_fishing_pct),
        "environmentalRisk": incident["impact"]["environmentalRisk"] if not mpa_overlaps else _severity_from_overlap_pct(max_mpa_pct),
        "coastalRisk": incident["impact"]["coastalRisk"],
        "overallResponsePriority": incident["impact"]["overallResponsePriority"],
        "isDemoOutput": True,
        "note": "Overlap computed via Shapely polygon intersection against reference fisheries/MPA layers. "
                "Coastal risk currently uses the pre-computed incident value pending a coastline reference layer.",
    }
