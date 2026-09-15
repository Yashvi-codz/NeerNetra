import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer, IconLayer, TextLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { PathStyleExtension } from '@deck.gl/extensions';
import type { MapLayerId, Vessel, Incident } from '@/types';
import {
  spillPolygonsToFC,
  driftBoundaryToFC,
  trajectoriesToFC,
  fishingZonesToFC,
  mpasToFC,
  satelliteFootprintsToFC,
  darkContactsToFC,
  originPointsToFC,
  detectionPointsToFC,
  coastlineToFC,
  routeDensityToFC,
  trajectoryArrowheadsToFC,
  circlePolygon,
  sceneBounds,
} from '@/services/geo';
import { getVesselIconAtlas, mpaLabelPoints, backtrackPaths, FlowParticleField } from '@/services/deckAdapters';
import { aisTrajectories } from '@/data/aisTrajectories';
import { fishingZones } from '@/data/fisheries';
import { mpas } from '@/data/mpas';
import { satelliteFootprints } from '@/data/satellite';
import { darkContacts } from '@/data/darkContacts';
import { coastlineSegments } from '@/data/coastlineDemo';
import { generateCurrentField, generateWindField } from '@/data/environmentGrid';
import { VesselTooltip } from './VesselTooltip';

// ---------------------------------------------------------------------
// NEERNETRA map engine split:
//   MapLibre GL JS  = basemap, camera, geographic context, map controls
//   deck.gl         = every data-driven geospatial visualization layer
// No Mapbox GL JS, no Mapbox access token, anywhere in this file.
// ---------------------------------------------------------------------

// Free, key-less satellite raster basemap (Esri World Imagery — no account
// required, fair-use tile service, no Mapbox token). Configurable via
// VITE_MAP_STYLE_URL if a different MapLibre-compatible style is preferred
// (vector or raster) — see .env.example.
const ESRI_WORLD_IMAGERY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Imagery: Esri, Maxar, Earthstar Geographics, and the GIS community',
    },
  },
  layers: [{ id: 'esri-world-imagery-layer', type: 'raster', source: 'esri-world-imagery' }],
};
const MAP_STYLE: maplibregl.StyleSpecification | string =
  (import.meta.env.VITE_MAP_STYLE_URL as string | undefined) || ESRI_WORLD_IMAGERY_STYLE;

// Deterministic vector fields (see data/environmentGrid.ts) — generated
// once at module load, reused by every TacticalMap instance.
const CURRENT_FIELD = generateCurrentField();
const WIND_FIELD = generateWindField();

// Module-scope, stable-identity FeatureCollections for data that doesn't
// depend on component props — critical so deck.gl's default reference-based
// diffing never re-processes these every animation frame.
const FISHING_FC = fishingZonesToFC(fishingZones);
const MPA_FC = mpasToFC(mpas);
const MPA_LABELS = mpaLabelPoints(mpas);
const SATELLITE_FC = satelliteFootprintsToFC(satelliteFootprints);
const COASTLINE_FC = coastlineToFC(coastlineSegments);
const AIS_TRACKS_FC = trajectoriesToFC(aisTrajectories);
const TRAJECTORY_HEADS_FC = trajectoryArrowheadsToFC(aisTrajectories);
const ROUTE_DENSITY_FC = routeDensityToFC(aisTrajectories);
const DARK_CONTACTS_FC = darkContactsToFC(darkContacts);

const SEVERITY_COLOR: Record<string, [number, number, number]> = {
  LOW: [245, 197, 24],
  MODERATE: [245, 166, 35],
  HIGH: [255, 138, 61],
  CRITICAL: [255, 77, 79],
};

