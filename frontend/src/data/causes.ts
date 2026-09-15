// NEERNETRA — probable-cause taxonomy used across Intelligence charts.
// Investigative language only; never asserts guilt. See docs/ARCHITECTURE.md.

export interface CauseDistributionEntry {
  cause: string;
  incidentCount: number;
  shareOfTotalPct: number;
}

export const causeDistribution: CauseDistributionEntry[] = [
  { cause: 'Vessel discharge (suspected)', incidentCount: 1, shareOfTotalPct: 25 },
  { cause: 'Bilge discharge (suspected)', incidentCount: 1, shareOfTotalPct: 25 },
  { cause: 'Natural seep (suspected)', incidentCount: 1, shareOfTotalPct: 25 },
  { cause: 'Undetermined', incidentCount: 1, shareOfTotalPct: 25 },
];
