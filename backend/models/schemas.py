"""
NEERNETRA — Pydantic schemas.

Field names intentionally use camelCase to mirror the frontend TypeScript
types 1:1 (frontend/src/types/*.ts) so the API can be consumed without a
translation layer. This is a deliberate contract choice for Phase 1/2.
"""
from __future__ import annotations

from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


# ---------------------------------------------------------------------------
# Vessel
# ---------------------------------------------------------------------------

class VesselDimensions(CamelModel):
    lengthM: float
    beamM: float
    maxDraughtM: float
    grossTonnage: int
    netTonnage: int
    deadweightTonnage: int
    teu: Optional[int] = None
    crudeCapacityBbl: Optional[int] = None
    gasCapacityM3: Optional[int] = None


class VesselParticulars(CamelModel):
    builtYear: int
    builder: str
    dimensions: VesselDimensions


class VesselOwnership(CamelModel):
    owner: str
    manager: str
    classificationSociety: str


class VesselVoyage(CamelModel):
    destination: str
    etaUtc: str
    departurePort: str
    departurePortCountry: str
    lastPort: str
    lastPortCountry: str


class AisGapEvent(CamelModel):
    startUtc: str
    endUtc: str
    durationMinutes: int


class SpeedChangeEvent(CamelModel):
    timestampUtc: str
    fromKn: float
    toKn: float


class CourseChangeEvent(CamelModel):
    timestampUtc: str
    fromDeg: int
    toDeg: int


class VesselActivity(CamelModel):
    aisGaps: List[AisGapEvent] = []
    speedChanges: List[SpeedChangeEvent] = []
    courseChanges: List[CourseChangeEvent] = []


class VesselIntelligence(CamelModel):
    incidentId: str
    spillProximityKm: float
    originProximityKm: float
    routeAlignmentScore: int
    timingCompatibilityScore: int
    environmentalConsistencyScore: int
    behavioralAnomalies: List[str] = []
    associationStrength: int
    investigativeStatus: Literal[
        'REQUIRES INVESTIGATION', 'UNDER REVIEW', 'FLAGGED LEAD', 'CLEARED', 'UNRESOLVED', 'NOT ANALYZED'
    ]
    notes: Optional[str] = None


class Vessel(CamelModel):
    id: str
    name: str
    mmsi: str
    imo: str
    callsign: str
    type: str
    flag: str
    latitude: float
    longitude: float
    speedKn: float
    courseDeg: int
    headingDeg: int
    navStatus: str
    aisSource: Literal['DEMO', 'TERRESTRIAL', 'SATELLITE', 'VESSELFINDER']
    lastUpdatedUtc: str
    voyage: VesselVoyage
    particulars: VesselParticulars
    ownership: VesselOwnership
    activity: VesselActivity
    intelligence: Optional[VesselIntelligence] = None


# ---------------------------------------------------------------------------
# AIS
# ---------------------------------------------------------------------------

class AisPoint(CamelModel):
    vesselId: str
    timestampUtc: str
    latitude: float
    longitude: float
    speedKn: float
    courseDeg: int
    headingDeg: int


class AisTrajectory(CamelModel):
    vesselId: str
    vesselName: str
    points: List[AisPoint]


# ---------------------------------------------------------------------------
# Incident / Spill
# ---------------------------------------------------------------------------

class GeoPoint(CamelModel):
    latitude: float
    longitude: float


class BoundingBox(CamelModel):
    north: float
    south: float
    east: float
    west: float


class SpillPolygon(CamelModel):
    ring: List[List[float]]


class DetectionInfo(CamelModel):
    detectedUtc: str
    satellite: str
    sensor: str
    acquisitionUtc: str
    sourceImageId: str
    confidencePct: float
    detectionMethod: str
    isDemoOutput: bool = True


class SpillCharacteristics(CamelModel):
    areaKm2: float
    lengthKm: float
    widthKm: float
    centroid: GeoPoint
    boundingBox: BoundingBox
    severity: str
    confidencePct: float
    shapeDescription: str
    segments: int
    segmentationQualityPct: float
    polygon: SpillPolygon


