import type { MpaZone } from '@/types';

export const mpas: MpaZone[] = [
  {
    id: 'mpa-malvan',
    name: 'Malvan Marine Sanctuary',
    designation: 'State Marine Sanctuary',
    ring: [
      [73.440, 16.020], [73.480, 16.025], [73.485, 16.060], [73.450, 16.070],
      [73.420, 16.050], [73.425, 16.030], [73.440, 16.020],
    ],
  },
  {
    id: 'mpa-kutch',
    name: 'Gulf of Kutch Marine National Park',
    designation: 'National Marine Park',
    ring: [
      [69.550, 22.450], [69.620, 22.460], [69.630, 22.510], [69.570, 22.520],
      [69.520, 22.495], [69.530, 22.460], [69.550, 22.450],
    ],
  },
  {
    // NOTE: the two MPAs above (Malvan, Kutch) are ~300km from the primary
    // demo incident (NEER-001, Mumbai approaches) and never appear in that
    // scene's framed camera. This entry is a demonstration-only coastal
    // buffer zone placed near Mumbai so the MPA layer has something to show
    // in the default demo viewport — same shape/fields as the real entries
    // above, easy to remove once real MPA coverage near Mumbai is sourced.
    id: 'mpa-mumbai-buffer-demo',
    name: 'Thane Creek Coastal Buffer Zone (Demonstration)',
    designation: 'Proposed Coastal Buffer',
    ring: [
      [72.900, 19.190], [72.955, 19.205], [72.965, 19.250], [72.925, 19.270],
      [72.880, 19.250], [72.875, 19.210], [72.900, 19.190],
    ],
  },
];
