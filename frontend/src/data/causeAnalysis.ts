// NEERNETRA — Probable Cause Analysis (Phase 2)
// analyze_cause(...) equivalent demo output. Never forces a cause when
// evidence is insufficient — see docs/ARCHITECTURE.md.

export type CauseCategory =
  | 'Accidental discharge'
  | 'Operational discharge'
  | 'Collision'
  | 'Equipment failure'
  | 'Transfer / loading incident'
  | 'Natural seep'
  | 'Unknown / insufficient evidence';

export interface FeatureContribution {
  feature: string;
  weightPct: number;
  note: string;
}

export interface CauseAnalysisResult {
  incidentId: string;
  cause: CauseCategory;
  confidencePct: number;
  featureContributions: FeatureContribution[];
  isDemoOutput: true;
}

export const causeAnalysisResults: CauseAnalysisResult[] = [
  {
    incidentId: 'NEER-001',
    cause: 'Operational discharge',
    confidencePct: 68,
    featureContributions: [
      { feature: 'Vessel counterfactual consistency', weightPct: 34, note: 'MV OCEAN STAR physically consistent with release (86% confidence)' },
      { feature: 'AIS gap overlapping release window', weightPct: 24, note: '165-minute gap during estimated release start/end' },
      { feature: 'Slick shape / current alignment', weightPct: 22, note: 'Elongation axis matches current-driven transport from origin' },
      { feature: 'Dark contact corroboration', weightPct: 12, note: 'Unresolved satellite contact near probable origin' },
      { feature: 'Detection confidence', weightPct: 8, note: 'SAR anomaly segmentation confidence 91.4%' },
    ],
    isDemoOutput: true,
  },
  {
    incidentId: 'NEER-002',
    cause: 'Unknown / insufficient evidence',
    confidencePct: 41,
    featureContributions: [
      { feature: 'Vessel counterfactual consistency', weightPct: 30, note: 'CRIMSON TIDE only partially consistent (58%)' },
      { feature: 'Detection confidence', weightPct: 28, note: 'SAR anomaly segmentation confidence 76.8% — moderate' },
      { feature: 'Dark contact corroboration', weightPct: 22, note: 'Partial AIS match on nearby small craft — inconclusive' },
      { feature: 'Environmental consistency', weightPct: 20, note: 'Weak current alignment; multiple plausible origins' },
    ],
    isDemoOutput: true,
  },
  {
    incidentId: 'NEER-003',
    cause: 'Operational discharge',
    confidencePct: 92,
    featureContributions: [
      { feature: 'Port authority corroboration', weightPct: 60, note: 'Bilge discharge confirmed at berth by terminal operator' },
      { feature: 'Detection confidence', weightPct: 25, note: 'Optical classification confidence 96.2%' },
      { feature: 'Spatial containment', weightPct: 15, note: 'Compact sheen adjacent to single berth' },
    ],
    isDemoOutput: true,
  },
  {
    incidentId: 'NEER-004',
    cause: 'Natural seep',
    confidencePct: 77,
    featureContributions: [
      { feature: 'Known seep field overlap', weightPct: 55, note: 'Signature location matches catalogued natural seep field' },
      { feature: 'SAR contrast characteristics', weightPct: 25, note: 'Diffuse, low-contrast signature typical of natural seepage' },
      { feature: 'Vessel correlation', weightPct: 20, note: 'No vessels analyzed near origin during release window' },
    ],
    isDemoOutput: true,
  },
];

export const getCauseAnalysisForIncident = (incidentId: string) =>
  causeAnalysisResults.find((c) => c.incidentId === incidentId);
