import type {
  Incident,
  Vessel,
  AisTrajectory,
  FishingZone,
  MpaZone,
  SatelliteFootprint,
  DarkContact,
} from '@/types';
import type { OceanSample, WeatherSample } from '@/types/environment';
import type { CoastlineSegment } from '@/data/coastlineDemo';

export type FC = GeoJSON.FeatureCollection;

export function spillPolygonsToFC(incidents: Incident[]): FC {
  return {
    type: 'FeatureCollection',
    features: incidents.map((inc) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [inc.characteristics.polygon.ring] },
      properties: {
        incidentId: inc.id,
        severity: inc.characteristics.severity,
        confidence: inc.characteristics.confidencePct,
        headline: inc.headline,
      },
    })),
  };
}

// Drift boundary: Phase 1 renders a slightly expanded outline of the spill
// polygon as a dashed forecast-adjacent boundary (mock — Phase 2/3 will
// replace with true drift-model output).
export function driftBoundaryToFC(incidents: Incident[]): FC {
  return {
    type: 'FeatureCollection',
    features: incidents.map((inc) => {
      const centroid = inc.characteristics.centroid;
      const expanded = inc.characteristics.polygon.ring.map(([lng, lat]) => {
        const dx = (lng - centroid.longitude) * 1.35;
        const dy = (lat - centroid.latitude) * 1.35;
        return [centroid.longitude + dx, centroid.latitude + dy];
      });
      return {
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [expanded] },
        properties: { incidentId: inc.id },
      };
    }),
  };
}

export function vesselPointsToFC(vesselList: Vessel[]): FC {
  return {
    type: 'FeatureCollection',
    features: vesselList.map((v) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [v.longitude, v.latitude] },
      properties: {
        vesselId: v.id,
        name: v.name,
        type: v.type,
        course: v.courseDeg,
        isCandidate: Boolean(v.intelligence),
        associationStatus: v.intelligence?.investigativeStatus ?? null,
      },
    })),
  };
}

export function trajectoriesToFC(trajectories: AisTrajectory[]): FC {
  return {
    type: 'FeatureCollection',
    features: trajectories
      .filter((t) => t.points.length > 1)
      .map((t) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: t.points.map((p) => [p.longitude, p.latitude]),
        },
        properties: { vesselId: t.vesselId, vesselName: t.vesselName },
      })),
  };
}

export function fishingZonesToFC(zones: FishingZone[]): FC {
  return {
    type: 'FeatureCollection',
    features: zones.map((z) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [z.ring] },
      properties: { id: z.id, name: z.name, activityLevel: z.activityLevel },
    })),
  };
}

export function mpasToFC(zones: MpaZone[]): FC {
  return {
    type: 'FeatureCollection',
    features: zones.map((z) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [z.ring] },
      properties: { id: z.id, name: z.name, designation: z.designation },
    })),
  };
}

export function satelliteFootprintsToFC(footprints: SatelliteFootprint[]): FC {
  return {
    type: 'FeatureCollection',
    features: footprints.map((f) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [f.ring] },
      properties: { id: f.id, satellite: f.satellite, acquired: f.acquisitionUtc },
    })),
  };
}

function bearingOffset(lat: number, lng: number, bearingDeg: number, distanceDeg: number) {
  const rad = (bearingDeg * Math.PI) / 180;
  return [lng + Math.sin(rad) * distanceDeg, lat + Math.cos(rad) * distanceDeg];
}

export function vectorFieldToFC(vectors: (OceanSample | WeatherSample)[], scale = 0.045): FC {
  return {
    type: 'FeatureCollection',
    features: vectors.map((v, i) => {
      const dir = 'currentDirectionDeg' in v ? v.currentDirectionDeg : v.windDirectionDeg;
      const mag = 'currentSpeedKn' in v ? v.currentSpeedKn : v.windSpeedKt;
      const [toLng, toLat] = bearingOffset(v.latitude, v.longitude, dir, scale * Math.min(mag / 8, 1.6));
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [v.longitude, v.latitude],
            [toLng, toLat],
          ],
        },
        properties: { id: i, magnitude: mag, direction: dir },
      };
    }),
  };
}

