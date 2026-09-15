// NEERNETRA — AIS data model

export interface AisPoint {
  vesselId: string;
  timestampUtc: string;
  latitude: number;
  longitude: number;
  speedKn: number;
  courseDeg: number;
  headingDeg: number;
}

export interface AisTrajectory {
  vesselId: string;
  vesselName: string;
  points: AisPoint[];
}
