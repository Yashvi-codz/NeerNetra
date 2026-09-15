# NEERNETRA

**One Eye. One Ocean. Zero Blind Spots.**

NEERNETRA is an AI-powered maritime intelligence and oil-spill incident
investigation platform. It is not a spill classifier — it is a forensic
investigation console that walks an analyst from satellite detection
through environment, hindcast, AIS correlation, vessel attribution,
counterfactual analysis, dark-vessel cross-verification, impact
assessment, probable-cause analysis, and response prioritization.

This repository currently implements **Phase 1 (foundation, tactical UI,
map, demo data, core navigation)**, **Phase 2 (investigation pipeline,
AIS correlation, VesselFinder provider architecture, dark vessel
intelligence, counterfactual/cause/forecast/impact analysis)**, and
**Phase 3 (full Reports with filters/search/export, Time-Based Incident
Replay, and final integration/QA polish)** — the complete product.

---

## Project structure

```
NEERNETRA/
  frontend/          React + TypeScript + MapLibre GL JS
    src/
      components/    Map, Vessel, Spill, EvidenceChain, Timeline, Replay,
                      Forecast, Impact, Charts, TacticalHeader, SideDrawer,
                      Layout, Reports
      pages/          Overview, Investigation, Intelligence, Reports, Replay
      data/           Structured demo datasets (incidents, vessels, AIS, ...)
      services/       geo.ts, time.ts, responsePriority.ts
      hooks/          useUtcClock, useLayerToggles
      types/          Shared TypeScript contracts
  backend/            FastAPI
    api/routes/       incidents, vessels, dark_contacts, analysis, environment, health
    services/         Model interfaces + VesselFinder provider abstraction
    geospatial/       Shapely/GeoPandas impact analysis
    data/             Mock datasets (mirrors frontend/src/data)
  docs/
    ARCHITECTURE.md
    MODEL_INTEGRATION.md
  .env.example
```

## Running the frontend

```bash
cd frontend
npm install
cp .env.example .env      # optionally set VITE_MAP_STYLE_URL
npm run dev                # http://localhost:5173
```

