import type { Incident, Vessel } from '@/types';
import { getTrajectoryForVessel } from '@/data/aisTrajectories';
import { forecastSnapshots } from '@/data/forecasts';

/** Absolute timestamp (ms) for a given hour offset relative to an incident's detection time. */
export function offsetToTimestamp(incident: Incident, offsetHours: number): number {
  return new Date(incident.detection.detectedUtc).getTime() + offsetHours * 3_600_000;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolates a vessel's AIS position at an arbitrary absolute time from its trajectory. */
export function interpolatedPosition(vessel: Vessel, atMs: number): { latitude: number; longitude: number; speedKn: number; courseDeg: number } {
  const trajectory = getTrajectoryForVessel(vessel.id);
  if (!trajectory || trajectory.points.length === 0) {
    return { latitude: vessel.latitude, longitude: vessel.longitude, speedKn: vessel.speedKn, courseDeg: vessel.courseDeg };
  }
  const points = trajectory.points;
  const times = points.map((p) => new Date(p.timestampUtc).getTime());

  if (atMs <= times[0]) {
    return { latitude: points[0].latitude, longitude: points[0].longitude, speedKn: points[0].speedKn, courseDeg: points[0].courseDeg };
  }
  if (atMs >= times[times.length - 1]) {
    const last = points[points.length - 1];
    return { latitude: last.latitude, longitude: last.longitude, speedKn: last.speedKn, courseDeg: last.courseDeg };
  }

  for (let i = 0; i < points.length - 1; i++) {
    if (atMs >= times[i] && atMs <= times[i + 1]) {
      const span = times[i + 1] - times[i];
      const t = span === 0 ? 0 : (atMs - times[i]) / span;
      return {
        latitude: lerp(points[i].latitude, points[i + 1].latitude, t),
        longitude: lerp(points[i].longitude, points[i + 1].longitude, t),
        speedKn: lerp(points[i].speedKn, points[i + 1].speedKn, t),
        courseDeg: Math.round(lerp(points[i].courseDeg, points[i + 1].courseDeg, t)),
      };
    }
  }
  const last = points[points.length - 1];
  return { latitude: last.latitude, longitude: last.longitude, speedKn: last.speedKn, courseDeg: last.courseDeg };
}

/** Scales a polygon ring outward/inward about a centroid by `factor` (1 = unchanged). */
function scaleRing(ring: [number, number][], centroid: { latitude: number; longitude: number }, factor: number): [number, number][] {
  return ring.map(([lng, lat]) => [
    centroid.longitude + (lng - centroid.longitude) * factor,
    centroid.latitude + (lat - centroid.latitude) * factor,
  ]);
}

/** Growth factor (relative to the T0 polygon) for a given offset, using the
 * release-window start (spill not yet visible) through forecast snapshots
 * (T+6/12/24H) as anchor points. Purely a visualization aid — not a physics
 * simulation — but driven entirely by existing incident/forecast data. */
function growthFactor(incident: Incident, offsetHours: number): number {
  const releaseStartMs = new Date(incident.hindcast.estimatedReleaseStartUtc).getTime();
  const t0Ms = new Date(incident.detection.detectedUtc).getTime();
  const atMs = offsetToTimestamp(incident, offsetHours);

  if (atMs <= releaseStartMs) return 0;
  if (atMs < t0Ms) {
    const t = (atMs - releaseStartMs) / Math.max(t0Ms - releaseStartMs, 1);
    return Math.max(0.05, t); // spill visibly growing pre-detection
  }

  const snaps = forecastSnapshots
    .filter((f) => f.incidentId === incident.id)
    .sort((a, b) => a.horizonHours - b.horizonHours);
  if (snaps.length === 0) return 1;

  const baseArea = incident.characteristics.areaKm2;
  const points = [{ horizonHours: 0, areaKm2: baseArea }, ...snaps.map((s) => ({ horizonHours: s.horizonHours, areaKm2: s.projectedAreaKm2 }))];

  if (offsetHours <= 0) return 1;
  for (let i = 0; i < points.length - 1; i++) {
    if (offsetHours >= points[i].horizonHours && offsetHours <= points[i + 1].horizonHours) {
      const span = points[i + 1].horizonHours - points[i].horizonHours;
      const t = span === 0 ? 0 : (offsetHours - points[i].horizonHours) / span;
      const area = lerp(points[i].areaKm2, points[i + 1].areaKm2, t);
      return Math.sqrt(area / baseArea); // area scales with the square of linear factor
    }
  }
  const lastArea = points[points.length - 1].areaKm2;
  return Math.sqrt(lastArea / baseArea);
}

export interface ReplaySnapshot {
  incident: Incident;
  vessels: Vessel[];
  spillVisible: boolean;
  originVisible: boolean;
  forecastVisible: boolean;
  impactVisible: boolean;
}

/** Builds a modified incident (scaled spill polygon) + vessel set (interpolated
 * positions) representing the world state at `offsetHours`, reusing the
 * existing TacticalMap renderer unchanged. */
export function buildReplaySnapshot(incident: Incident, vessels: Vessel[], offsetHours: number): ReplaySnapshot {
  const atMs = offsetToTimestamp(incident, offsetHours);
  const factor = growthFactor(incident, offsetHours);

  const scaledIncident: Incident = {
    ...incident,
    characteristics: {
      ...incident.characteristics,
      areaKm2: Math.round(incident.characteristics.areaKm2 * factor * factor * 10) / 10,
      polygon: { ring: scaleRing(incident.characteristics.polygon.ring, incident.characteristics.centroid, Math.max(factor, 0.001)) },
    },
  };

  const replayVessels = vessels.map((v) => {
    const pos = interpolatedPosition(v, atMs);
    return { ...v, latitude: pos.latitude, longitude: pos.longitude, speedKn: pos.speedKn, courseDeg: pos.courseDeg };
  });

  const releaseStartMs = new Date(incident.hindcast.estimatedReleaseStartUtc).getTime();
  const t0Ms = new Date(incident.detection.detectedUtc).getTime();

  return {
    incident: scaledIncident,
    vessels: replayVessels,
    spillVisible: atMs > releaseStartMs,
    originVisible: atMs >= releaseStartMs,
    forecastVisible: atMs >= t0Ms,
    impactVisible: offsetHours >= 6,
  };
}
