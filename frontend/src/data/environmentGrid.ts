// NEERNETRA — Extended environment vector fields (DEMO / DUMMY DATA)
//
// src/data/ocean.ts and src/data/weather.ts hold a small cluster of *real*
// sample points around the Mumbai approaches (Phase 1 mock sensor output).
// That cluster is too sparse/localized to read as a current/wind "field"
// on the map, and the CURRENT and WIND layers need to cover the whole
// demonstration region (western Indian coast + Arabian Sea).
//
// This file deterministically EXTRAPOLATES a coarse lat/lng grid of vectors
// across that region from the existing sample points' average speed and
// direction, varying smoothly with position via fixed trigonometric
// functions of latitude/longitude (no Math.random — same output on every
// run/refresh, per NEERNETRA's dummy-data rules).
//
// isDemoOutput=true on every generated sample marks this explicitly as
// synthetic. Swap generateCurrentField()/generateWindField() for a real
// gridded ocean-current/wind API (e.g. CMEMS, ECMWF/NOAA GFS) later without
// touching TacticalMap.tsx — it only imports the two functions below.

import type { OceanSample, WeatherSample } from '@/types/environment';
import { oceanSamples } from './ocean';
import { weatherSamples } from './weather';

export interface DemoOceanSample extends OceanSample {
  isDemoOutput: true;
}
export interface DemoWeatherSample extends WeatherSample {
  isDemoOutput: true;
}

// Region bounding box covering all demo incident/vessel clusters
// (Gulf of Kutch, Mumbai approaches, Arabian Sea demo cluster, Kochi).
const REGION = { south: 8.0, north: 23.5, west: 61.5, east: 76.5 };
const GRID_STEP_DEG = 1.25;

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Deterministic smooth offset in [-1, 1] from lat/lng — stands in for
// spatial variation a real current/wind field would have, without any
// randomness.
function fieldWobble(lat: number, lng: number, phase: number): number {
  return Math.sin(lat * 0.6 + phase) * 0.5 + Math.cos(lng * 0.5 - phase) * 0.5;
}

export function generateCurrentField(): DemoOceanSample[] {
  const baseSpeed = average(oceanSamples.map((s) => s.currentSpeedKn));
  const baseDir = average(oceanSamples.map((s) => s.currentDirectionDeg));
  const baseSst = average(oceanSamples.map((s) => s.seaSurfaceTempC));
  const observedUtc = oceanSamples[0]?.observedUtc ?? new Date().toISOString();

  const out: DemoOceanSample[] = [];
  for (let lat = REGION.south; lat <= REGION.north; lat += GRID_STEP_DEG) {
    for (let lng = REGION.west; lng <= REGION.east; lng += GRID_STEP_DEG) {
      const wobble = fieldWobble(lat, lng, 0);
      out.push({
        latitude: Number(lat.toFixed(3)),
        longitude: Number(lng.toFixed(3)),
        currentSpeedKn: Number(Math.max(0.4, baseSpeed + wobble * 1.1).toFixed(2)),
        currentDirectionDeg: Math.round((baseDir + wobble * 35 + 360) % 360),
        seaSurfaceTempC: Number((baseSst + wobble * 0.8).toFixed(2)),
        observedUtc,
        isDemoOutput: true,
      });
    }
  }
  // Keep the real, denser Mumbai-approach samples too, so the highest
  // confidence data still anchors the field near the primary incident.
  return [...out, ...oceanSamples.map((s) => ({ ...s, isDemoOutput: true as const }))];
}

export function generateWindField(): DemoWeatherSample[] {
  const baseSpeed = average(weatherSamples.map((s) => s.windSpeedKt));
  const baseDir = average(weatherSamples.map((s) => s.windDirectionDeg));
  const observedUtc = weatherSamples[0]?.observedUtc ?? new Date().toISOString();

  const out: DemoWeatherSample[] = [];
  for (let lat = REGION.south; lat <= REGION.north; lat += GRID_STEP_DEG) {
    for (let lng = REGION.west; lng <= REGION.east; lng += GRID_STEP_DEG) {
      // Different phase from the current field so WIND is visibly not
      // identical to CURRENT even where both layers are on.
      const wobble = fieldWobble(lat, lng, 1.7);
      out.push({
        latitude: Number(lat.toFixed(3)),
        longitude: Number(lng.toFixed(3)),
        windSpeedKt: Number(Math.max(2, baseSpeed + wobble * 4.5).toFixed(2)),
        windDirectionDeg: Math.round((baseDir + wobble * 50 + 360) % 360),
        observedUtc,
        isDemoOutput: true,
      });
    }
  }
  return [...out, ...weatherSamples.map((s) => ({ ...s, isDemoOutput: true as const }))];
}
