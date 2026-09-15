import type { OceanSample } from '@/types';

// Coarse grid of current/SST samples around the Mumbai approaches used to
// draw the Overview / Investigation current-vector layer in Phase 1.
export const oceanSamples: OceanSample[] = [
  { latitude: 18.95, longitude: 72.60, currentSpeedKn: 1.8, currentDirectionDeg: 80, seaSurfaceTempC: 22.1, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 19.00, longitude: 72.70, currentSpeedKn: 2.0, currentDirectionDeg: 82, seaSurfaceTempC: 22.2, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 19.05, longitude: 72.75, currentSpeedKn: 2.2, currentDirectionDeg: 85, seaSurfaceTempC: 22.4, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 19.10, longitude: 72.80, currentSpeedKn: 2.3, currentDirectionDeg: 87, seaSurfaceTempC: 22.5, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 19.15, longitude: 72.85, currentSpeedKn: 2.1, currentDirectionDeg: 88, seaSurfaceTempC: 22.6, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 19.00, longitude: 72.85, currentSpeedKn: 2.0, currentDirectionDeg: 84, seaSurfaceTempC: 22.3, observedUtc: '2026-09-13T08:00:00Z' },
  { latitude: 18.90, longitude: 72.75, currentSpeedKn: 1.7, currentDirectionDeg: 79, seaSurfaceTempC: 22.0, observedUtc: '2026-09-13T08:00:00Z' },
];
