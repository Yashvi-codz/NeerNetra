# NEERNETRA — Architecture

## 1. Product framing

NEERNETRA is a maritime intelligence and oil-spill **forensics** system,
not a spill classifier. The full investigation pipeline is:

```
SATELLITE → SPILL → ENVIRONMENT → ORIGIN → AIS → VESSEL →
COUNTERFACTUAL → DARK CONTACT → IMPACT → FORECAST → RESPONSE → REPORT
```

Phase 1 established the UI shell, data architecture, and navigation.
Phase 2 makes the Investigation workspace and Dark Vessel Intelligence
page functionally walk this pipeline end-to-end on demo data, with all
analytical services structured so Phase 3 can replace mock logic with
real models without changing the API contract.

## 2. High-level architecture

```
React + TypeScript + MapLibre GL JS
            ↓ REST / JSON
        FastAPI (backend/main.py)
            ↓
  ML Services + Geo Services + Data Services
  (backend/services, backend/geospatial, backend/data)
```

The frontend currently renders from its own bundled demo dataset
(`frontend/src/data/*`) so it works with zero backend setup. The backend
exposes an equivalent (and, for impact analysis, more rigorous —
Shapely-computed) API surface at `/api/*` for integration testing and for
Phase 3 to build on. Wiring the frontend to fetch from the backend instead
of its local bundle is a drop-in change (see `frontend/src/services/`).

## 3. Investigation flow (Phase 2)

```
Overview → click Spill → Spill Drawer → "Investigate Spill" →
Investigation Console → Review Environment → Review Hindcast →
Review AIS Candidates → Select Vessel → Review Vessel Intelligence →
Counterfactual → Dark Vessel Correlation → Impact → Forecast →
Cause → Response Priority
```

This flow is implemented across `InvestigationPage`, `VesselDrawer`,
`CounterfactualPanel`, `DarkVesselsPage`, `ImpactAnalysisPanel`,
`ForecastPanel`, `CauseAnalysisPanel`, and `ResponsePriorityPanel`.

## 4. Investigative language policy

NEERNETRA never asserts guilt or certainty it hasn't earned. Concretely:

- A satellite anomaly is a **possible oil spill** / **satellite anomaly**
  until corroborated — never "confirmed oil spill" on detection alone.
- Vessels are **candidate vessels** with an **association strength**
  (0-100) and an **investigative status** (`REQUIRES INVESTIGATION`,
  `UNDER REVIEW`, `FLAGGED LEAD`, `CLEARED`, `UNRESOLVED`). NEERNETRA never
  uses "guilty", "culprit", "confirmed criminal", or "guilt probability".
- Counterfactual analysis answers "could this vessel's movement physically
  explain the spill?" and is explicitly labeled as **not a determination
  of responsibility**.
- Dark-contact AIS mismatches list **possible explanations** (coverage
  gap, timing mismatch, vessel moved, unresolved ID) rather than asserting
  "AIS was disabled" unless the data actually proves that.
- Probable-cause analysis returns **"Unknown / insufficient evidence"**
  rather than forcing a cause when confidence is low.
- All model outputs are labeled `DEMO MODEL OUTPUT` or `MOCK INFERENCE`
  until Phase 3 replaces them with trained models — data freshness
  (`DEMO` vs `LIVE`) is never faked.

This policy is enforced in both the frontend copy (see component files
under `frontend/src/components/`) and the backend service docstrings
(`backend/services/*.py`).

## 5. Association strength scoring (Phase 2)

`backend/services/vessel_attribution.py` documents the weighting used to
turn raw AIS/environment signals into a single 0-100 **association
strength** (never a "guilt score"):

| Factor                       | Weight |
|-------------------------------|-------|
| Spatial proximity              | 30%   |
| Temporal compatibility         | 25%   |
| Trajectory alignment           | 20%   |
| Environmental consistency      | 15%   |
| Behavioral anomalies           | 10%   |

Proximity alone never determines rank — a nearby vessel with no timing or
trajectory support scores lower than a further vessel with strong timing,
trajectory, and environmental consistency. The frontend mirrors this
conceptually in the pre-computed `VesselIntelligence.associationStrength`
field of each demo vessel (`frontend/src/data/vessels.ts`).

