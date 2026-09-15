// NEERNETRA — spill drift forecast placeholders (Phase 1 data shell).
// Phase 3 wires this to a live forecast/hindcast service.

export interface ForecastSnapshot {
  incidentId: string;
  horizonHours: number;
  projectedAreaKm2: number;
  projectedCentroid: { latitude: number; longitude: number };
  confidencePct: number;
  isDemoOutput: true;
}

export const forecastSnapshots: ForecastSnapshot[] = [
  { incidentId: 'NEER-001', horizonHours: 6, projectedAreaKm2: 14.8, projectedCentroid: { latitude: 19.092, longitude: 72.741 }, confidencePct: 72, isDemoOutput: true },
  { incidentId: 'NEER-001', horizonHours: 12, projectedAreaKm2: 17.1, projectedCentroid: { latitude: 19.101, longitude: 72.752 }, confidencePct: 61, isDemoOutput: true },
  { incidentId: 'NEER-001', horizonHours: 24, projectedAreaKm2: 21.6, projectedCentroid: { latitude: 19.118, longitude: 72.769 }, confidencePct: 47, isDemoOutput: true },
];
