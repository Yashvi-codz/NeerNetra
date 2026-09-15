// NEERNETRA — Counterfactual Vessel Analysis (Phase 2)
// Answers: "Could this vessel's movement physically explain the observed
// spill?" This is NOT a determination of responsibility — see
// docs/ARCHITECTURE.md §Investigative Language.

export type ConsistencyLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type OverallConsistency = 'PHYSICALLY CONSISTENT' | 'PARTIALLY CONSISTENT' | 'INCONSISTENT' | 'INSUFFICIENT DATA';

export interface CounterfactualResult {
  vesselId: string;
  incidentId: string;
  spatialConsistency: ConsistencyLevel;
  temporalConsistency: ConsistencyLevel;
  trajectoryConsistency: ConsistencyLevel;
  environmentalConsistency: ConsistencyLevel;
  overall: OverallConsistency;
  confidencePct: number;
  reasoning: string[];
  isDemoOutput: true;
}

export const counterfactualResults: CounterfactualResult[] = [
  {
    vesselId: 'v-ocean-star',
    incidentId: 'NEER-001',
    spatialConsistency: 'HIGH',
    temporalConsistency: 'HIGH',
    trajectoryConsistency: 'HIGH',
    environmentalConsistency: 'HIGH',
    overall: 'PHYSICALLY CONSISTENT',
    confidencePct: 86,
    reasoning: [
      'Vessel position at estimated release start is within 0.3 km of hindcast probable origin.',
      'AIS gap (165 min) fully overlaps the estimated release window.',
      'Post-gap course (245°) is consistent with observed slick elongation axis.',
      'Current + wind vectors during the window would carry a release from this position to the observed slick centroid.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-pacific-voyager',
    incidentId: 'NEER-001',
    spatialConsistency: 'LOW',
    temporalConsistency: 'LOW',
    trajectoryConsistency: 'MODERATE',
    environmentalConsistency: 'LOW',
    overall: 'INCONSISTENT',
    confidencePct: 74,
    reasoning: [
      'Vessel remained 8+ km from probable origin throughout the release window.',
      'No AIS gap or speed anomaly during the release window.',
      'Drift model would require an implausible cross-current transport to connect this vessel to the slick.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-horizon-9',
    incidentId: 'NEER-001',
    spatialConsistency: 'LOW',
    temporalConsistency: 'LOW',
    trajectoryConsistency: 'LOW',
    environmentalConsistency: 'LOW',
    overall: 'INCONSISTENT',
    confidencePct: 81,
    reasoning: [
      'Vessel outside the 6 km search radius around probable origin for the full release window.',
      'Continuous AIS coverage shows no course or speed irregularities.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-crimson-tide',
    incidentId: 'NEER-002',
    spatialConsistency: 'MODERATE',
    temporalConsistency: 'MODERATE',
    trajectoryConsistency: 'MODERATE',
    environmentalConsistency: 'MODERATE',
    overall: 'PARTIALLY CONSISTENT',
    confidencePct: 58,
    reasoning: [
      'Vessel within 5 km of probable origin during part of the release window.',
      'Single course change of 14° is consistent with, but does not confirm, a discharge maneuver.',
      'Insufficient AIS resolution to confirm precise transit through the origin point.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-arabian-mist',
    incidentId: 'NEER-001',
    spatialConsistency: 'MODERATE',
    temporalConsistency: 'LOW',
    trajectoryConsistency: 'LOW',
    environmentalConsistency: 'LOW',
    overall: 'INCONSISTENT',
    confidencePct: 69,
    reasoning: [
      'Vessel was within 4 km of the spill, but AIS shows continuous, unbroken coverage through the entire release window.',
      'No speed reduction, course deviation, or AIS gap coincides with the estimated release start/end.',
      'Proximity alone is insufficient without a corroborating behavioral or timing signal.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-silver-wake',
    incidentId: 'NEER-001',
    spatialConsistency: 'MODERATE',
    temporalConsistency: 'MODERATE',
    trajectoryConsistency: 'MODERATE',
    environmentalConsistency: 'MODERATE',
    overall: 'PARTIALLY CONSISTENT',
    confidencePct: 52,
    reasoning: [
      'Speed reduction and course change recorded roughly 5 hours before detection, near the outer edge of the release window.',
      'Position is farther from the probable origin than the top candidate.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-blue-current',
    incidentId: 'NEER-001',
    spatialConsistency: 'LOW',
    temporalConsistency: 'LOW',
    trajectoryConsistency: 'LOW',
    environmentalConsistency: 'LOW',
    overall: 'INCONSISTENT',
    confidencePct: 77,
    reasoning: [
      'Vessel is 16+ km from the spill and moving on a southbound course, away from the probable origin.',
      'Direction of travel is inconsistent with a vessel that discharged near the origin and continued its declared voyage.',
    ],
    isDemoOutput: true,
  },
  {
    vesselId: 'v-monarch-wave',
    incidentId: 'NEER-002',
    spatialConsistency: 'MODERATE',
    temporalConsistency: 'MODERATE',
    trajectoryConsistency: 'LOW',
    environmentalConsistency: 'MODERATE',
    overall: 'PARTIALLY CONSISTENT',
    confidencePct: 47,
    reasoning: [
      'AIS gap of 75 minutes the evening before detection overlaps loosely with the estimated release window.',
      'Weaker spatial and trajectory signal than CRIMSON TIDE, the primary candidate for this incident.',
    ],
    isDemoOutput: true,
  },
];

export const getCounterfactualForVessel = (vesselId: string, incidentId: string) =>
  counterfactualResults.find((c) => c.vesselId === vesselId && c.incidentId === incidentId);
