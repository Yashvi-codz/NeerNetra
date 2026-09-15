"""
NEERNETRA — VesselFinder provider adapter (Phase 2 architecture).

This adapter is the ONLY module allowed to hold/send the VesselFinder API
key. It normalizes VesselFinder's response shape into the NEERNETRA Vessel
model (see models/schemas.py) so the frontend never needs to know which
provider is active.

Phase 1/2: this makes real HTTP calls when configured, but NEERNETRA ships
with VESSEL_DATA_PROVIDER=mock by default, so this class is inert unless a
real key is supplied. On any failure (network error, auth error, malformed
response) it raises VesselFinderUnavailable so the caller can fall back to
mock data automatically — see vessel_provider.get_vessel_service().

Official VesselFinder site (reference only, never scraped/iframed):
https://www.vesselfinder.com/
"""
from typing import List, Optional
import httpx
from services.config import VESSELFINDER_API_KEY, VESSELFINDER_BASE_URL


class VesselFinderUnavailable(Exception):
    pass


def _normalize_vesselfinder_record(raw: dict) -> dict:
    """
    Map a VesselFinder AIS/master record onto the NEERNETRA Vessel schema.
    Field names on the right are illustrative of VesselFinder's documented
    API; adjust to the exact contract of your subscription tier.
    """
    return {
        "id": f"vf-{raw.get('MMSI')}",
        "name": raw.get("NAME", "UNKNOWN"),
        "mmsi": str(raw.get("MMSI", "")),
        "imo": f"IMO {raw.get('IMO')}" if raw.get("IMO") else "IMO UNKNOWN",
        "callsign": raw.get("CALLSIGN", ""),
        "type": raw.get("TYPE_NAME", "Unknown"),
        "flag": raw.get("FLAG", "Unknown"),
        "latitude": raw.get("LATITUDE"),
        "longitude": raw.get("LONGITUDE"),
        "speedKn": raw.get("SPEED", 0) / 10 if raw.get("SPEED") is not None else 0,
        "courseDeg": raw.get("COURSE", 0),
        "headingDeg": raw.get("HEADING", raw.get("COURSE", 0)),
        "navStatus": raw.get("NAVSTAT_TEXT", "Unknown"),
        "aisSource": "VESSELFINDER",
        "lastUpdatedUtc": raw.get("TIMESTAMP"),
        # Voyage/particulars/ownership/activity are populated from
        # VesselFinder's static/master endpoints where subscribed;
        # omitted fields default to "Unknown"/empty in the caller.
    }


class VesselFinderService:
    source_label = "LIVE"

    def __init__(self):
        if not VESSELFINDER_API_KEY:
            raise VesselFinderUnavailable("VESSELFINDER_API_KEY is not configured")
        self._client = httpx.Client(base_url=VESSELFINDER_BASE_URL, timeout=8.0)

    def list_vessels(self) -> List[dict]:
        try:
            resp = self._client.get("/vessels", params={"userkey": VESSELFINDER_API_KEY})
            resp.raise_for_status()
            raw_records = resp.json()
            return [_normalize_vesselfinder_record(r) for r in raw_records]
        except Exception as exc:  # network error, 4xx/5xx, bad JSON, etc.
            raise VesselFinderUnavailable(str(exc)) from exc

    def get_vessel(self, vessel_id: str) -> Optional[dict]:
        vessels = self.list_vessels()
        return next((v for v in vessels if v["id"] == vessel_id), None)
