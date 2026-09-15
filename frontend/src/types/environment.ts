// NEERNETRA — Environmental & contextual layer data models

export interface CurrentVector {
  latitude: number;
  longitude: number;
  speedKn: number;
  directionDeg: number;
}

export interface WindVector {
  latitude: number;
  longitude: number;
  speedKt: number;
  directionDeg: number;
}

export interface FishingZone {
  id: string;
  name: string;
  ring: [number, number][];
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface MpaZone {
  id: string;
  name: string;
  designation: string;
  ring: [number, number][];
}

export interface SatelliteFootprint {
  id: string;
  satellite: 'Sentinel-1' | 'Sentinel-2' | 'Landsat-8/9';
  acquisitionUtc: string;
  ring: [number, number][];
  centroid: { latitude: number; longitude: number };
}

export interface WeatherSample {
  latitude: number;
  longitude: number;
  windSpeedKt: number;
  windDirectionDeg: number;
  observedUtc: string;
}

export interface OceanSample {
  latitude: number;
  longitude: number;
  currentSpeedKn: number;
  currentDirectionDeg: number;
  seaSurfaceTempC: number;
  observedUtc: string;
}
