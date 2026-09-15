// NEERNETRA — deck.gl visualization adapters
//
// This file is the ONLY place that adapts existing NEERNETRA data
// (Vessel, Incident, MpaZone, OceanSample, WeatherSample — unchanged field
// names) into shapes deck.gl layers consume directly. It never mutates or
// renames the source data; it only reads it and produces derived
// rendering-only structures (icon atlases, centroids, particle positions).
//
//   Existing NEERNETRA Data → (this file / geo.ts) → deck.gl layer `data`

import type { Incident, MpaZone } from '@/types';
import type { OceanSample, WeatherSample } from '@/types/environment';

// ---------------------------------------------------------------------
// Vessel icon atlas (single alpha-mask triangle, tinted per-vessel via
// each IconLayer datum's getColor — avoids shipping an external sprite
// sheet or depending on a CDN).
// ---------------------------------------------------------------------
export interface IconAtlas {
  url: string;
  mapping: Record<string, { x: number; y: number; width: number; height: number; anchorY: number; mask: boolean }>;
}

function buildAtlasCanvas(): string {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  // A simple elongated vessel silhouette (bow pointing "up" / 0deg), drawn
  // as an opaque shape — used as an alpha mask so IconLayer's getColor
  // fully controls the rendered color per vessel (candidate/selected/risk).
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.06); // bow
  ctx.lineTo(size * 0.78, size * 0.62);
  ctx.lineTo(size * 0.66, size * 0.9);
  ctx.lineTo(size * 0.34, size * 0.9);
  ctx.lineTo(size * 0.22, size * 0.62);
  ctx.closePath();
  ctx.fill();
  return canvas.toDataURL();
}

let cachedAtlas: IconAtlas | null = null;
export function getVesselIconAtlas(): IconAtlas {
  if (cachedAtlas) return cachedAtlas;
  cachedAtlas = {
    url: buildAtlasCanvas(),
    mapping: {
      vessel: { x: 0, y: 0, width: 128, height: 128, anchorY: 115, mask: true },
    },
  };
  return cachedAtlas;
}

// ---------------------------------------------------------------------
// MPA label anchor points — simple vertex-average centroid (adequate for
// the small, roughly-convex demo polygons NEERNETRA currently ships;
// swap for a proper pole-of-inaccessibility algorithm if real MPA
// geometry gets more complex).
// ---------------------------------------------------------------------
export function mpaLabelPoints(zones: MpaZone[]): { id: string; name: string; position: [number, number] }[] {
  return zones.map((z) => {
    const n = z.ring.length;
    const sum = z.ring.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
    return { id: z.id, name: z.name, position: [sum[0] / n, sum[1] / n] };
  });
}

// ---------------------------------------------------------------------
// Backtracking path — probable origin → detected spill centroid, using
// only existing incident fields (hindcast.probableOriginPoint,
// characteristics.centroid). Rendered for the selected incident only.
// ---------------------------------------------------------------------
export interface BacktrackPath {
  incidentId: string;
  path: [number, number][];
}
export function backtrackPaths(incidents: Incident[]): BacktrackPath[] {
  return incidents.map((inc) => ({
    incidentId: inc.id,
    path: [
      [inc.hindcast.probableOriginPoint.longitude, inc.hindcast.probableOriginPoint.latitude],
      [inc.characteristics.centroid.longitude, inc.characteristics.centroid.latitude],
    ],
  }));
}

// ---------------------------------------------------------------------
// Animated flow-particle field for CURRENT / WIND.
//
// Each particle keeps a short trailing history of recent positions (a
// "comet tail"), not just its single most-recent step — a 1-frame segment
// (~16ms of travel) is sub-pixel at any usable zoom and reads as
// invisible, which is what made CURRENT/WIND effectively disappear.
// Rendered as a short PathLayer polyline per particle instead.
//
// `bounds` (if provided) constrains where particles are seeded/wrapped —
// pass a tight box around the active incident rather than the vector
// field's full multi-thousand-km extent, or the particles are too sparse
// per screen to read as a continuous field at a sensibly-zoomed camera.
//
// Seeding uses a fixed deterministic hash (NOT Math.random), so the same
// particle set/order is produced on every load; only their *animated
// position over elapsed time* changes.
// ---------------------------------------------------------------------
function deterministicUnit(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TRAIL_LENGTH = 6;

export interface FlowParticle {
  trail: [number, number][]; // oldest -> newest, fixed length
  age: number;
}

export interface FieldBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

export class FlowParticleField {
  private field: (OceanSample | WeatherSample)[];
  private bounds: FieldBounds;
  private maxAge: number;
  private speedScale: number;
  private seedBase: number;
  particles: FlowParticle[];

  constructor(
    field: (OceanSample | WeatherSample)[],
    count: number,
    seedBase: number,
    speedScale = 0.9,
    bounds?: FieldBounds
  ) {
    this.field = field;
    this.seedBase = seedBase;
    this.speedScale = speedScale;
    this.maxAge = 300;
    if (bounds) {
      this.bounds = bounds;
    } else {
      const lats = field.map((f) => f.latitude);
      const lngs = field.map((f) => f.longitude);
      this.bounds = {
        south: Math.min(...lats),
        north: Math.max(...lats),
        west: Math.min(...lngs),
        east: Math.max(...lngs),
      };
    }
    this.particles = Array.from({ length: count }, (_, i) => this.reseed(i));
  }

  private reseed(i: number): FlowParticle {
    const r1 = deterministicUnit(i * 12.9898 + this.seedBase);
    const r2 = deterministicUnit(i * 78.233 + this.seedBase + 11.7);
    const r3 = deterministicUnit(i * 37.719 + this.seedBase + 5.3);
    const lng = this.bounds.west + r1 * (this.bounds.east - this.bounds.west);
    const lat = this.bounds.south + r2 * (this.bounds.north - this.bounds.south);
    const trail: [number, number][] = Array.from({ length: TRAIL_LENGTH }, () => [lng, lat]);
    return { trail, age: Math.floor(r3 * this.maxAge) };
  }

  private nearestVector(lng: number, lat: number): OceanSample | WeatherSample {
    let best = this.field[0];
    let bestDist = Infinity;
    for (const v of this.field) {
      const dLng = v.longitude - lng;
      const dLat = v.latitude - lat;
      const d = dLng * dLng + dLat * dLat;
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    }
    return best;
  }

  step(dtSeconds: number): FlowParticle[] {
    const dt = Math.min(dtSeconds, 0.12); // clamp to avoid big jumps after a tab-switch stall
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const [curLng, curLat] = p.trail[p.trail.length - 1];
      const v = this.nearestVector(curLng, curLat);
      const dir = 'currentDirectionDeg' in v ? v.currentDirectionDeg : v.windDirectionDeg;
      const mag = 'currentSpeedKn' in v ? v.currentSpeedKn : v.windSpeedKt;
      const rad = (dir * Math.PI) / 180;
      const speed = this.speedScale * Math.min(mag / 10, 1.6);
      const nextLng = curLng + Math.sin(rad) * speed * dt;
      const nextLat = curLat + Math.cos(rad) * speed * dt;
      p.age += 1;
      if (
        p.age > this.maxAge ||
        nextLng < this.bounds.west ||
        nextLng > this.bounds.east ||
        nextLat < this.bounds.south ||
        nextLat > this.bounds.north
      ) {
        this.particles[i] = this.reseed(i);
      } else {
        p.trail.shift();
        p.trail.push([nextLng, nextLat]);
      }
    }
    return this.particles.slice(); // new array reference each call so deck.gl detects the update
  }
}