The tactical map uses [MapLibre GL JS](https://maplibre.org/) with a free,
no-account-required style (CARTO's dark-matter by default) — there is no
Mapbox token to configure. Set `VITE_MAP_STYLE_URL` in `.env` only if you
want to point at a different MapLibre-compatible style.

`npm run build` produces a production bundle in `frontend/dist/`.

## Running the backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Interactive API docs: `http://localhost:8000/docs`.

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see
`frontend/vite.config.ts`), so the frontend and backend can be run
independently — the frontend currently renders entirely from its own
bundled demo data (`frontend/src/data/*`) for zero-setup Phase 1/2 demoing,
while the backend exposes the equivalent data + real Phase 2 analytics
(Shapely-based impact overlap, response-priority scoring) over HTTP for
future wiring and for API-first integration testing.

## Demo mode

NEERNETRA runs entirely on structured demo data by default:

- `VESSEL_DATA_PROVIDER=mock` (default) — set to `vesselfinder` +
  `VESSELFINDER_API_KEY=...` to use live VesselFinder AIS data. If the key
  is missing or the API call fails, NEERNETRA automatically falls back to
  mock data and reports `DEMO` status — it never claims to be live when it
  isn't.
- All model outputs (spill detection, hindcast, counterfactual, cause
  analysis, forecast) are labeled `DEMO MODEL OUTPUT` / `MOCK INFERENCE`
  until real models are wired in (Phase 3).

See `docs/ARCHITECTURE.md` and `docs/MODEL_INTEGRATION.md` for details.

## What's implemented (Phase 1 + Phase 2 + Phase 3)

- Dark maritime tactical command-console UI (navy/cyan/red/amber/green)
- Overview, Investigation, Intelligence, Dark Vessel Intelligence, and
  Reports (landing, incident report, area report) pages, all routed
- MapLibre GL map (free style, no token) with spill polygons, drift
  boundary, AIS tracks, vessel
  markers, current/wind vectors, probable origin, release/search-radius
  circles, fishing zones, MPAs, satellite footprints, traffic heatmap and
  route density
- Vessel hover tooltip + 7-section vessel drawer; 8-section spill drawer
  with evidence chain
- AIS spatio-temporal correlation matrix with association-strength ranking
- Counterfactual vessel analysis, probable-cause analysis with feature
  contributions, forward drift forecast panel, impact analysis (real
  Shapely polygon overlap on the backend), response-priority scoring
- Dark Vessel Intelligence page: KPI cards, filters, satellite-vs-AIS
  comparison visual, dark contact table + drawer
- VesselFinder provider abstraction with automatic mock fallback
- FastAPI backend with all of the above exposed as JSON, plus model
  interface stubs for Phase 3 (`detect_oil_spill`, `detect_vessels`,
  `hindcast_spill`, `forecast_spill`, `attribute_vessel`,
  `run_counterfactual`, `analyze_cause`, `get_incident_replay`)

**Phase 3 additions:**

- **Reports, fully functional.** Incident Reports landing page with
  search, severity/region/status filters, and sort (newest, oldest,
  highest severity, largest spill, highest confidence). Every incident
  report follows the exact 14-section order: Executive Summary → Satellite
  Detection → Spill Characteristics → Environmental Conditions → Probable
  Origin & Hindcast → AIS & Vessel Analysis → Dark Vessel Intelligence →
  Counterfactual Analysis → Forecast → Environmental & Fisheries Impact →
  Probable Cause → Response Priority → Evidence Chain → Time-Based
  Incident Replay (always last).
- **Area Reports.** Area / time-period / severity controls generate a
  preview (incident count, high-severity count, total affected area,
  high-priority vessel associations, dark vessel contacts, MPAs at risk),
  which opens a full 11-section area report (overview, incident map,
  hotspots, temporal trend charts, environmental impact, maritime activity,
  dark vessel summary, cause distribution, high-risk incident cards, area
  risk assessment, export).
- **PDF export** (`frontend/src/services/exportReport.ts`, via `jspdf`) for
  both incident and area reports, labeled "INCIDENT INTELLIGENCE REPORT" /
  area equivalent — never called "legal proof".
- **Time-Based Incident Replay** (`/replay/:incidentId`) — a first-class
  capability, not a decorative animation. Play/pause, step back/forward,
  0.5x/1x/2x/4x speed, and a draggable scrubber with event tick marks
  spanning T-24H to T+24H. As time advances, the map re-renders: vessel
  markers move along their real AIS trajectories (interpolated), the spill
  polygon grows from the release window through the forecast horizon,
  and origin/search-radius/impact layers toggle on at the right moments.
  Every event is clickable and jumps the timeline + map + vessel drawer to
  that moment. A clear `LIVE MODE` / `REPLAY MODE` badge always
  distinguishes current monitoring from historical reconstruction.
  Replay data is structured (`ReplayEvent`: timestamp, type, title,
  description, latitude, longitude, relatedVesselId, relatedIncidentId) in
  `frontend/src/data/replay.ts`, mirrored on the backend in
  `backend/services/incident_replay.py` / `GET /api/incidents/{id}/replay-events`.
  Every Incident Report ends with a "Play Incident Replay" button that
  opens this same view for that incident — no duplicated data.

## What's next (beyond this build)
- Real satellite/AIS ingestion pipelines replacing mock detection
- Live drift/forecast model wired to `forecast_spill(...)`
- Persistent storage (currently all data is in-memory/static)
- AuthN/AuthZ for multi-analyst deployments
- Code-splitting the frontend bundle (currently a single ~850KB gzipped
  chunk — functional but flagged by Vite's build output as a candidate for
  `dynamic import()` per-route splitting)
- CSV/GeoJSON export alongside the existing PDF export
- Wiring the frontend to read live from the FastAPI backend instead of its
  bundled demo dataset (the backend already exposes an equivalent API
  surface — see docs/ARCHITECTURE.md)