export function darkContactsToFC(contacts: DarkContact[]): FC {
  return {
    type: 'FeatureCollection',
    features: contacts.map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
      properties: { contactId: c.contactId, status: c.status, priority: c.priority },
    })),
  };
}

export function originPointsToFC(incidents: Incident[]): FC {
  return {
    type: 'FeatureCollection',
    features: incidents.map((inc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [inc.hindcast.probableOriginPoint.longitude, inc.hindcast.probableOriginPoint.latitude],
      },
      properties: { incidentId: inc.id, confidence: inc.hindcast.confidencePct },
    })),
  };
}

// --- Detection point (distinct from hindcast origin point in originPointsToFC) ---
// Represents where the spill was first flagged by the satellite detection
// pass (SpillCharacteristics.centroid), as opposed to the hindcast model's
// probable *origin/source* point — the two are kept as separate layers so a
// spill's "seen here" and "likely started here" markers don't collide.
export function detectionPointsToFC(incidents: Incident[]): FC {
  return {
    type: 'FeatureCollection',
    features: incidents.map((inc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [inc.characteristics.centroid.longitude, inc.characteristics.centroid.latitude],
      },
      properties: {
        incidentId: inc.id,
        satellite: inc.detection.satellite,
        confidence: inc.detection.confidencePct,
        detectedUtc: inc.detection.detectedUtc,
      },
    })),
  };
}

// --- Coastline reference layer ---
export function coastlineToFC(segments: CoastlineSegment[]): FC {
  return {
    type: 'FeatureCollection',
    features: segments.map((seg) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: seg.line },
      properties: { id: seg.id, name: seg.name, isDemoOutput: seg.isDemoOutput },
    })),
  };
}

function bearingPoint(lat: number, lng: number, bearingDeg: number, distanceDeg: number): [number, number] {
  const rad = (bearingDeg * Math.PI) / 180;
  return [lng + Math.sin(rad) * distanceDeg, lat + Math.cos(rad) * distanceDeg];
}

// --- Arrowhead triangles for a vector field (current / wind) ---
// MapLibre line layers alone read as flat segments; a small filled triangle
// at each vector's tip, oriented along its bearing, is what actually reads
// as "an arrow" at a glance. Kept as its own polygon FeatureCollection so it
// can be styled (color/opacity) independently from the shaft line.
export function vectorArrowheadsToFC(vectors: (OceanSample | WeatherSample)[], scale = 0.045): FC {
  return {
    type: 'FeatureCollection',
    features: vectors.map((v, i) => {
      const dir = 'currentDirectionDeg' in v ? v.currentDirectionDeg : v.windDirectionDeg;
      const mag = 'currentSpeedKn' in v ? v.currentSpeedKn : v.windSpeedKt;
      const len = scale * Math.min(mag / 8, 1.6);
      const [tipLng, tipLat] = bearingPoint(v.latitude, v.longitude, dir, len);
      const headSize = Math.max(len * 0.32, 0.006);
      const left = bearingPoint(tipLat, tipLng, dir + 152, headSize);
      const right = bearingPoint(tipLat, tipLng, dir - 152, headSize);
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[tipLng, tipLat], left, right, [tipLng, tipLat]]],
        },
        properties: { id: i, magnitude: mag, direction: dir },
      };
    }),
  };
}

