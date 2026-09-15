import type { Incident, IncidentSeverity } from '@/types';

// NEERNETRA — Response Priority scoring (Phase 2).
// Deliberately simple, transparent, and replaceable — see
// docs/MODEL_INTEGRATION.md for the real service contract. This mirrors
// what compute_response_priority(...) returns from the backend.

const SEVERITY_WEIGHT: Record<IncidentSeverity, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export interface ResponsePriorityReason {
  factor: string;
  detail: string;
}

export interface ResponsePriorityResult {
  priority: IncidentSeverity;
  scoreOf100: number;
  reasons: ResponsePriorityReason[];
}

export function computeResponsePriority(incident: Incident): ResponsePriorityResult {
  const reasons: ResponsePriorityReason[] = [];

  const severityScore = SEVERITY_WEIGHT[incident.characteristics.severity] * 12.5;
  reasons.push({ factor: 'Spill severity', detail: `${incident.characteristics.severity} (${incident.characteristics.areaKm2.toFixed(1)} km²)` });

  const areaScore = Math.min(incident.impact.affectedAreaKm2 / 25, 1) * 15;
  reasons.push({ factor: 'Affected area', detail: `${incident.impact.affectedAreaKm2.toFixed(1)} km² potentially affected` });

  const coastScore = incident.impact.coastlineEtaHours !== null
    ? Math.max(0, 1 - incident.impact.coastlineEtaHours / 72) * 15
    : 3;
  reasons.push({
    factor: 'Coast proximity',
    detail: incident.impact.coastlineEtaHours !== null
      ? `Est. ${incident.impact.coastlineEtaHours} hr to coastline`
      : 'No coastline ETA modeled',
  });

  const fisheriesScore = SEVERITY_WEIGHT[incident.impact.fisheriesRisk] * 6;
  reasons.push({ factor: 'Fisheries impact', detail: `${incident.impact.fisheriesRisk} risk, ${incident.impact.fishingZonesAtRisk.length} zone(s)` });

  const mpaScore = SEVERITY_WEIGHT[incident.impact.environmentalRisk] * 6;
  reasons.push({ factor: 'MPA / environmental impact', detail: `${incident.impact.environmentalRisk} risk, ${incident.impact.mpasAtRisk.length} protected area(s)` });

  const confidenceScore = (incident.characteristics.confidencePct / 100) * 10;
  reasons.push({ factor: 'Detection confidence', detail: `${incident.characteristics.confidencePct.toFixed(1)}%` });

  const vesselScore = (incident.vesselConnection.topAssociationStrength / 100) * 10;
  reasons.push({
    factor: 'Vessel association',
    detail: incident.vesselConnection.topAssociationStrength > 0
      ? `Top candidate association strength ${incident.vesselConnection.topAssociationStrength}/100`
      : 'No candidate vessels identified',
  });

  const forecastScore = 6; // placeholder weight until live forecast risk trend is wired in Phase 3
  reasons.push({ factor: 'Forecast risk trend', detail: 'Projected area increasing over 24 hr horizon (see Forecast)' });

  const total = severityScore + areaScore + coastScore + fisheriesScore + mpaScore + confidenceScore + vesselScore + forecastScore;
  const scoreOf100 = Math.round(Math.min(total, 100));

  let priority: IncidentSeverity = 'LOW';
  if (scoreOf100 >= 75) priority = 'CRITICAL';
  else if (scoreOf100 >= 55) priority = 'HIGH';
  else if (scoreOf100 >= 30) priority = 'MODERATE';

  return { priority, scoreOf100, reasons };
}