## 6. Response priority scoring (Phase 2)

`backend/services/response_priority.py` (mirrored by
`frontend/src/services/responsePriority.ts`) combines spill severity,
affected area, coast proximity, fisheries/MPA impact, detection
confidence, vessel association strength, and forecast risk trend into a
transparent composite score and CRITICAL/HIGH/MODERATE/LOW priority, with
a human-readable reason for every contributing factor.

## 7. VesselFinder provider abstraction

```
React + MapLibre → GET /api/vessels → FastAPI → vessel_provider.get_vessel_service()
                                                   ├─ mock (default)
                                                   └─ vesselfinder (if configured)
                                                        ↓ normalize
                                                   NEERNETRA Vessel model → GeoJSON → MapLibre
```

- `backend/services/mock_vessel_service.py` — always available, serves
  the bundled demo fleet.
- `backend/services/vesselfinder_service.py` — the **only** module
  allowed to hold the VesselFinder API key; normalizes VesselFinder
  records into the NEERNETRA `Vessel` schema. Never scrapes or iframes
  https://www.vesselfinder.com/.
- `backend/services/vessel_provider.py` — factory that picks mock vs.
  VesselFinder based on `VESSEL_DATA_PROVIDER`, and **automatically falls
  back to mock** if VesselFinder is selected but unavailable (missing key,
  network failure, malformed response). The frontend never sees the
  difference except via the `provider` field in API responses
  (`"LIVE"` or `"DEMO"`), and the tactical header never claims LIVE status
  when serving mock data.

## 8. Data architecture

No component hardcodes data inline. Frontend demo data lives under
`frontend/src/data/*.ts`; the backend's mirror lives under
`backend/data/mock_*.py`. Both are internally consistent — NEER-001 tells
one coherent story (see `docs/MODEL_INTEGRATION.md` §Demo story
consistency) across detection, environment, hindcast, AIS correlation,
counterfactual, dark contacts, impact, cause, and response priority.

## 9. Impact analysis (Phase 2, real geometry)

`backend/geospatial/impact_analysis.py` computes actual polygon overlap
between the spill polygon and fisheries/MPA reference layers using
Shapely (projected to EPSG:3857 for area calculations), rather than
looking up a canned answer. This is the one place in Phase 1/2 where the
"mock" data (spill/zone polygons) feeds a **real** computation — it is the
seam Phase 3 will extend with higher-fidelity GeoPandas reference layers
(shapefiles) and true coastline distance.

## 10. Reports (Phase 3)

Reports are the final output of the investigation pipeline, not a separate
document-management feature bolted on afterward — every value shown in a
report is read from the same `frontend/src/data/*` sources as Overview,
Investigation, and Intelligence (see §8). Two report types:

- **Incident Reports** (`/reports/incidents`) — filterable/sortable index
  (search, severity, region, status; sort by newest/oldest/severity/area/
  confidence) → a full report per incident (`/reports/incidents/:id`) in
  the fixed 14-section order specified by the product brief, ending with a
  "Play Incident Replay" button.
- **Area Reports** (`/reports/areas`) — area/time-period/severity controls
  generate a preview, which opens a full 11-section report per region.

Both report types support PDF export (`frontend/src/services/exportReport.ts`,
built with `jspdf`), labeled "INCIDENT INTELLIGENCE REPORT" / an area
equivalent — NEERNETRA never calls generated PDFs "legal proof".

## 11. Time-Based Incident Replay (Phase 3)

Replay is a first-class NEERNETRA capability (`/replay/:incidentId`), not
a decorative animation layer. It is built from three pieces:

- **Structured event data** — `frontend/src/data/replay.ts` defines
  `ReplayEvent { id, incidentId, timestampUtc, offsetHours, type, title,
  description, latitude?, longitude?, relatedVesselId?, relatedIncidentId
  }`. NEER-001 has a fully curated event list built from its own AIS
  activity/evidence-chain values (no invented numbers); every other
  incident derives its events directly from its existing evidence chain
  (`deriveFromEvidenceChain(...)`), so nothing is duplicated by hand.