class EnvironmentSnapshot(CamelModel):
    currentSpeedKn: float
    currentDirectionDeg: int
    windSpeedKt: float
    windDirectionDeg: int
    waveHeightM: float
    seaSurfaceTempC: float
    observedUtc: str


class HindcastResult(CamelModel):
    probableOriginPoint: GeoPoint
    estimatedReleaseStartUtc: str
    estimatedReleaseEndUtc: str
    trajectoryPoints: List[GeoPoint]
    confidencePct: float
    isDemoOutput: bool = True


class ImpactAssessment(CamelModel):
    affectedAreaKm2: float
    fishingZonesAtRisk: List[str] = []
    mpasAtRisk: List[str] = []
    coastlineDistanceKm: float
    coastlineEtaHours: Optional[int] = None
    environmentalRisk: str
    fisheriesRisk: str
    coastalRisk: str
    maritimeRisk: str
    overallResponsePriority: str


class VesselConnectionSummary(CamelModel):
    vesselsAnalyzed: int
    candidateVesselIds: List[str] = []
    topAssociationStrength: int


class EvidenceChainEntry(CamelModel):
    id: str
    timestampUtc: str
    stage: str
    summary: str
    confidencePct: Optional[float] = None


class Incident(CamelModel):
    id: str
    region: str
    sector: str
    status: str
    headline: str
    detection: DetectionInfo
    characteristics: SpillCharacteristics
    environment: EnvironmentSnapshot
    hindcast: HindcastResult
    impact: ImpactAssessment
    vesselConnection: VesselConnectionSummary
    evidenceChain: List[EvidenceChainEntry]
    probableCause: str
    responsePriority: str
    createdUtc: str
    updatedUtc: str


# ---------------------------------------------------------------------------
# Dark contacts
# ---------------------------------------------------------------------------

class DarkContact(CamelModel):
    contactId: str
    incidentId: str
    satelliteTimestampUtc: str
    latitude: float
    longitude: float
    estimatedType: str
    satelliteConfidencePct: float
    source: str
    aisMatchStatus: Literal['NO MATCH', 'PARTIAL MATCH', 'MATCHED']
    matchConfidencePct: float
    closestVesselId: Optional[str] = None
    aisLastSeenUtc: Optional[str] = None
    searchRadiusKm: float
    recordsChecked: int
    distanceToSpillKm: float
    distanceToOriginKm: float
    timeDifferenceMinutes: int
    positionDifferenceKm: float
    priority: Literal['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    status: Literal['UNRESOLVED', 'UNDER REVIEW', 'NEEDS CORRELATION', 'CLEARED']
    possibleExplanations: List[str] = []


# ---------------------------------------------------------------------------
# Phase 2 analytical models
# ---------------------------------------------------------------------------

class CounterfactualResult(CamelModel):
    vesselId: str
    incidentId: str
    spatialConsistency: Literal['LOW', 'MODERATE', 'HIGH']
    temporalConsistency: Literal['LOW', 'MODERATE', 'HIGH']
    trajectoryConsistency: Literal['LOW', 'MODERATE', 'HIGH']
    environmentalConsistency: Literal['LOW', 'MODERATE', 'HIGH']
    overall: Literal['PHYSICALLY CONSISTENT', 'PARTIALLY CONSISTENT', 'INCONSISTENT', 'INSUFFICIENT DATA']
    confidencePct: float
    reasoning: List[str]
    isDemoOutput: bool = True


class FeatureContribution(CamelModel):
    feature: str
    weightPct: float
    note: str


class CauseAnalysisResult(CamelModel):
    incidentId: str
    cause: str
    confidencePct: float
    featureContributions: List[FeatureContribution]
    isDemoOutput: bool = True


class ForecastSnapshot(CamelModel):
    incidentId: str
    horizonHours: int
    projectedAreaKm2: float
    projectedCentroid: GeoPoint
    confidencePct: float
    isDemoOutput: bool = True


class ResponsePriorityReason(CamelModel):
    factor: str
    detail: str


class ResponsePriorityResult(CamelModel):
    incidentId: str
    priority: Literal['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    scoreOf100: int
    reasons: List[ResponsePriorityReason]