type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
const RISK_COLOR: Record<RiskTier, [number, number, number]> = {
  LOW: [147, 164, 184],
  MEDIUM: [245, 166, 35],
  HIGH: [255, 138, 61],
  CRITICAL: [255, 77, 79],
};
// Derived from the EXISTING intelligence.associationStrength / .investigativeStatus
// fields (no new scoring system) — NEERNETRA has no standalone riskScore/riskLevel
// field today, so association strength is the closest existing equivalent.
function vesselRiskTier(v: Vessel): RiskTier {
  if (!v.intelligence) return 'LOW';
  if (v.intelligence.investigativeStatus === 'CLEARED') return 'LOW';
  const s = v.intelligence.associationStrength;
  if (s >= 80) return 'CRITICAL';
  if (s >= 60) return 'HIGH';
  if (s >= 35) return 'MEDIUM';
  return 'LOW';
}

// The incident the initial camera frames and the one release-zone/search-radius
// circles are drawn around when nothing is explicitly selected — prefers an
// explicit focusIncident (Investigation/VesselDetail/Replay pages already pass
// one), otherwise the highest-severity incident, otherwise the first.
const SEVERITY_RANK: Record<string, number> = { CRITICAL: 3, HIGH: 2, MODERATE: 1, LOW: 0 };
function pickPrimaryIncident(incidents: Incident[], focusIncident?: Incident): Incident | undefined {
  if (focusIncident) return focusIncident;
  if (!incidents.length) return undefined;
  return [...incidents].sort(
    (a, b) => (SEVERITY_RANK[b.characteristics.severity] ?? 0) - (SEVERITY_RANK[a.characteristics.severity] ?? 0)
  )[0];
}

interface TacticalMapProps {
  incidents: Incident[];
  vessels: Vessel[];
  activeLayers: Partial<Record<MapLayerId, boolean>>;
  center: [number, number];
  zoom: number;
  selectedVesselId?: string | null;
  selectedIncidentId?: string | null;
  onVesselClick?: (vesselId: string) => void;
  onSpillClick?: (incidentId: string) => void;
  onDarkContactClick?: (contactId: string) => void;
  focusIncident?: Incident;
}