- **Replay engine** (`frontend/src/services/replayEngine.ts`) — given an
  incident, its candidate vessels, and an hour offset, computes: vessel
  positions by linearly interpolating each vessel's real AIS trajectory
  (`frontend/src/data/aisTrajectories.ts`) between its two bracketing
  timestamps, and a spill-polygon growth factor derived from the release
  window (pre-detection growth) through the forecast snapshots
  (`frontend/src/data/forecasts.ts`, post-detection growth). This produces
  a modified `Incident` + `Vessel[]` pair that is fed straight back into
  the existing, unmodified `<TacticalMap>` — replay does not fork the map
  rendering code.
- **Playback UI** (`frontend/src/components/Replay/`, driven by
  `frontend/src/hooks/useReplayClock.ts`) — play/pause, step back/forward
  (1 hour), 0.5x/1x/2x/4x speed, and a draggable scrubber spanning T-24H
  to T+24H with clickable event tick marks. Selecting an event jumps the
  clock, the map, and (where relevant) opens that vessel's drawer.

A `LIVE MODE` / `REPLAY MODE` badge is always visible — Investigation
shows `LIVE MODE` with a "Start Time-Based Incident Replay" button; the
replay view itself shows `REPLAY MODE` and offers "Exit to Live
Investigation" — so historical reconstruction is never confused with
current monitoring.

The backend mirrors this exactly in `backend/services/incident_replay.py`
(`get_replay_events(incident_id)`, exposed at
`GET /api/incidents/{id}/replay-events`) so a future fetch-from-API
frontend mode has the identical event set available server-side.

## 12. Final QA notes (Phase 3)

- **Investigative language QA**: the codebase contains no instance of
  "guilty", "culprit", "confirmed responsible", "guilt score", or
  "probability of guilt" as actual UI copy (the single occurrence in
  `backend/services/vessel_attribution.py` is a docstring explicitly
  prohibiting the term). The disclaimer "Investigative lead only.
  Correlation does not establish vessel responsibility." appears in the
  vessel drawer's NEERNETRA Intelligence section, the incident report's
  AIS & Vessel Analysis section, and the exported PDF.
- **Data honesty**: every mock/demo surface is labeled (`DEMO`, `DEMO
  SATELLITE DATA`, `DEMO MODEL OUTPUT`, `MOCK INFERENCE`); the
  VesselFinder provider abstraction only ever reports `LIVE` when a real
  key is configured and reachable (§7).
- **Flat UX**: every investigation path is map + contextual drawer, not a
  deep screen stack — Overview → spill drawer → "Investigate" jumps
  straight into the Investigation console; vessel rows in the AIS
  correlation table and report tables open the same `VesselDrawer` in
  place rather than a new screen.
- **Build QA**: `tsc -b --noEmit` and `npm run build` both pass cleanly;
  all FastAPI routes were smoke-tested via `TestClient` and return 200.

## 13. Map engine

NEERNETRA renders its tactical map with **MapLibre GL JS** directly
(`frontend/src/components/Map/TacticalMap.tsx`) — no Mapbox account or
access token is required. The style is a provider-agnostic constant:

```ts
const DEFAULT_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const MAP_STYLE = import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE;
```

CARTO's free "dark-matter" vector style was chosen as the default because
it is the closest free, keyless equivalent to NEERNETRA's previous dark
basemap. Set `VITE_MAP_STYLE_URL` to point at any other MapLibre-compatible
style (self-hosted, MapTiler, Stadia Maps, etc.) without touching any
map-rendering code — every source/layer NEERNETRA draws (spill polygons,
AIS tracks, vessel markers, current/wind vectors, fishing zones, MPAs,
satellite footprints, heatmap, route density) is added via
`map.addSource()` / `map.addLayer()` against GeoJSON that is entirely
independent of the base style.

## 14. Visual design system

Dark maritime tactical command console. See `frontend/src/styles/theme.css`
for the full token set:

- Deep navy / blue-black / dark slate surfaces
- Cyan = active/AIS/satellite/system status
- Red = critical/spill/severe
- Amber = warning/uncertainty/under review
- Green = verified/cleared/healthy
- IBM Plex Sans (UI) / IBM Plex Mono (telemetry, coordinates, IDs)

This is intentionally **not** a generic SaaS dashboard — compact panels,
uppercase micro-labels, thin borders, map-first layouts.
