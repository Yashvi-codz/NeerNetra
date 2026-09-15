# NEERNETRA — Model Integration Guide

This document specifies the contract for every model/service interface so
Phase 3 can replace mock logic with real models **without changing the API
or frontend**. Every function below currently lives in
`backend/services/` (or `backend/geospatial/` for impact analysis) and
returns demo/mock data labeled `is_demo_output: true` / `DEMO MODEL
OUTPUT`.

## detect_oil_spill(image, metadata) — `services/spill_detection.py`

**Input (Phase 3):** raw SAR/optical image (bytes or array) + acquisition
metadata (satellite, sensor, timestamp, footprint).

**Output:**
```json
{
  "spill_detected": true,
  "confidence": 91.4,
  "mask": "<raster mask, Phase 3>",
  "polygon": [[lng, lat], ...],
  "area_km2": 12.6,
  "centroid": {"latitude": 19.0859, "longitude": 72.7316},
  "severity": "HIGH",
  "is_demo_output": true
}
```
Never label output "CONFIRMED OIL SPILL" — always "possible oil spill" /
"satellite anomaly" pending corroboration.

## detect_vessels(image) — `services/vessel_detection.py`

**Input (Phase 3):** SAR/optical image over a region of interest.

**Output:** list of satellite-observed vessel-like contacts (feeds Dark
Vessel Intelligence):
```json
[{
  "contactId": "DC-...", "latitude": .., "longitude": ..,
  "estimatedType": "Tanker-class (estimated)",
  "satelliteConfidencePct": 67.0
}, ...]
```

## hindcast_spill(spill_polygon, environment, current_field, wind_field) — `services/hindcasting.py`

**Output:**
```json
{
  "origin_coordinates": {"latitude": .., "longitude": ..},
  "estimated_release_start": "2026-09-13T02:00:00Z",
  "estimated_release_end": "2026-09-13T05:00:00Z",
  "trajectory_points": [{"latitude": .., "longitude": ..}, ...],
  "confidence": 78.0,
  "is_demo_output": true
}
```
Never present the origin as an exact guaranteed point — Phase 3 should
add an uncertainty region (e.g. a confidence ellipse) alongside the point
estimate.

## attribute_vessel(incident_id) / compute_association_strength(...) — `services/vessel_attribution.py`

Given a probable origin, release window, and spill location, search AIS
history around the origin, filter irrelevant vessels, and score every
candidate on:

1. Spatial proximity
2. Temporal compatibility
3. Trajectory alignment
4. Environmental consistency
5. Behavioral anomalies (AIS gaps, speed/course changes)

Weighting (documented, tunable):
```
spatial_proximity        30%
temporal_compatibility   25%
trajectory_alignment     20%
environmental_consistency 15%
behavioral_anomalies      10%
```

Output per candidate is an **ASSOCIATION STRENGTH** (0-100) and an
**INVESTIGATIVE STATUS** — never a "guilt score". Proximity alone must
never determine the ranking; `compute_association_strength(...)` is the
single, transparent, replaceable formula every candidate is scored with.

## run_counterfactual(vessel_id, incident_id) — `services/counterfactual.py`

**Question:** could this vessel's movement physically explain the
observed spill?

**Output:**
```json
{
  "spatialConsistency": "HIGH", "temporalConsistency": "HIGH",
  "trajectoryConsistency": "HIGH", "environmentalConsistency": "HIGH",
  "overall": "PHYSICALLY CONSISTENT", "confidencePct": 86,
  "reasoning": ["..."], "isDemoOutput": true
}
```
This is explicitly **not proof of responsibility** — see
`docs/ARCHITECTURE.md` §Investigative language policy.

## analyze_cause(incident_id) — `services/cause_analysis.py`

Combines counterfactual results, detection confidence, dark-contact
corroboration, and environmental consistency into a probable-cause
classification with feature-level weight contributions:

```json
{
  "cause": "Operational discharge",
  "confidence": 68,
  "feature_contributions": [
    {"feature": "Vessel counterfactual consistency", "weight_pct": 34, "note": "..."}
  ],
  "is_demo_output": true
}
```

Categories: `Accidental discharge`, `Operational discharge`, `Collision`,
`Equipment failure`, `Transfer / loading incident`, `Natural seep`,
`Unknown / insufficient evidence`. **Never force a cause** — return
"Unknown / insufficient evidence" when confidence is low.

