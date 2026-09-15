import type { FishingZone } from '@/types';

export const fishingZones: FishingZone[] = [
  {
    id: 'fz-versova',
    name: 'Versova Traditional Fishing Grounds',
    activityLevel: 'HIGH',
    ring: [
      [72.760, 19.150], [72.800, 19.155], [72.810, 19.190], [72.775, 19.205],
      [72.745, 19.190], [72.750, 19.160], [72.760, 19.150],
    ],
  },
  {
    id: 'fz-thal',
    name: 'Thal Coastal Fishery Zone',
    activityLevel: 'MODERATE',
    ring: [
      [72.680, 18.960], [72.715, 18.965], [72.720, 18.995], [72.690, 19.005],
      [72.665, 18.990], [72.670, 18.965], [72.680, 18.960],
    ],
  },
  {
    id: 'fz-fujairah',
    name: 'Fujairah Coastal Fishery Zone',
    activityLevel: 'MODERATE',
    ring: [
      [63.150, 20.600], [63.190, 20.605], [63.195, 20.635], [63.160, 20.645],
      [63.130, 20.628], [63.135, 20.605], [63.150, 20.600],
    ],
  },
  {
    id: 'fz-kochi',
    name: 'Kochi Offshore Fishery Zone',
    activityLevel: 'LOW',
    ring: [
      [75.870, 9.700], [75.910, 9.705], [75.915, 9.740], [75.880, 9.750],
      [75.855, 9.730], [75.860, 9.708], [75.870, 9.700],
    ],
  },
];
