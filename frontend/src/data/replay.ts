import type { ReplayEvent, ReplayEventType, EvidenceChainEntry } from '@/types';
import { incidents, getIncidentById } from './incidents';

// Legacy shape kept for the existing IncidentHorizon strip component.
export interface HorizonMarker {
  id: string;
  label: string;
  offsetHours: number;
  timestampUtc: string;
  eventSummary?: string;
}

function hoursBetween(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3_600_000;
}

const STAGE_TO_REPLAY_TYPE: Record<EvidenceChainEntry['stage'], ReplayEventType> = {
  SATELLITE: 'DETECTION',
  SPILL: 'DETECTION',
  ENVIRONMENT: 'ORIGIN',
  ORIGIN: 'ORIGIN',
  AIS: 'AIS',
  VESSEL: 'VESSEL',
  COUNTERFACTUAL: 'COUNTERFACTUAL',
  'DARK CONTACT': 'DARK_CONTACT',
  IMPACT: 'IMPACT',
  FORECAST: 'FORECAST',
  RESPONSE: 'RESPONSE',
};

// Generic fallback: derive replay events directly from an incident's own
// evidence chain, so NEER-002/003/004 never duplicate hardcoded values —
// they simply replay the same evidence chain already shown in their drawers.
function deriveFromEvidenceChain(incidentId: string): ReplayEvent[] {
  const incident = getIncidentById(incidentId);
  if (!incident) return [];
  return incident.evidenceChain.map((entry) => ({
    id: `${incidentId}-${entry.id}`,
    incidentId,
    timestampUtc: entry.timestampUtc,
    offsetHours: Math.round(hoursBetween(incident.detection.detectedUtc, entry.timestampUtc) * 100) / 100,
    type: STAGE_TO_REPLAY_TYPE[entry.stage],
    title: entry.stage.replace('_', ' '),
    description: entry.summary,
    latitude: incident.characteristics.centroid.latitude,
    longitude: incident.characteristics.centroid.longitude,
    relatedIncidentId: incidentId,
  }));
}

