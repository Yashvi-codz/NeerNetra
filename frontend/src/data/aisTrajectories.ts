import type { AisTrajectory } from '@/types';

// Trajectories are hand-authored to stay directionally consistent with each
// vessel's current course/speed in vessels.ts, including the documented AIS
// gap and speed/course change events for MV OCEAN STAR (NEER-001 lead).

export const aisTrajectories: AisTrajectory[] = [
  {
    vesselId: 'v-ocean-star',
    vesselName: 'MV OCEAN STAR',
    points: [
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T00:00:00Z', latitude: 19.2205, longitude: 73.0402, speedKn: 13.6, courseDeg: 251, headingDeg: 251 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T01:00:00Z', latitude: 19.1602, longitude: 72.9601, speedKn: 13.8, courseDeg: 251, headingDeg: 251 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T02:00:00Z', latitude: 19.1101, longitude: 72.8955, speedKn: 13.8, courseDeg: 251, headingDeg: 251 },
      // --- AIS gap begins 02:10, 165 minutes ---
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T02:10:00Z', latitude: 19.1032, longitude: 72.8865, speedKn: 6.2, courseDeg: 238, headingDeg: 238 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T04:55:00Z', latitude: 19.0781, longitude: 72.8391, speedKn: 6.9, courseDeg: 238, headingDeg: 238 },
      // --- AIS gap ends, speed recovers ---
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T05:02:00Z', latitude: 19.0764, longitude: 72.8362, speedKn: 13.1, courseDeg: 245, headingDeg: 245 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T06:00:00Z', latitude: 19.0705, longitude: 72.8154, speedKn: 12.9, courseDeg: 245, headingDeg: 246 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T09:00:00Z', latitude: 19.0611, longitude: 72.7902, speedKn: 12.6, courseDeg: 245, headingDeg: 246 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T12:00:00Z', latitude: 19.0559, longitude: 72.7742, speedKn: 12.5, courseDeg: 245, headingDeg: 247 },
      { vesselId: 'v-ocean-star', timestampUtc: '2026-09-13T14:30:00Z', latitude: 19.0512, longitude: 72.7601, speedKn: 12.4, courseDeg: 245, headingDeg: 247 },
    ],
  },
  {
    vesselId: 'v-pacific-voyager',
    vesselName: 'PACIFIC VOYAGER',
    points: [
      { vesselId: 'v-pacific-voyager', timestampUtc: '2026-09-13T08:00:00Z', latitude: 19.3402, longitude: 73.1301, speedKn: 13.6, courseDeg: 245, headingDeg: 245 },
      { vesselId: 'v-pacific-voyager', timestampUtc: '2026-09-13T09:00:00Z', latitude: 19.3011, longitude: 73.0512, speedKn: 13.6, courseDeg: 245, headingDeg: 244 },
      { vesselId: 'v-pacific-voyager', timestampUtc: '2026-09-13T11:00:00Z', latitude: 19.2205, longitude: 72.9421, speedKn: 14.0, courseDeg: 245, headingDeg: 244 },
      { vesselId: 'v-pacific-voyager', timestampUtc: '2026-09-13T13:00:00Z', latitude: 19.1902, longitude: 72.8801, speedKn: 14.1, courseDeg: 245, headingDeg: 244 },
      { vesselId: 'v-pacific-voyager', timestampUtc: '2026-09-13T14:28:00Z', latitude: 19.1622, longitude: 72.8410, speedKn: 14.2, courseDeg: 245, headingDeg: 244 },
    ],
  },
  {
    vesselId: 'v-horizon-9',
    vesselName: 'HORIZON 9',
    points: [
      { vesselId: 'v-horizon-9', timestampUtc: '2026-09-13T10:00:00Z', latitude: 19.1401, longitude: 72.7702, speedKn: 9.4, courseDeg: 198, headingDeg: 198 },
      { vesselId: 'v-horizon-9', timestampUtc: '2026-09-13T12:00:00Z', latitude: 19.0522, longitude: 72.7012, speedKn: 9.6, courseDeg: 198, headingDeg: 199 },
      { vesselId: 'v-horizon-9', timestampUtc: '2026-09-13T14:31:00Z', latitude: 18.9781, longitude: 72.6203, speedKn: 9.7, courseDeg: 198, headingDeg: 199 },
    ],
  },
  {
    vesselId: 'v-crimson-tide',
    vesselName: 'CRIMSON TIDE',
    points: [
      { vesselId: 'v-crimson-tide', timestampUtc: '2026-09-13T08:00:00Z', latitude: 20.8801, longitude: 63.6602, speedKn: 11.4, courseDeg: 287, headingDeg: 287 },
      { vesselId: 'v-crimson-tide', timestampUtc: '2026-09-13T11:00:00Z', latitude: 20.7402, longitude: 63.3801, speedKn: 11.2, courseDeg: 301, headingDeg: 300 },
      { vesselId: 'v-crimson-tide', timestampUtc: '2026-09-13T13:55:00Z', latitude: 20.6103, longitude: 63.1187, speedKn: 11.1, courseDeg: 301, headingDeg: 300 },
    ],
  },
  {
    vesselId: 'v-arabian-mist',
    vesselName: 'ARABIAN MIST',
    points: [
      { vesselId: 'v-arabian-mist', timestampUtc: '2026-09-13T04:00:00Z', latitude: 19.1602, longitude: 72.6801, speedKn: 12.0, courseDeg: 248, headingDeg: 248 },
      { vesselId: 'v-arabian-mist', timestampUtc: '2026-09-13T07:00:00Z', latitude: 19.0995, longitude: 72.7301, speedKn: 11.9, courseDeg: 249, headingDeg: 250 },
      { vesselId: 'v-arabian-mist', timestampUtc: '2026-09-13T10:00:00Z', latitude: 19.0602, longitude: 72.7602, speedKn: 11.8, courseDeg: 250, headingDeg: 251 },
      { vesselId: 'v-arabian-mist', timestampUtc: '2026-09-13T14:29:00Z', latitude: 19.0290, longitude: 72.7890, speedKn: 11.8, courseDeg: 250, headingDeg: 251 },
    ],
  },
  {
    vesselId: 'v-silver-wake',
    vesselName: 'SILVER WAKE',
    points: [
      { vesselId: 'v-silver-wake', timestampUtc: '2026-09-13T02:00:00Z', latitude: 19.3401, longitude: 72.5602, speedKn: 12.4, courseDeg: 224, headingDeg: 224 },
      { vesselId: 'v-silver-wake', timestampUtc: '2026-09-13T03:20:00Z', latitude: 19.2601, longitude: 72.6201, speedKn: 9.8, courseDeg: 210, headingDeg: 211 },
      { vesselId: 'v-silver-wake', timestampUtc: '2026-09-13T07:00:00Z', latitude: 19.2001, longitude: 72.6602, speedKn: 9.9, courseDeg: 210, headingDeg: 211 },
      { vesselId: 'v-silver-wake', timestampUtc: '2026-09-13T11:00:00Z', latitude: 19.1601, longitude: 72.6801, speedKn: 9.9, courseDeg: 210, headingDeg: 211 },
      { vesselId: 'v-silver-wake', timestampUtc: '2026-09-13T14:27:00Z', latitude: 19.1305, longitude: 72.7005, speedKn: 9.9, courseDeg: 210, headingDeg: 211 },
    ],
  },
  {
    vesselId: 'v-blue-current',
    vesselName: 'BLUE CURRENT',
    points: [
      { vesselId: 'v-blue-current', timestampUtc: '2026-09-13T06:00:00Z', latitude: 19.0602, longitude: 72.8402, speedKn: 13.4, courseDeg: 190, headingDeg: 190 },
      { vesselId: 'v-blue-current', timestampUtc: '2026-09-13T09:00:00Z', latitude: 18.9601, longitude: 72.7502, speedKn: 13.3, courseDeg: 190, headingDeg: 189 },
      { vesselId: 'v-blue-current', timestampUtc: '2026-09-13T12:00:00Z', latitude: 18.8901, longitude: 72.6702, speedKn: 13.3, courseDeg: 190, headingDeg: 189 },
      { vesselId: 'v-blue-current', timestampUtc: '2026-09-13T14:24:00Z', latitude: 18.8402, longitude: 72.6011, speedKn: 13.3, courseDeg: 190, headingDeg: 189 },
    ],
  },
  {
    vesselId: 'v-monarch-wave',
    vesselName: 'MONARCH WAVE',
    points: [
      { vesselId: 'v-monarch-wave', timestampUtc: '2026-09-12T18:00:00Z', latitude: 20.7901, longitude: 63.7602, speedKn: 12.6, courseDeg: 288, headingDeg: 288 },
      { vesselId: 'v-monarch-wave', timestampUtc: '2026-09-12T19:40:00Z', latitude: 20.7602, longitude: 63.5602, speedKn: 12.1, courseDeg: 288, headingDeg: 288 },
      { vesselId: 'v-monarch-wave', timestampUtc: '2026-09-12T20:55:00Z', latitude: 20.7401, longitude: 63.4201, speedKn: 12.5, courseDeg: 288, headingDeg: 287 },
      { vesselId: 'v-monarch-wave', timestampUtc: '2026-09-13T13:58:00Z', latitude: 20.7205, longitude: 63.3011, speedKn: 12.7, courseDeg: 288, headingDeg: 287 },
    ],
  },
];

export const getTrajectoryForVessel = (vesselId: string): AisTrajectory | undefined =>
  aisTrajectories.find((t) => t.vesselId === vesselId);
