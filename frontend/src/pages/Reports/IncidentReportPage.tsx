import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncidentById } from '@/data/incidents';
import { getVesselById } from '@/data/vessels';
import { getCounterfactualForVessel } from '@/data/counterfactual';
import { getCauseAnalysisForIncident } from '@/data/causeAnalysis';
import { getDarkContactsForIncident } from '@/data/darkContacts';
import { getReplayEvents } from '@/data/replay';
import { computeResponsePriority } from '@/services/responsePriority';
import { exportIncidentReportPdf } from '@/services/exportReport';
import { Badge, severityTone, statusTone } from '@/components/Badge';
import { EvidenceChain } from '@/components/EvidenceChain/EvidenceChain';
import { ReportSection } from '@/components/Reports/ReportSection';
import { formatUtcClock, formatUtcDate } from '@/services/time';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="kv-row"><span className="kv-label">{label}</span><span className="kv-value">{value}</span></div>
);

export const IncidentReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = id ? getIncidentById(id) : undefined;

  if (!incident) {
    return (
      <div className="page" style={{ padding: 24 }}>
        <p>Incident report not found.</p>
        <button className="btn" onClick={() => navigate('/reports/incidents')}>Back to incidents</button>
      </div>
    );
  }

  const cause = getCauseAnalysisForIncident(incident.id);
  const priority = computeResponsePriority(incident);
  const darkContacts = getDarkContactsForIncident(incident.id);
  const replayEvents = getReplayEvents(incident.id);
  const topCandidateId = incident.vesselConnection.candidateVesselIds[0];
  const topCounterfactual = topCandidateId ? getCounterfactualForVessel(topCandidateId, incident.id) : undefined;
  const topVessel = topCandidateId ? getVesselById(topCandidateId) : undefined;

  return (
    <div className="page" style={{ padding: 24, overflowY: 'auto', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <button className="btn" onClick={() => navigate('/reports/incidents')}>← Back to Incidents</button>
        <button className="btn primary" onClick={() => exportIncidentReportPdf(incident)}>⬇ Export Report (PDF)</button>
      </div>

      <div style={{ maxWidth: 860 }}>
        <div className="label-xs" style={{ marginBottom: 4 }}>{incident.id} · INDIVIDUAL INCIDENT REPORT</div>
        <h1 style={{ fontSize: 20, margin: 0 }}>{incident.region.toUpperCase()}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <div className="kpi-card" style={{ minWidth: 140 }}>
            <div className="kpi-label">Status</div>
            <Badge tone={statusTone(incident.status)}>{incident.status}</Badge>
          </div>
          <div className="kpi-card" style={{ minWidth: 140 }}>
            <div className="kpi-label">Severity</div>
            <Badge tone={severityTone(incident.characteristics.severity)}>{incident.characteristics.severity}</Badge>
          </div>
          <div className="kpi-card" style={{ minWidth: 140 }}>
            <div className="kpi-label">Priority</div>
            <Badge tone={severityTone(priority.priority)}>{priority.priority}</Badge>
          </div>
        </div>

        {/* 01 EXECUTIVE SUMMARY */}
        <ReportSection num="01" title="Executive Summary">
          <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {incident.id} is a {incident.characteristics.severity.toLowerCase()}-severity {incident.headline.toLowerCase()} in
            the {incident.region}. Satellite detection confidence is {incident.characteristics.confidencePct.toFixed(1)}% over a{' '}
            {incident.characteristics.areaKm2.toFixed(1)} km² area. Reverse-drift hindcasting estimates a probable origin near{' '}
            {incident.hindcast.probableOriginPoint.latitude.toFixed(4)}°N, {incident.hindcast.probableOriginPoint.longitude.toFixed(4)}°E
            {' '}({incident.hindcast.confidencePct.toFixed(0)}% confidence). {incident.vesselConnection.vesselsAnalyzed} vessel(s) were
            analyzed{incident.vesselConnection.topAssociationStrength > 0
              ? `, with a top candidate association strength of ${incident.vesselConnection.topAssociationStrength}/100`
              : ', with no candidate vessels currently identified'}. Overall response priority is {priority.priority}.
          </p>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 6 }}>
            Investigative lead only. Correlation does not establish vessel responsibility.
          </p>
        </ReportSection>

        {/* 02 SATELLITE DETECTION */}
        <ReportSection num="02" title="Satellite Detection">
          <div className="card" style={{ marginBottom: 10 }}>
            <span className="demo-tag">DEMO SATELLITE DATA</span>
            <p className="text-muted" style={{ fontSize: 10.5, marginTop: 8 }}>
              Raw imagery and segmentation mask rendering are part of the Phase 3 ingestion pipeline scope and are not
              bundled in this demo build. Detection metadata below reflects the actual mock inference values used
              throughout NEERNETRA.
            </p>
          </div>
          <Row label="Satellite" value={incident.detection.satellite} />
          <Row label="Sensor" value={incident.detection.sensor} />
          <Row label="Acquisition" value={formatUtcClock(incident.detection.acquisitionUtc)} />
          <Row label="Source image" value={incident.detection.sourceImageId} />
          <Row label="Detection method" value={incident.detection.detectionMethod} />
          <Row label="Confidence" value={`${incident.detection.confidencePct.toFixed(1)}%`} />
          <Row label="Classification" value="POSSIBLE OIL SPILL" />
        </ReportSection>

        {/* 03 SPILL CHARACTERISTICS */}
        <ReportSection num="03" title="Spill Characteristics">
          <Row label="Area" value={`${incident.characteristics.areaKm2.toFixed(1)} km²`} />
          <Row label="Length" value={`${incident.characteristics.lengthKm.toFixed(1)} km`} />
          <Row label="Width" value={`${incident.characteristics.widthKm.toFixed(1)} km`} />
          <Row label="Centroid" value={`${incident.characteristics.centroid.latitude.toFixed(4)}°N ${incident.characteristics.centroid.longitude.toFixed(4)}°E`} />
          <Row label="Bounding box" value={`${incident.characteristics.boundingBox.north.toFixed(2)}/${incident.characteristics.boundingBox.south.toFixed(2)}/${incident.characteristics.boundingBox.east.toFixed(2)}/${incident.characteristics.boundingBox.west.toFixed(2)}`} />
          <Row label="Severity" value={incident.characteristics.severity} />
          <Row label="Confidence" value={`${incident.characteristics.confidencePct.toFixed(1)}%`} />
          <Row label="Shape" value={incident.characteristics.shapeDescription} />
          <Row label="Segments" value={incident.characteristics.segments} />
          <Row label="Segmentation quality" value={`${incident.characteristics.segmentationQualityPct.toFixed(1)}%`} />
        </ReportSection>

        {/* 04 ENVIRONMENTAL CONDITIONS */}
        <ReportSection num="04" title="Environmental Conditions">
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-label">Wind</div><div className="kpi-value">{incident.environment.windSpeedKt.toFixed(1)} kt @ {incident.environment.windDirectionDeg}°</div></div>
            <div className="kpi-card"><div className="kpi-label">Current</div><div className="kpi-value cyan">{incident.environment.currentSpeedKn.toFixed(1)} kn @ {incident.environment.currentDirectionDeg}°</div></div>
            <div className="kpi-card"><div className="kpi-label">Wave height</div><div className="kpi-value">{incident.environment.waveHeightM.toFixed(1)} m</div></div>
            <div className="kpi-card"><div className="kpi-label">Sea temp</div><div className="kpi-value">{incident.environment.seaSurfaceTempC.toFixed(1)}°C</div></div>
          </div>
        </ReportSection>

        {/* 05 PROBABLE ORIGIN & HINDCAST */}
        <ReportSection num="05" title="Probable Origin & Hindcast">
          <Row label="Probable origin" value={`${incident.hindcast.probableOriginPoint.latitude.toFixed(4)}°N ${incident.hindcast.probableOriginPoint.longitude.toFixed(4)}°E`} />
          <Row label="Release window" value={`${formatUtcClock(incident.hindcast.estimatedReleaseStartUtc)} – ${formatUtcClock(incident.hindcast.estimatedReleaseEndUtc)}`} />
          <Row label="Confidence" value={`${incident.hindcast.confidencePct.toFixed(0)}%`} />
          <Row label="Trajectory points" value={incident.hindcast.trajectoryPoints.length} />
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 6 }}>
            Origin is a probability estimate with an associated search radius shown on the Investigation map — never
            presented as an exact guaranteed point.
          </p>
        </ReportSection>

        {/* 06 AIS & VESSEL ANALYSIS */}
        <ReportSection num="06" title="AIS & Vessel Analysis">
          <Row label="Vessels analyzed" value={incident.vesselConnection.vesselsAnalyzed} />
          {incident.vesselConnection.candidateVesselIds.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 11.5, marginTop: 8 }}>No candidate vessels were identified.</p>
          ) : (
            <table className="data-table" style={{ marginTop: 10 }}>
              <thead>
                <tr><th>Vessel</th><th>Type</th><th>Distance</th><th>Timing</th><th>Route Align.</th><th>Env. Consistency</th><th>Association</th><th>Status</th></tr>
              </thead>
              <tbody>
                {incident.vesselConnection.candidateVesselIds.map((vid) => {
                  const v = getVesselById(vid);
                  if (!v || !v.intelligence) return null;
                  return (
                    <tr key={vid} onClick={() => navigate(`/vessels/${vid}`)}>
                      <td className="name-cell">{v.name}</td>
                      <td>{v.type}</td>
                      <td>{v.intelligence.spillProximityKm.toFixed(1)} km</td>
                      <td>{v.intelligence.timingCompatibilityScore}/100</td>
                      <td>{v.intelligence.routeAlignmentScore}/100</td>
                      <td>{v.intelligence.environmentalConsistencyScore}/100</td>
                      <td>{v.intelligence.associationStrength}/100</td>
                      <td><Badge tone={statusTone(v.intelligence.investigativeStatus)}>{v.intelligence.investigativeStatus}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 8 }}>
            Investigative lead only. Correlation does not establish vessel responsibility.
          </p>
        </ReportSection>

        {/* 07 DARK VESSEL INTELLIGENCE */}
        <ReportSection num="07" title="Dark Vessel Intelligence">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card"><div className="kpi-label">Satellite Contacts</div><div className="kpi-value cyan">{darkContacts.length}</div></div>
            <div className="kpi-card"><div className="kpi-label">AIS Mismatches</div><div className="kpi-value amber">{darkContacts.filter((c) => c.aisMatchStatus !== 'MATCHED').length}</div></div>
            <div className="kpi-card"><div className="kpi-label">Unresolved</div><div className="kpi-value red">{darkContacts.filter((c) => c.status === 'UNRESOLVED').length}</div></div>
            <div className="kpi-card"><div className="kpi-label">High Priority</div><div className="kpi-value red">{darkContacts.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL').length}</div></div>
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => navigate('/intelligence/dark-vessels')}>
            Open Dark Vessel Intelligence →
          </button>
        </ReportSection>

        {/* 08 COUNTERFACTUAL ANALYSIS */}
        <ReportSection num="08" title="Counterfactual Analysis">
          {topCounterfactual && topVessel ? (
            <>
              <Row label="Vessel" value={topVessel.name} />
              <Row label="Spatial consistency" value={topCounterfactual.spatialConsistency} />
              <Row label="Temporal consistency" value={topCounterfactual.temporalConsistency} />
              <Row label="Trajectory consistency" value={topCounterfactual.trajectoryConsistency} />
              <Row label="Environmental consistency" value={topCounterfactual.environmentalConsistency} />
              <Row label="Overall" value={<Badge tone={topCounterfactual.overall === 'PHYSICALLY CONSISTENT' ? 'green' : topCounterfactual.overall === 'PARTIALLY CONSISTENT' ? 'amber' : 'red'}>{topCounterfactual.overall}</Badge>} />
              <Row label="Confidence" value={`${topCounterfactual.confidencePct}%`} />
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
                {topCounterfactual.reasoning.map((r) => <li key={r} style={{ marginBottom: 4 }}>{r}</li>)}
              </ul>
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: 11.5 }}>No counterfactual analysis available for this incident.</p>
          )}
        </ReportSection>

        {/* 09 FORECAST */}
        <ReportSection num="09" title="Forecast">
          <p className="text-muted" style={{ fontSize: 11 }}>
            T0 (current): {incident.characteristics.areaKm2.toFixed(1)} km². Full T+6H/T+12H/T+24H projected footprints
            and confidence are shown on the Investigation map's Forecast panel and during Time-Based Incident Replay.
          </p>
        </ReportSection>

        {/* 10 ENVIRONMENTAL & FISHERIES IMPACT */}
        <ReportSection num="10" title="Environmental & Fisheries Impact">
          <Row label="Fishing zones at risk" value={incident.impact.fishingZonesAtRisk.join(', ') || 'None'} />
          <Row label="MPAs at risk" value={incident.impact.mpasAtRisk.join(', ') || 'None'} />
          <Row label="Coastline distance / ETA" value={`${incident.impact.coastlineDistanceKm.toFixed(1)} km / ${incident.impact.coastlineEtaHours ?? 'N/A'} hr`} />
          <Row label="Fisheries risk" value={<Badge tone={severityTone(incident.impact.fisheriesRisk)}>{incident.impact.fisheriesRisk}</Badge>} />
          <Row label="Environmental risk" value={<Badge tone={severityTone(incident.impact.environmentalRisk)}>{incident.impact.environmentalRisk}</Badge>} />
          <Row label="Coastal risk" value={<Badge tone={severityTone(incident.impact.coastalRisk)}>{incident.impact.coastalRisk}</Badge>} />
        </ReportSection>

        {/* 11 PROBABLE CAUSE */}
        <ReportSection num="11" title="Probable Cause">
          {cause ? (
            <>
              <Row label="Cause" value={cause.cause} />
              <Row label="Confidence" value={`${cause.confidencePct}%`} />
              <div style={{ marginTop: 8 }}>
                {cause.featureContributions.map((f) => (
                  <div key={f.feature} style={{ fontSize: 10.5, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{f.feature}</span>
                    <span className="text-muted"> ({f.weightPct}%) — {f.note}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Badge tone="neutral">UNKNOWN / INSUFFICIENT EVIDENCE</Badge>
          )}
        </ReportSection>

        {/* 12 RESPONSE PRIORITY */}
        <ReportSection num="12" title="Response Priority">
          <Row label="Priority" value={<Badge tone={severityTone(priority.priority)} pulse={priority.priority === 'CRITICAL'}>{priority.priority}</Badge>} />
          <Row label="Composite score" value={`${priority.scoreOf100}/100`} />
          <div style={{ marginTop: 8 }}>
            {priority.reasons.map((r) => (
              <div key={r.factor} style={{ fontSize: 10.5, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{r.factor}</span>
                <span className="text-muted"> — {r.detail}</span>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* 13 EVIDENCE CHAIN */}
        <ReportSection num="13" title="Evidence Chain">
          <div className="card">
            <EvidenceChain entries={incident.evidenceChain} />
          </div>
        </ReportSection>

        {/* 14 TIME-BASED INCIDENT REPLAY */}
        <ReportSection num="14" title="Time-Based Incident Replay">
          <p className="text-muted" style={{ fontSize: 11, marginBottom: 10 }}>
            {replayEvents.length} reconstructed event(s) from T-24H to T+24H relative to detection, using the same
            incident data shown throughout this report.
          </p>
          <button className="btn primary" onClick={() => navigate(`/replay/${incident.id}`)}>
            ▶ Play Incident Replay
          </button>
        </ReportSection>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};
