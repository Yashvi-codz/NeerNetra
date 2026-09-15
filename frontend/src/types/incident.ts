// NEERNETRA — Incident / Spill data model
// Language deliberately avoids overclaiming satellite certainty and avoids
// accusatory language about vessels — see docs/ARCHITECTURE.md.

export type IncidentStatus =
  | 'ACTIVE INVESTIGATION'
  | 'UNDER REVIEW'
  | 'CLEARED'
  | 'CLOSED — CORROBORATED'
  | 'CLOSED — UNRESOLVED';

export type IncidentSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type DetectionMethod =
  | 'SAR Anomaly Segmentation'
  | 'Optical Multispectral Classification'
  | 'SAR + Optical Fusion';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SpillPolygon {
  // GeoJSON-compatible ring, [lng, lat][]
  ring: [number, number][];
}

export interface DetectionInfo {
  detectedUtc: string;
  satellite: 'Sentinel-1' | 'Sentinel-2' | 'Landsat-8/9';
  sensor: string;
  acquisitionUtc: string;
  sourceImageId: string;
  confidencePct: number;
  detectionMethod: DetectionMethod;
  isDemoOutput: true; // Phase 1: always mock inference
}

export interface SpillCharacteristics {
  areaKm2: number;
  lengthKm: number;
  widthKm: number;
  centroid: GeoPoint;
  boundingBox: BoundingBox;
  severity: IncidentSeverity;
  confidencePct: number;
  shapeDescription: string;
  segments: number;
  segmentationQualityPct: number;
  polygon: SpillPolygon;
}

export interface EnvironmentSnapshot {
  currentSpeedKn: number;
  currentDirectionDeg: number;
  windSpeedKt: number;
  windDirectionDeg: number;
  waveHeightM: number;
  seaSurfaceTempC: number;
  observedUtc: string;
}

export interface HindcastResult {
  probableOriginPoint: GeoPoint;
  estimatedReleaseStartUtc: string;
  estimatedReleaseEndUtc: string;
  trajectoryPoints: GeoPoint[];
  confidencePct: number;
  isDemoOutput: true;
}

export interface ImpactAssessment {
  affectedAreaKm2: number;
  fishingZonesAtRisk: string[];
  mpasAtRisk: string[];
  coastlineDistanceKm: number;
  coastlineEtaHours: number | null;
  environmentalRisk: IncidentSeverity;
  fisheriesRisk: IncidentSeverity;
  coastalRisk: IncidentSeverity;
  maritimeRisk: IncidentSeverity;
  overallResponsePriority: IncidentSeverity;
}

export interface VesselConnectionSummary {
  vesselsAnalyzed: number;
  candidateVesselIds: string[];
  topAssociationStrength: number;
}

export interface EvidenceChainEntry {
  id: string;
  timestampUtc: string;
  stage:
    | 'SATELLITE'
    | 'SPILL'
    | 'ENVIRONMENT'
    | 'ORIGIN'
    | 'AIS'
    | 'VESSEL'
    | 'COUNTERFACTUAL'
    | 'DARK CONTACT'
    | 'IMPACT'
    | 'FORECAST'
    | 'RESPONSE';
  summary: string;
  confidencePct?: number;
}

export interface Incident {
  id: string; // e.g. NEER-001
  region: string;
  sector: string;
  status: IncidentStatus;
  headline: string; // e.g. "Possible oil spill — Arabian Sea shipping lane"
  detection: DetectionInfo;
  characteristics: SpillCharacteristics;
  environment: EnvironmentSnapshot;
  hindcast: HindcastResult;
  impact: ImpactAssessment;
  vesselConnection: VesselConnectionSummary;
  evidenceChain: EvidenceChainEntry[];
  probableCause:
    | 'Undetermined'
    | 'Vessel discharge (suspected)'
    | 'Bilge discharge (suspected)'
    | 'Pipeline / terminal (suspected)'
    | 'Natural seep (suspected)';
  responsePriority: IncidentSeverity;
  createdUtc: string;
  updatedUtc: string;
}