// --- Aggregated route-density corridors (distinct from raw per-vessel AIS tracks) ---
// Buckets every trajectory segment's midpoint into a coarse lat/lng grid and
// counts how many *different vessels'* segments fall in each cell. Each
// output segment carries that cell's vessel count as `density`, so the
// paint layer can render busier corridors thicker/brighter than lightly
// used ones — an aggregated "shipping corridor" read, rather than just
// redrawing the individual AIS tracks.
export function routeDensityToFC(trajectories: AisTrajectory[], cellDeg = 0.35): FC {
  const cellVessels = new Map<string, Set<string>>();
  const cellKey = (lat: number, lng: number) =>
    `${Math.round(lat / cellDeg)}:${Math.round(lng / cellDeg)}`;

  trajectories.forEach((t) => {
    for (let i = 0; i < t.points.length - 1; i++) {
      const a = t.points[i];
      const b = t.points[i + 1];
      const key = cellKey((a.latitude + b.latitude) / 2, (a.longitude + b.longitude) / 2);
      if (!cellVessels.has(key)) cellVessels.set(key, new Set());
      cellVessels.get(key)!.add(t.vesselId);
    }
  });

  const features: GeoJSON.Feature[] = [];
  trajectories.forEach((t) => {
    for (let i = 0; i < t.points.length - 1; i++) {
      const a = t.points[i];
      const b = t.points[i + 1];
      const key = cellKey((a.latitude + b.latitude) / 2, (a.longitude + b.longitude) / 2);
      const density = cellVessels.get(key)?.size ?? 1;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [a.longitude, a.latitude],
            [b.longitude, b.latitude],
          ],
        },
        properties: { vesselId: t.vesselId, density },
      });
    }
  });

  return { type: 'FeatureCollection', features };
}

// --- Directional arrowheads along AIS trajectories ---
// A small filled triangle at the most recent point of each trajectory,
// oriented along the bearing of travel, so AIS TRACKS reads as "vessel
// moving this way" rather than a static line (matches vectorArrowheadsToFC's
// approach so both layers share the same visual language). `vesselId` is
// carried through unchanged so selection/candidate paint expressions can
// key off it exactly like ais-tracks-line does.
export function trajectoryArrowheadsToFC(trajectories: AisTrajectory[]): FC {
  return {
    type: 'FeatureCollection',
    features: trajectories
      .filter((t) => t.points.length > 1)
      .map((t) => {
        const last = t.points[t.points.length - 1];
        const prev = t.points[t.points.length - 2];
        const dLng = last.longitude - prev.longitude;
        const dLat = last.latitude - prev.latitude;
        const bearing = (Math.atan2(dLng, dLat) * 180) / Math.PI;
        const headSize = 0.018;
        const left = bearingPoint(last.latitude, last.longitude, bearing + 150, headSize);
        const right = bearingPoint(last.latitude, last.longitude, bearing - 150, headSize);
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[last.longitude, last.latitude], left, right, [last.longitude, last.latitude]]],
          },
          properties: { vesselId: t.vesselId, vesselName: t.vesselName, bearing: (bearing + 360) % 360 },
        };
      }),
  };
}

// --- Initial-camera framing: bounds around one incident + nearby vessels ---
// Used so the map opens focused on the active spill (per NEERNETRA's
// tactical framing requirement) instead of a wide, mostly-empty ocean view
// where the spill/vessels render as imperceptible specks.
export function sceneBounds(
  incident: Incident,
  vessels: Vessel[],
  radiusDeg = 0.6,
  padDeg = 0.15
): [[number, number], [number, number]] {
  const pts: [number, number][] = [
    [incident.characteristics.centroid.longitude, incident.characteristics.centroid.latitude],
    [incident.hindcast.probableOriginPoint.longitude, incident.hindcast.probableOriginPoint.latitude],
    ...incident.characteristics.polygon.ring,
  ];
  vessels.forEach((v) => {
    const d = Math.hypot(
      v.longitude - incident.characteristics.centroid.longitude,
      v.latitude - incident.characteristics.centroid.latitude
    );
    if (d <= radiusDeg) pts.push([v.longitude, v.latitude]);
  });
  const lngs = pts.map((p) => p[0]);
  const lats = pts.map((p) => p[1]);
  return [
    [Math.min(...lngs) - padDeg, Math.min(...lats) - padDeg],
    [Math.max(...lngs) + padDeg, Math.max(...lats) + padDeg],
  ];
}

// Simple geodesic-ish circle polygon for search-radius / release-zone rendering.
export function circlePolygon(lat: number, lng: number, radiusKm: number, points = 48): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusKm / 110.57;
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([lng + distanceX * Math.cos(theta), lat + distanceY * Math.sin(theta)]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}
