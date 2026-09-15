// NEERNETRA — Dark Vessel / Dark Contact data model
// A "dark contact" is a satellite-detected vessel-like object with no
// corroborating AIS transmission at the time of observation.

export type DarkContactStatus =
  | 'UNRESOLVED'
  | 'UNDER REVIEW'
  | 'NEEDS CORRELATION'
  | 'CLEARED';

export type DarkContactPriority = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DarkContact {
  contactId: string;
  incidentId: string;
  satelliteTimestampUtc: string;
  latitude: number;
  longitude: number;
  estimatedType: string; // e.g. "Tanker-class (estimated)"
  satelliteConfidencePct: number;
  source: 'Sentinel-1' | 'Sentinel-2' | 'Landsat-8/9';
  aisMatchStatus: 'NO MATCH' | 'PARTIAL MATCH' | 'MATCHED';
  matchConfidencePct: number;
  closestVesselId?: string;
  aisLastSeenUtc?: string;
  searchRadiusKm: number;
  recordsChecked: number;
  distanceToSpillKm: number;
  distanceToOriginKm: number;
  timeDifferenceMinutes: number;
  positionDifferenceKm: number;
  priority: DarkContactPriority;
  status: DarkContactStatus;
  possibleExplanations: string[];
}
