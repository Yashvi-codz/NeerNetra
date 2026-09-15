// NEERNETRA — Vessel data model
// Shape is intentionally close to what a normalized AIS/VesselFinder-style
// provider would return, so mock and live providers can share this contract.

export type VesselType =
  | 'Crude Oil Tanker'
  | 'Product Tanker'
  | 'Chemical Tanker'
  | 'Bulk Carrier'
  | 'Container Ship'
  | 'LPG Carrier'
  | 'Fishing Vessel'
  | 'Tug'
  | 'Cargo Vessel'
  | 'Passenger Vessel'
  | 'Unknown';

export type NavStatus =
  | 'Under way using engine'
  | 'At anchor'
  | 'Moored'
  | 'Restricted manoeuvrability'
  | 'Not under command'
  | 'Aground'
  | 'Unknown';

export type AssociationStatus =
  | 'REQUIRES INVESTIGATION'
  | 'UNDER REVIEW'
  | 'FLAGGED LEAD'
  | 'CLEARED'
  | 'UNRESOLVED'
  | 'NOT ANALYZED';

export interface VesselDimensions {
  lengthM: number;
  beamM: number;
  maxDraughtM: number;
  grossTonnage: number; // GT
  netTonnage: number; // NT
  deadweightTonnage: number; // DWT
  teu?: number;
  crudeCapacityBbl?: number;
  gasCapacityM3?: number;
}

export interface VesselParticulars {
  builtYear: number;
  builder: string;
  dimensions: VesselDimensions;
}

export interface VesselOwnership {
  owner: string;
  manager: string;
  classificationSociety: string;
}

export interface VesselVoyage {
  destination: string;
  etaUtc: string; // ISO timestamp
  departurePort: string;
  departurePortCountry: string;
  lastPort: string;
  lastPortCountry: string;
}

export interface VesselIntelligence {
  // Only populated for vessels NEERNETRA has analyzed against an incident.
  incidentId: string;
  spillProximityKm: number;
  originProximityKm: number;
  routeAlignmentScore: number; // 0-100
  timingCompatibilityScore: number; // 0-100
  environmentalConsistencyScore: number; // 0-100
  behavioralAnomalies: string[];
  associationStrength: number; // 0-100 composite score
  investigativeStatus: AssociationStatus;
  notes?: string;
}

export interface AisGapEvent {
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
}

export interface SpeedChangeEvent {
  timestampUtc: string;
  fromKn: number;
  toKn: number;
}

export interface CourseChangeEvent {
  timestampUtc: string;
  fromDeg: number;
  toDeg: number;
}

export interface VesselActivity {
  aisGaps: AisGapEvent[];
  speedChanges: SpeedChangeEvent[];
  courseChanges: CourseChangeEvent[];
}

export type AisSource = 'DEMO' | 'TERRESTRIAL' | 'SATELLITE' | 'VESSELFINDER';

export interface Vessel {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  callsign: string;
  type: VesselType;
  flag: string;

  // Live position
  latitude: number;
  longitude: number;
  speedKn: number;
  courseDeg: number;
  headingDeg: number;
  navStatus: NavStatus;
  aisSource: AisSource;
  lastUpdatedUtc: string;

  voyage: VesselVoyage;
  particulars: VesselParticulars;
  ownership: VesselOwnership;
  activity: VesselActivity;

  // Present only for vessels associated with an incident's investigation.
  intelligence?: VesselIntelligence;
}
