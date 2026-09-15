import type { SatelliteFootprint } from '@/types';

export const satelliteFootprints: SatelliteFootprint[] = [
  {
    id: 'sf-1',
    satellite: 'Sentinel-1',
    acquisitionUtc: '2026-09-13T08:02:18Z',
    centroid: { latitude: 19.09, longitude: 72.73 },
    ring: [
      [72.55, 18.90], [72.95, 18.90], [72.95, 19.28], [72.55, 19.28], [72.55, 18.90],
    ],
  },
  {
    id: 'sf-2',
    satellite: 'Sentinel-1',
    acquisitionUtc: '2026-09-12T22:36:41Z',
    centroid: { latitude: 20.65, longitude: 63.23 },
    ring: [
      [63.05, 20.47], [63.41, 20.47], [63.41, 20.83], [63.05, 20.83], [63.05, 20.47],
    ],
  },
  {
    id: 'sf-3',
    satellite: 'Sentinel-2',
    acquisitionUtc: '2026-09-10T05:01:09Z',
    centroid: { latitude: 22.61, longitude: 69.69 },
    ring: [
      [69.55, 22.51], [69.83, 22.51], [69.83, 22.71], [69.55, 22.71], [69.55, 22.51],
    ],
  },
];
