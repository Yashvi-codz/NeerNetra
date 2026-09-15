// NEERNETRA — Time-Based Incident Replay data model (Phase 3)

export type ReplayEventType =
  | 'AIS'
  | 'DETECTION'
  | 'ORIGIN'
  | 'VESSEL'
  | 'COUNTERFACTUAL'
  | 'DARK_CONTACT'
  | 'FORECAST'
  | 'IMPACT'
  | 'RESPONSE';

export interface ReplayEvent {
  id: string;
  incidentId: string;
  timestampUtc: string;
  offsetHours: number; // negative = before detection (T0), 0 = detection, positive = after
  type: ReplayEventType;
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  relatedVesselId?: string;
  relatedIncidentId?: string;
}