// NEER-001 gets the fully curated replay per the Phase 3 spec, built
// directly from the AIS activity / evidence-chain data already defined in
// incidents.ts and vessels.ts (no new invented values).
const NEER_001_EVENTS: ReplayEvent[] = [
  {
    id: 'rp-001-1', incidentId: 'NEER-001', timestampUtc: '2026-09-12T14:14:00Z', offsetHours: -18,
    type: 'VESSEL', title: 'Candidate vessel enters origin region',
    description: 'MV OCEAN STAR transits into the approach corridor later identified as the probable release origin.',
    latitude: 19.22, longitude: 73.04, relatedVesselId: 'v-ocean-star', relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-2', incidentId: 'NEER-001', timestampUtc: '2026-09-13T02:04:00Z', offsetHours: -6.17,
    type: 'AIS', title: 'AIS course deviation detected',
    description: 'MV OCEAN STAR course shifts from 251° to 238°, immediately preceding an AIS reporting gap.',
    latitude: 19.1101, longitude: 72.8955, relatedVesselId: 'v-ocean-star', relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-3', incidentId: 'NEER-001', timestampUtc: '2026-09-13T02:10:00Z', offsetHours: -6.07,
    type: 'AIS', title: 'Possible release window begins',
    description: 'AIS reporting gap begins (165 min) with a simultaneous speed reduction to 6.2 kn, overlapping the estimated release window.',
    latitude: 19.1032, longitude: 72.8865, relatedVesselId: 'v-ocean-star', relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-4', incidentId: 'NEER-001', timestampUtc: '2026-09-13T08:02:18Z', offsetHours: -0.19,
    type: 'DETECTION', title: 'Sentinel-1 observation',
    description: 'Sentinel-1 C-SAR pass acquired over the Mumbai approaches.',
    latitude: 19.09, longitude: 72.73, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-5', incidentId: 'NEER-001', timestampUtc: '2026-09-13T08:14:00Z', offsetHours: 0,
    type: 'DETECTION', title: 'Spill segmentation completed',
    description: 'SAR anomaly segmentation flags a 12.6 km² slick-like signature at 91.4% confidence — POSSIBLE OIL SPILL.',
    latitude: 19.0859, longitude: 72.7316, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-6', incidentId: 'NEER-001', timestampUtc: '2026-09-13T08:32:00Z', offsetHours: 0.3,
    type: 'ORIGIN', title: 'Hindcast initiated',
    description: 'Reverse-drift hindcast estimates a probable origin and release window (78% confidence).',
    latitude: 19.0512, longitude: 72.7601, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-7', incidentId: 'NEER-001', timestampUtc: '2026-09-13T08:55:00Z', offsetHours: 0.68,
    type: 'VESSEL', title: 'Candidate vessel correlation',
    description: 'AIS spatio-temporal correlation flags MV OCEAN STAR as the top candidate (association strength 91/100).',
    latitude: 19.0764, longitude: 72.8362, relatedVesselId: 'v-ocean-star', relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-8', incidentId: 'NEER-001', timestampUtc: '2026-09-13T09:10:00Z', offsetHours: 0.93,
    type: 'DARK_CONTACT', title: 'Dark contact identified',
    description: 'A satellite vessel-like return near the probable origin has no matching AIS report (unresolved).',
    latitude: 19.0498, longitude: 72.7588, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-9', incidentId: 'NEER-001', timestampUtc: '2026-09-13T14:32:00Z', offsetHours: 6.3,
    type: 'FORECAST', title: 'Forecast generated',
    description: 'Drift forecast projects the footprint expanding to 14.8 km² by T+6H (72% confidence).',
    latitude: 19.092, longitude: 72.741, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-10', incidentId: 'NEER-001', timestampUtc: '2026-09-13T20:32:00Z', offsetHours: 12.3,
    type: 'IMPACT', title: 'Fishing zone impact detected',
    description: 'Projected footprint growth brings Versova Traditional Fishing Grounds into the modeled affected area.',
    latitude: 19.101, longitude: 72.752, relatedIncidentId: 'NEER-001',
  },
  {
    id: 'rp-001-11', incidentId: 'NEER-001', timestampUtc: '2026-09-14T08:32:00Z', offsetHours: 24.3,
    type: 'RESPONSE', title: 'Coastal risk increases',
    description: 'Coastline ETA (36 hr) and forecast growth trend raise overall response priority to CRITICAL.',
    latitude: 19.118, longitude: 72.769, relatedIncidentId: 'NEER-001',
  },
];

export const replayEvents: Record<string, ReplayEvent[]> = {
  'NEER-001': NEER_001_EVENTS,
  'NEER-002': deriveFromEvidenceChain('NEER-002'),
  'NEER-003': deriveFromEvidenceChain('NEER-003'),
  'NEER-004': deriveFromEvidenceChain('NEER-004'),
};

export function getReplayEvents(incidentId: string): ReplayEvent[] {
  return replayEvents[incidentId] ?? deriveFromEvidenceChain(incidentId);
}

// Fixed horizon markers (T-24H..T+24H) shown as tick labels on the replay
// scrubber and the legacy Investigation "Incident Horizon" strip.
function buildHorizon(incidentId: string): HorizonMarker[] {
  const incident = getIncidentById(incidentId);
  if (!incident) return [];
  const t0 = incident.detection.detectedUtc;
  const offsets = [-24, -12, -6, 0, 6, 12, 24];
  const labels = ['T\u221224H', 'T\u221212H', 'T\u22126H', 'T0', 'T+6H', 'T+12H', 'T+24H'];
  return offsets.map((offset, i) => ({
    id: `h${i + 1}`,
    label: labels[i],
    offsetHours: offset,
    timestampUtc: new Date(new Date(t0).getTime() + offset * 3_600_000).toISOString(),
    eventSummary:
      offset === -6 ? 'Estimated release window begins' : offset === 0 ? 'Satellite detection' : undefined,
  }));
}

export const incidentHorizon: Record<string, HorizonMarker[]> = Object.fromEntries(
  incidents.map((inc) => [inc.id, buildHorizon(inc.id)])
);
