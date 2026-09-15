// NEERNETRA — Coastline reference layer (DEMO / DUMMY DATA)
//
// The base map style already renders land/water, but NEERNETRA overlays a
// dedicated, strongly-styled coastline layer so the coast reads clearly at
// tactical zoom levels regardless of which basemap/style provider is
// configured (see VITE_MAP_STYLE_URL).
//
// IMPORTANT: the coordinates below are a HAND-SIMPLIFIED, approximate trace
// of the western Indian coastline (Gulf of Kutch → Kanyakumari) and the
// Gulf of Oman / UAE coast near Fujairah — good enough for tactical/demo
// cartography, NOT survey-grade or navigation-grade geometry. Replace with
// a real coastline dataset (e.g. Natural Earth 10m coastline, GSHHG, or a
// national hydrographic office source) before any operational use. Each
// segment is centralized here as its own named entry, so swapping in real
// geometry later requires touching only this file.
export interface CoastlineSegment {
  id: string;
  name: string;
  isDemoOutput: true;
  line: [number, number][]; // [lng, lat]
}

export const coastlineSegments: CoastlineSegment[] = [
  {
    id: 'coast-in-west',
    name: 'India — West Coast (Kutch to Kanyakumari)',
    isDemoOutput: true,
    line: [
      [68.98, 23.55], [69.10, 23.15], [69.35, 22.75], [69.65, 22.48], [69.98, 22.47],
      [70.25, 22.28], [70.47, 21.85], [70.75, 21.42], [71.05, 21.02], [71.45, 20.82],
      [71.98, 20.80], [72.20, 21.18], [72.35, 21.55], [72.62, 21.75], [72.78, 21.35],
      [72.75, 20.85], [72.72, 20.35], [72.90, 19.98], [72.85, 19.55], [72.82, 19.20],
      [72.79, 18.95], [72.85, 18.55], [73.05, 18.10], [73.12, 17.68], [73.18, 17.10],
      [73.28, 16.60], [73.32, 16.02], [73.55, 15.55], [73.80, 15.25], [74.12, 14.85],
      [74.30, 14.40], [74.35, 13.95], [74.62, 13.35], [74.80, 12.90], [74.95, 12.50],
      [75.20, 11.98], [75.38, 11.55], [75.48, 11.10], [75.70, 10.60], [75.90, 10.15],
      [76.02, 9.78], [76.20, 9.45], [76.35, 9.05], [76.65, 8.60], [77.05, 8.20],
      [77.30, 8.08], [77.55, 8.05],
    ],
  },
  {
    // NOTE: NEERNETRA's existing mock data (fisheries.ts "fz-fujairah",
    // satellite.ts "sf-2", incidents.ts NEER-002) already places the
    // "Fujairah" demo cluster at ~63°E/20.7°N — offshore in the Arabian
    // Sea, not the real Fujairah (~56.3°E/25.1°N). This coastline segment
    // intentionally follows that pre-existing fictional demo location so
    // the reference layers stay visually consistent with the rest of the
    // app's mock geography, rather than introducing a mismatched real
    // coastline far from where the other demo layers are drawn.
    id: 'coast-arabian-sea-demo',
    name: 'Arabian Sea Coast Reference (demo cluster)',
    isDemoOutput: true,
    line: [
      [62.70, 21.20], [62.90, 21.00], [63.05, 20.85], [63.10, 20.68], [63.05, 20.50],
      [62.95, 20.32], [62.85, 20.12],
    ],
  },
];