interface HoverState {
  vessel: Vessel;
  x: number;
  y: number;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  vessels,
  activeLayers,
  center,
  zoom,
  selectedVesselId,
  selectedIncidentId,
  onVesselClick,
  onSpillClick,
  onDarkContactClick,
  focusIncident,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [ready, setReady] = useState(false);
  const [styleLoadError, setStyleLoadError] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ lat: number; lng: number } | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [zoomTier, setZoomTier] = useState(Math.floor(zoom));

  const candidateVesselIds = useMemo(() => vessels.filter((v) => v.intelligence).map((v) => v.id), [vessels]);
  const spillFC = useMemo(() => spillPolygonsToFC(incidents), [incidents]);
  const detectionFC = useMemo(() => detectionPointsToFC(incidents), [incidents]);
  const originFC = useMemo(() => originPointsToFC(incidents), [incidents]);
  const driftFC = useMemo(() => driftBoundaryToFC(incidents), [incidents]);
  const backtrackList = useMemo(() => backtrackPaths(incidents), [incidents]);
  const iconAtlas = useMemo(() => getVesselIconAtlas(), []);
  const primaryIncident = useMemo(() => pickPrimaryIncident(incidents, focusIncident), [incidents, focusIncident]);
  // Tight seeding box around the active incident so CURRENT/WIND particles
  // read as a dense, continuous field at the zoom the camera actually opens
  // at, instead of being scattered thinly across the whole Arabian Sea.
  const particleBounds = useMemo(() => {
    if (!primaryIncident) return undefined;
    const c = primaryIncident.characteristics.centroid;
    const pad = 0.5; // roughly matches the initial camera framing (sceneBounds), so most
    // particles stay within the visible viewport instead of being diluted across a much
    // larger area than the camera ever shows.
    return { south: c.latitude - pad, north: c.latitude + pad, west: c.longitude - pad, east: c.longitude + pad };
  }, [primaryIncident]);
  const emphasizedVessels = useMemo(
    () => vessels.filter((v) => vesselRiskTier(v) === 'HIGH' || vesselRiskTier(v) === 'CRITICAL'),
    [vessels]
  );
  const labelVessels = useMemo(() => {
    return vessels.filter((v) => {
      if (v.id === selectedVesselId) return true;
      if (v.intelligence) return true; // candidate/investigated vessels always labeled
      return zoomTier >= 10;
    });
  }, [vessels, selectedVesselId, zoomTier]);

  // Particle fields persist for the component's lifetime (advected every
  // animation frame in the effect below — see services/deckAdapters.ts).
  const currentParticlesRef = useRef<FlowParticleField | null>(null);
  const windParticlesRef = useRef<FlowParticleField | null>(null);
  if (!currentParticlesRef.current)
    currentParticlesRef.current = new FlowParticleField(CURRENT_FIELD, 240, 1, 0.9, particleBounds);
  if (!windParticlesRef.current)
    windParticlesRef.current = new FlowParticleField(WIND_FIELD, 200, 971, 1.3, particleBounds);

  // Latest-value refs so deck.gl layer callbacks / the animation loop never
  // close over stale props without needing to rebuild layers each render.
  const onVesselClickRef = useRef(onVesselClick);
  onVesselClickRef.current = onVesselClick;
  const onSpillClickRef = useRef(onSpillClick);
  onSpillClickRef.current = onSpillClick;
  const onDarkContactClickRef = useRef(onDarkContactClick);
  onDarkContactClickRef.current = onDarkContactClick;
  const activeLayersRef = useRef(activeLayers);
  useEffect(() => {
    activeLayersRef.current = activeLayers;
  }, [activeLayers]);
  const emphasizedVesselsRef = useRef(emphasizedVessels);
  useEffect(() => {
    emphasizedVesselsRef.current = emphasizedVessels;
  }, [emphasizedVessels]);

  // ---- Initialize MapLibre map + deck.gl overlay ----
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    const overlay = new MapboxOverlay({ layers: [] });
    map.addControl(overlay as unknown as maplibregl.IControl);
    overlayRef.current = overlay;

    map.on('mousemove', (e) => setCursorPos({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    map.on('zoom', () => setZoomTier(Math.floor(map.getZoom())));
    map.on('load', () => {
      // Frame the active incident + nearby vessels on first paint — the
      // page-supplied center/zoom is a fallback only, used when there's no
      // incident data to frame around.
      const primary = pickPrimaryIncident(incidents, focusIncident);
      if (primary) {
        const bounds = sceneBounds(primary, vessels);
        map.fitBounds(bounds, { padding: 70, maxZoom: 11, duration: 0 });
      }
      setReady(true);
    });
    map.on('error', (e) => {
      console.error('NEERNETRA map style error:', e.error);
      setStyleLoadError(true);
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Fly to focus incident ----
  useEffect(() => {
    if (!ready || !mapRef.current || !focusIncident) return;
    mapRef.current.flyTo({
      center: [focusIncident.characteristics.centroid.longitude, focusIncident.characteristics.centroid.latitude],
      zoom: 10.5,
      duration: 900,
    });
  }, [ready, focusIncident]);

  // ---- Build the deck.gl layer stack (recomputed only on real state changes,
  // NOT every animation frame — see the separate rAF effect below for the
  // handful of continuously-animated layers). Stacking order follows
  // NEERNETRA's recommended tactical hierarchy: satellite -> coastline ->
  // MPA -> fishing -> route density -> traffic heatmap -> spill mask ->
  // backtracking -> AIS tracks -> vessel icons -> labels.
  const staticLayers = useMemo(() => {
    if (!ready) return [] as any[];
    const layers: any[] = [];

    // === SATELLITE — observation coverage swath ===
    layers.push(
      new GeoJsonLayer({
        id: 'satellite-footprints',
        data: SATELLITE_FC,
        visible: Boolean(activeLayers.sarEvents || activeLayers.satelliteFootprints),
        filled: true,
        stroked: true,
        getFillColor: [55, 212, 255, 38],
        getLineColor: [55, 212, 255, 210],
        getLineWidth: 1.5,
        lineWidthUnits: 'pixels',
        getDashArray: [3, 2],
        extensions: [new PathStyleExtension({ dash: true })],
      })
    );

    // === COASTLINE ===
    layers.push(
      new GeoJsonLayer({
        id: 'coastline',
        data: COASTLINE_FC,
        visible: Boolean(activeLayers.coast),
        filled: false,
        stroked: true,
        getLineColor: [222, 240, 255, 235],
        getLineWidth: 2,
        lineWidthUnits: 'pixels',
      })
    );

    // === MPA ===
    layers.push(
      new GeoJsonLayer({
        id: 'mpas',
        data: MPA_FC,
        visible: Boolean(activeLayers.mpas),
        filled: true,
        stroked: true,
        getFillColor: [53, 211, 153, 70],
        getLineColor: [53, 211, 153, 235],
        getLineWidth: 2,
        lineWidthUnits: 'pixels',
      })
    );
    layers.push(
      new TextLayer({
        id: 'mpas-label',
        data: MPA_LABELS,
        visible: Boolean(activeLayers.mpas),
        getPosition: (d: any) => d.position,
        getText: (d: any) => d.name,
        getSize: 11,
        getColor: [190, 255, 226, 235],
        fontFamily: 'monospace',
        background: true,
        backgroundPadding: [4, 2],
        getBackgroundColor: [4, 12, 10, 170],
      })
    );

    // === FISHING ===
    layers.push(
      new GeoJsonLayer({
        id: 'fishing-zones',
        data: FISHING_FC,
        visible: Boolean(activeLayers.fishingZones),
        filled: true,
        stroked: true,
        getFillColor: (f: any) => {
          const lvl = f.properties.activityLevel;
          const a = lvl === 'HIGH' ? 85 : lvl === 'MODERATE' ? 60 : 34;
          return [70, 200, 120, a];
        },
        getLineColor: [70, 200, 120, 215],
        getLineWidth: 1.4,
        lineWidthUnits: 'pixels',
      })
    );

    // === ROUTE DENSITY — aggregated shipping corridors (distinct from AIS TRACKS) ===
    layers.push(
      new GeoJsonLayer({
        id: 'route-density',
        data: ROUTE_DENSITY_FC,
        visible: Boolean(activeLayers.routeDensity),
        filled: false,
        stroked: true,
        getLineColor: (f: any) => [245, 166, 35, Math.min(120 + f.properties.density * 35, 235)],
        getLineWidth: (f: any) => Math.min(1.8 + f.properties.density * 1.6, 8),
        lineWidthUnits: 'pixels',
      })
    );

    // === TRAFFIC HEATMAP — derived from live vessel positions ===
    layers.push(
      new HeatmapLayer({
        id: 'traffic-heatmap',
        data: vessels,
        visible: Boolean(activeLayers.trafficHeatmap),
        getPosition: (d: Vessel) => [d.longitude, d.latitude],
        getWeight: 1,
        radiusPixels: 44,
        intensity: 1.1,
        threshold: 0.04,
        colorRange: [
          [11, 21, 33, 0],
          [28, 143, 184, 110],
          [55, 212, 255, 160],
          [245, 166, 35, 200],
          [255, 77, 79, 255],
        ],
      })
    );

    // === SPILL MASK — highest-priority layer ===
    layers.push(
      new GeoJsonLayer({
        id: 'spill-mask',
        data: spillFC,
        visible: Boolean(activeLayers.spillMask),
        filled: true,
        stroked: true,
        pickable: true,
        getFillColor: (f: any) => {
          const base = SEVERITY_COLOR[f.properties.severity] ?? SEVERITY_COLOR.CRITICAL;
          const isSel = f.properties.incidentId === selectedIncidentId;
          const conf = f.properties.confidence ?? 60;
          const a = isSel ? 95 + conf * 0.6 : 30 + conf * 0.45;
          return [...base, Math.min(a, 235)];
        },
        getLineColor: (f: any) =>
          f.properties.incidentId === selectedIncidentId
            ? [255, 255, 255, 255]
            : [...(SEVERITY_COLOR[f.properties.severity] ?? SEVERITY_COLOR.CRITICAL), 230],
        getLineWidth: (f: any) => (f.properties.incidentId === selectedIncidentId ? 3 : 1.4),
        lineWidthUnits: 'pixels',
        onClick: (info: any) => {
          const id = info.object?.properties?.incidentId;
          if (id) onSpillClickRef.current?.(id);
        },
        updateTriggers: {
          getFillColor: [selectedIncidentId],
          getLineColor: [selectedIncidentId],
          getLineWidth: [selectedIncidentId],
        },
      })
    );

    // Selected-spill glow (only the selected incident gets emphasis)
    if (selectedIncidentId) {
      const selFeature = (spillFC.features as any[]).find((f) => f.properties.incidentId === selectedIncidentId);
      if (selFeature) {
        const base = SEVERITY_COLOR[selFeature.properties.severity] ?? SEVERITY_COLOR.CRITICAL;
        [10, 5].forEach((w, idx) => {
          layers.push(
            new GeoJsonLayer({
              id: `spill-glow-${idx}`,
              data: { type: 'FeatureCollection', features: [selFeature] },
              visible: Boolean(activeLayers.spillMask),
              filled: false,
              stroked: true,
              getLineColor: [...base, 55 - idx * 20],
              getLineWidth: w,
              lineWidthUnits: 'pixels',
            })
          );
        });
      }
    }

    // Detection point vs. probable origin/source point — kept distinct
    layers.push(
      new GeoJsonLayer({
        id: 'spill-detection-point',
        data: detectionFC,
        visible: Boolean(activeLayers.spillMask),
        pointType: 'circle',
        filled: true,
        stroked: true,
        getPointRadius: 5,
        pointRadiusUnits: 'pixels',
        getFillColor: [55, 212, 255, 255],
        getLineColor: [6, 12, 20, 255],
        getLineWidth: 1.5,
        lineWidthUnits: 'pixels',
      })
    );
    layers.push(
      new GeoJsonLayer({
        id: 'probable-origin-point',
        data: originFC,
        visible: Boolean(activeLayers.probableOrigin || activeLayers.spillMask),
        pointType: 'circle',
        filled: true,
        stroked: true,
        getPointRadius: 6,
        pointRadiusUnits: 'pixels',
        getFillColor: [255, 77, 79, 255],
        getLineColor: [6, 12, 20, 255],
        getLineWidth: 2,
        lineWidthUnits: 'pixels',
      })
    );

    // === BACKTRACKING — origin -> detected spill, for every incident so it's
    // visible even before anything is explicitly selected; the selected one
    // (or the primary/focus incident if nothing is selected) gets emphasis.
    const emphasisIncidentId = selectedIncidentId ?? primaryIncident?.id ?? null;
    backtrackList.forEach((bp) => {
      const isEmphasized = bp.incidentId === emphasisIncidentId;
      layers.push(
        new PathLayer({
          id: `backtrack-path-${bp.incidentId}`,
          data: [bp],
          visible: Boolean(activeLayers.spillMask),
          getPath: (d: any) => d.path,
          getColor: isEmphasized ? [255, 255, 255, 235] : [255, 255, 255, 130],
          getWidth: isEmphasized ? 2.6 : 1.6,
          widthUnits: 'pixels',
          getDashArray: [3, 2],
          extensions: [new PathStyleExtension({ dash: true })],
        })
      );
    });

    // === SPILL LABEL — id + severity near each incident (existing fields only) ===
    layers.push(
      new TextLayer({
        id: 'spill-labels',
        data: incidents,
        visible: Boolean(activeLayers.spillMask),
        getPosition: (d: Incident) => [d.characteristics.centroid.longitude, d.characteristics.centroid.latitude],
        getText: (d: Incident) => `${d.id}\nOIL SPILL\n${d.characteristics.severity}`,
        getSize: 11,
        fontFamily: 'monospace',
        getPixelOffset: [0, 30],
        getColor: [255, 255, 255, 240],
        background: true,
        backgroundPadding: [6, 4],
        getBackgroundColor: (d: Incident) => {
          const c = SEVERITY_COLOR[d.characteristics.severity] ?? SEVERITY_COLOR.CRITICAL;
          return [Math.round(c[0] * 0.28), Math.round(c[1] * 0.22), Math.round(c[2] * 0.22), 215];
        },
      })
    );

    // Drift boundary (investigation-only layer, unchanged)
    layers.push(
      new GeoJsonLayer({
        id: 'drift-boundary',
        data: driftFC,
        visible: Boolean(activeLayers.driftBoundary),
        filled: false,
        stroked: true,
        getLineColor: [245, 166, 35, 200],
        getLineWidth: 1.4,
        lineWidthUnits: 'pixels',
        getDashArray: [2, 2],
        extensions: [new PathStyleExtension({ dash: true })],
      })
    );

    // === AIS TRACKS ===
    layers.push(
      new GeoJsonLayer({
        id: 'ais-tracks',
        data: AIS_TRACKS_FC,
        visible: Boolean(activeLayers.aisTracks),
        filled: false,
        stroked: true,
        getLineColor: (f: any) => {
          const vid = f.properties.vesselId;
          if (vid === selectedVesselId) return [55, 212, 255, 245];
          if (candidateVesselIds.includes(vid)) return [255, 138, 61, 220];
          return [70, 190, 230, 165];
        },
        getLineWidth: (f: any) => {
          const vid = f.properties.vesselId;
          if (vid === selectedVesselId) return 3.4;
          if (candidateVesselIds.includes(vid)) return 2.6;
          return 1.6;
        },
        lineWidthUnits: 'pixels',
        updateTriggers: {
          getLineColor: [selectedVesselId, candidateVesselIds],
          getLineWidth: [selectedVesselId, candidateVesselIds],
        },
      })
    );
    layers.push(
      new GeoJsonLayer({
        id: 'trajectory-arrowheads',
        data: TRAJECTORY_HEADS_FC,
        visible: Boolean(activeLayers.aisTracks),
        filled: true,
        stroked: false,
        getFillColor: (f: any) => {
          const vid = f.properties.vesselId;
          if (vid === selectedVesselId) return [55, 212, 255, 250];
          if (candidateVesselIds.includes(vid)) return [255, 138, 61, 235];
          return [70, 190, 230, 200];
        },
        updateTriggers: { getFillColor: [selectedVesselId, candidateVesselIds] },
      })
    );

    // Dark contacts (SAR / intelligence pages)
    layers.push(
      new GeoJsonLayer({
        id: 'dark-contacts',
        data: DARK_CONTACTS_FC,
        visible: Boolean(activeLayers.sarEvents),
        pointType: 'circle',
        pickable: true,
        filled: true,
        stroked: true,
        getPointRadius: 6.5,
        pointRadiusUnits: 'pixels',
        getFillColor: (f: any) => {
          const status = f.properties.status;
          if (status === 'UNRESOLVED') return [255, 77, 79, 235];
          if (status === 'CLEARED') return [53, 211, 153, 220];
          return [245, 166, 35, 230];
        },
        getLineColor: [6, 12, 20, 255],
        getLineWidth: 1.5,
        lineWidthUnits: 'pixels',
        onClick: (info: any) => {
          const id = info.object?.properties?.contactId;
          if (id) onDarkContactClickRef.current?.(id);
        },
      })
    );

    // Release zone / search radius / forecast footprint (investigation extras)
    const originForRadius = pickPrimaryIncident(incidents, focusIncident);
    if (originForRadius) {
      const origin = originForRadius.hindcast.probableOriginPoint;
      layers.push(
        new GeoJsonLayer({
          id: 'release-zone',
          data: circlePolygon(origin.latitude, origin.longitude, 1.5),
          visible: Boolean(activeLayers.releaseZone),
          filled: false,
          stroked: true,
          getLineColor: [245, 166, 35, 190],
          getLineWidth: 1.2,
          lineWidthUnits: 'pixels',
          getDashArray: [1.5, 1.5],
          extensions: [new PathStyleExtension({ dash: true })],
        })
      );
      layers.push(
        new GeoJsonLayer({
          id: 'search-radius',
          data: circlePolygon(origin.latitude, origin.longitude, 6),
          visible: Boolean(activeLayers.searchRadius),
          filled: false,
          stroked: true,
          getLineColor: [55, 212, 255, 160],
          getLineWidth: 1.2,
          lineWidthUnits: 'pixels',
          getDashArray: [3, 2],
          extensions: [new PathStyleExtension({ dash: true })],
        })
      );
      layers.push(
        new GeoJsonLayer({
          id: 'forecast-footprint',
          data: circlePolygon(origin.latitude, origin.longitude, 9),
          visible: Boolean(activeLayers.forecastFootprint),
          filled: false,
          stroked: true,
          getLineColor: [92, 112, 134, 170],
          getLineWidth: 1,
          lineWidthUnits: 'pixels',
          getDashArray: [1, 2],
          extensions: [new PathStyleExtension({ dash: true })],
        })
      );
    }

    // === VESSEL ICONS — rotated by the EXISTING courseDeg field ===
    layers.push(
      new IconLayer({
        id: 'vessel-icons',
        data: vessels,
        pickable: true,
        iconAtlas: iconAtlas.url,
        iconMapping: iconAtlas.mapping,
        getIcon: () => 'vessel',
        getPosition: (d: Vessel) => [d.longitude, d.latitude],
        getAngle: (d: Vessel) => d.courseDeg,
        sizeUnits: 'pixels',
        getSize: (d: Vessel) => {
          if (d.id === selectedVesselId) return 40;
          const tier = vesselRiskTier(d);
          return tier === 'CRITICAL' ? 34 : tier === 'HIGH' ? 31 : tier === 'MEDIUM' ? 28 : 24;
        },
        getColor: (d: Vessel) => {
          if (d.id === selectedVesselId) return [55, 212, 255, 255];
          const tier = vesselRiskTier(d);
          return [...RISK_COLOR[tier], tier === 'LOW' ? 225 : 255];
        },
        onClick: (info: any) => {
          if (info.object) onVesselClickRef.current?.(info.object.id);
        },
        onHover: (info: any) =>
          setHover(info.object ? { vessel: info.object as Vessel, x: info.x, y: info.y } : null),
        updateTriggers: {
          getSize: [selectedVesselId],
          getColor: [selectedVesselId],
        },
      })
    );

    // === VESSEL LABELS — zoom-dependent, candidate/selected prioritized ===
    layers.push(
      new TextLayer({
        id: 'vessel-labels',
        data: labelVessels,
        getPosition: (d: Vessel) => [d.longitude, d.latitude],
        getText: (d: Vessel) => (zoomTier >= 12 ? `${d.name} \u00b7 ${d.mmsi}` : d.name),
        getSize: 11,
        fontFamily: 'monospace',
        getPixelOffset: [0, -20],
        background: true,
        backgroundPadding: [4, 2],
        getBackgroundColor: [6, 10, 17, 175],
        getColor: (d: Vessel) => {
          if (d.id === selectedVesselId) return [55, 212, 255, 255];
          if (candidateVesselIds.includes(d.id)) return [255, 138, 61, 235];
          return [200, 214, 227, 205];
        },
        updateTriggers: { getColor: [selectedVesselId, candidateVesselIds], getText: [zoomTier] },
      })
    );

    return layers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    incidents,
    vessels,
    activeLayers,
    selectedVesselId,
    selectedIncidentId,
    candidateVesselIds,
    focusIncident,
    spillFC,
    detectionFC,
    originFC,
    driftFC,
    backtrackList,
    labelVessels,
    zoomTier,
    iconAtlas,
    primaryIncident,
  ]);

  const staticLayersRef = useRef<any[]>([]);
  useEffect(() => {
    staticLayersRef.current = staticLayers;
  }, [staticLayers]);

  // ---- Animation loop: CURRENT / WIND flow particles + risk pulse ----
  // The only layers rebuilt every frame; everything else is read from
  // staticLayersRef (kept in sync by the effect above) so this loop never
  // needs to restart when selection/toggles change.
  useEffect(() => {
    if (!ready) return;
    let rafId: number;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const curP = currentParticlesRef.current!.step(dt);
      const windP = windParticlesRef.current!.step(dt);
      const phase = t / 500;
      const al = activeLayersRef.current;

      const animatedLayers: any[] = [
        new PathLayer({
          id: 'current-particles',
          data: curP,
          visible: Boolean(al.currentVectors),
          getPath: (d: any) => d.trail,
          getColor: [55, 212, 255, 235],
          getWidth: 2,
          widthUnits: 'pixels',
          widthMinPixels: 1.5,
        }),
        new PathLayer({
          id: 'wind-particles',
          data: windP,
          visible: Boolean(al.windVectors),
          getPath: (d: any) => d.trail,
          getColor: [186, 158, 250, 220],
          getWidth: 1.7,
          widthUnits: 'pixels',
          widthMinPixels: 1.2,
        }),
      ];

      const emphasized = emphasizedVesselsRef.current;
      if (emphasized.length) {
        animatedLayers.push(
          new ScatterplotLayer({
            id: 'vessel-risk-pulse',
            data: emphasized,
            getPosition: (d: Vessel) => [d.longitude, d.latitude],
            radiusUnits: 'pixels',
            stroked: false,
            filled: true,
            getRadius: (d: Vessel) => {
              const tier = vesselRiskTier(d);
              const base = tier === 'CRITICAL' ? 16 : 12;
              // Deterministic per-vessel phase offset (from its own fixed
              // coordinates, not Math.random) so pulses don't all sync up.
              const pulse = (Math.sin(phase + d.longitude) + 1) / 2;
              return base + pulse * (tier === 'CRITICAL' ? 11 : 7);
            },
            getFillColor: (d: Vessel) => [...RISK_COLOR[vesselRiskTier(d)], 65],
            updateTriggers: { getRadius: [phase] },
          })
        );
      }

      overlayRef.current?.setProps({ layers: [...staticLayersRef.current, ...animatedLayers] });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ready]);

  if (styleLoadError) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 10,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div className="label-xs" style={{ color: 'var(--amber)' }}>
            MAP STYLE UNAVAILABLE
          </div>
          <div className="text-muted" style={{ maxWidth: 420, fontSize: 12 }}>
            Could not load the basemap style. Check your network connection, or set{' '}
            <code>VITE_MAP_STYLE_URL</code> in your <code>.env</code> file (see{' '}
            <code>.env.example</code>) to point at a different MapLibre-compatible style.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={containerRef} className="map-container" />
      {hover && (
        <div style={{ position: 'absolute', left: hover.x + 14, top: hover.y - 10, zIndex: 6, pointerEvents: 'none' }}>
          <VesselTooltip vessel={hover.vessel} />
        </div>
      )}
      <div className="map-telemetry-bl">
        <span>LOCK LOCUS</span>
        <span>
          CURSOR {cursorPos ? `${cursorPos.lat.toFixed(4)}°N ${cursorPos.lng.toFixed(4)}°E` : '—'}
        </span>
        <span>ZOOM {zoom.toFixed(1)}</span>
      </div>
    </>
  );
};