## forecast_spill(spill_polygon, environment, horizon_hours) — `services/forecasting.py`

**Output (per horizon):**
```json
{"time": "2026-09-13T20:32:18Z", "polygon": [[lng, lat], ...], "centroid": {...}, "confidence": 72}
```
Phase 1/2 ship fixed T+6H/T+12H/T+24H snapshots; Phase 3 should wire this
to a real Lagrangian drift model (e.g. an OpenDrift-style transport
simulation) driven by live current/wind fields.

## analyze_impact(incident_id) — `geospatial/impact_analysis.py`

**Already real in Phase 2** (not mocked): computes actual polygon overlap
between the spill polygon and fisheries/MPA reference layers using
Shapely (see the module for the EPSG:3857 area-projection approach).
Phase 3 should:
- Replace the small in-memory reference polygons with true GeoPandas
  GeoDataFrames loaded from shapefiles/GeoJSON.
- Add a real coastline distance calculation (currently sourced from the
  pre-computed incident value).

## compute_response_priority(incident_id) — `services/response_priority.py`

Deterministic, documented weighting over severity, affected area, coast
proximity, fisheries/MPA impact, detection confidence, vessel association
strength, and forecast risk trend → composite 0-100 score →
CRITICAL/HIGH/MODERATE/LOW priority, with a human-readable reason per
factor. Mirrored in `frontend/src/services/responsePriority.ts` so both
layers agree without a network round-trip being required for the frontend
demo experience.

## get_incident_replay(incident_id) — `services/incident_replay.py`

Returns T-24H..T+24H horizon markers for the Incident Horizon strip.

## get_replay_events(incident_id) — `services/incident_replay.py` (Phase 3)

Returns the structured Time-Based Incident Replay event list that drives
`/replay/:incidentId` on the frontend (`frontend/src/data/replay.ts`,
`frontend/src/services/replayEngine.ts`):

```json
[{
  "id": "rp-001-5", "incidentId": "NEER-001",
  "timestampUtc": "2026-09-13T08:14:00Z", "offsetHours": 0,
  "type": "DETECTION", "title": "Spill segmentation completed",
  "description": "...", "latitude": 19.0859, "longitude": 72.7316,
  "relatedVesselId": null, "relatedIncidentId": "NEER-001"
}]
```

`type` is one of `AIS | DETECTION | ORIGIN | VESSEL | COUNTERFACTUAL |
DARK_CONTACT | FORECAST | IMPACT | RESPONSE`. NEER-001 ships a fully
curated event list built from its own AIS-activity and evidence-chain
values; every other incident derives its events directly from its
existing evidence chain (no duplicated hardcoding — see
`deriveFromEvidenceChain(...)` / `_derive_from_evidence_chain(...)` on the
frontend and backend respectively). Phase 4+ should replace the curated
NEER-001 list with events emitted live by each upstream service
(`detect_oil_spill`, `hindcast_spill`, `attribute_vessel`, etc.) as they
run, rather than being authored ahead of time.

## Demo story consistency (NEER-001)

Every function above is exercised by the same incident so the story stays
internally consistent end-to-end:

1. Satellite detects a possible slick (91.4% confidence).
2. Environmental conditions (wind/current) support the anomaly.
3. Reverse drift produces a probable origin (78% confidence).
4. Four vessels were historically nearby; AIS correlation narrows to
   three real candidates.
5. MV OCEAN STAR has the strongest spatial proximity, timing, trajectory
   alignment, and environmental consistency (association strength 91/100).
6. A satellite/AIS mismatch (dark contact) exists near the probable origin.
7. Counterfactual analysis finds MV OCEAN STAR's movement physically
   consistent with the release (86% confidence) — not proof of fault.
8. Forecast predicts the footprint growing and drifting toward the coast.
9. Fishing/MPA/coastal impacts are computed (2 fishing zones, 1 MPA
   buffer at risk).
10. Cause analysis returns "Operational discharge" at 68% confidence,
    with a transparent feature-contribution breakdown.
11. Response priority is computed as CRITICAL from the combination above.

No unrelated random values are introduced — every number traces back to
this one story.
