import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { incidents } from '@/data/incidents';
import { vessels } from '@/data/vessels';
import { getDarkContactsForIncident } from '@/data/darkContacts';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { Badge, severityTone, statusTone } from '@/components/Badge';
import { ReportSection } from '@/components/Reports/ReportSection';
import { exportAreaReportPdf } from '@/services/exportReport';
import { formatUtcDate } from '@/services/time';
import type { Incident } from '@/types';

function areaSlug(region: string) {
  return region.toLowerCase().replace(/\s+/g, '-');
}

const RISK_ORDER = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
function worstRisk(list: Incident[], key: 'environmentalRisk' | 'fisheriesRisk' | 'coastalRisk' | 'maritimeRisk' | 'overallResponsePriority') {
  return list.reduce((worst, inc) => {
    const val = inc.impact[key];
    return RISK_ORDER.indexOf(val) > RISK_ORDER.indexOf(worst) ? val : worst;
  }, 'LOW');
}

export const AreaReportPage: React.FC = () => {
  const { area } = useParams<{ area: string }>();
  const navigate = useNavigate();
  const regionIncidents = incidents.filter((i) => areaSlug(i.region) === area);
  const region = regionIncidents[0]?.region ?? area ?? 'Unknown area';

  const darkContacts = useMemo(() => regionIncidents.flatMap((i) => getDarkContactsForIncident(i.id)), [regionIncidents]);
  const candidateVesselIds = useMemo(
    () => Array.from(new Set(regionIncidents.flatMap((i) => i.vesselConnection.candidateVesselIds))),
    [regionIncidents]
  );
  const regionVessels = vessels.filter((v) => candidateVesselIds.includes(v.id));

  if (regionIncidents.length === 0) {
    return (
      <div className="page" style={{ padding: 24 }}>
        <p>No incidents recorded for this area.</p>
        <button className="btn" onClick={() => navigate('/reports/areas')}>← All area reports</button>
      </div>
    );
  }

  const totalArea = regionIncidents.reduce((s, i) => s + i.impact.affectedAreaKm2, 0);
  const highSeverity = regionIncidents.filter((i) => i.characteristics.severity === 'HIGH' || i.characteristics.severity === 'CRITICAL').length;

  const severityData = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((sev) => ({
    severity: sev,
    count: regionIncidents.filter((i) => i.characteristics.severity === sev).length,
  }));

  const trendData = [...regionIncidents]
    .sort((a, b) => a.createdUtc.localeCompare(b.createdUtc))
    .map((i) => ({ date: formatUtcDate(i.createdUtc).slice(5), area: i.impact.affectedAreaKm2, id: i.id }));

  const causeCounts = regionIncidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.probableCause] = (acc[i.probableCause] ?? 0) + 1;
    return acc;
  }, {});
  const causeData = Object.entries(causeCounts).map(([cause, count]) => ({ cause, count }));

  const vesselTypeCounts = regionVessels.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] ?? 0) + 1;
    return acc;
  }, {});

  const highRisk = [...regionIncidents].sort(
    (a, b) => RISK_ORDER.indexOf(b.impact.overallResponsePriority) - RISK_ORDER.indexOf(a.impact.overallResponsePriority)
  );

  const mpasAtRisk = Array.from(new Set(regionIncidents.flatMap((i) => i.impact.mpasAtRisk)));
  const fishingZonesAtRisk = Array.from(new Set(regionIncidents.flatMap((i) => i.impact.fishingZonesAtRisk)));

  const centroid = regionIncidents[0].characteristics.centroid;

  return (
    <div className="page" style={{ padding: 24, overflowY: 'auto', display: 'block' }}>
      <button className="btn" onClick={() => navigate('/reports/areas')} style={{ marginBottom: 16 }}>
        ← All area reports
      </button>

      <div style={{ maxWidth: 900 }}>
        <div className="label-xs" style={{ marginBottom: 4 }}>AREA INTELLIGENCE REPORT</div>
        <h1 style={{ fontSize: 20, margin: 0 }}>{region.toUpperCase()}</h1>

        {/* 01 AREA OVERVIEW */}
        <ReportSection num="01" title="Area Overview">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card"><div className="kpi-label">Area</div><div className="kpi-value" style={{ fontSize: 13 }}>{region}</div></div>
            <div className="kpi-card"><div className="kpi-label">Incident Count</div><div className="kpi-value cyan">{regionIncidents.length}</div></div>
            <div className="kpi-card"><div className="kpi-label">Total Affected Area</div><div className="kpi-value">{totalArea.toFixed(1)} km²</div></div>
            <div className="kpi-card"><div className="kpi-label">High-Severity</div><div className="kpi-value red">{highSeverity}</div></div>
          </div>
        </ReportSection>

        {/* 02 INCIDENT OVERVIEW */}
        <ReportSection num="02" title="Incident Overview">
          <div style={{ height: 240, position: 'relative', border: '1px solid var(--border-hairline-soft)', borderRadius: 4, marginBottom: 12 }}>
            <TacticalMap incidents={regionIncidents} vessels={[]} activeLayers={{ spillMask: true, coast: true }} center={[centroid.longitude, centroid.latitude]} zoom={6} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={severityData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-hairline-soft)" vertical={false} />
              <XAxis dataKey="severity" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-hairline)' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }} />
              <Bar dataKey="count" fill="#37d4ff" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportSection>

        {/* 03 SPILL HOTSPOTS */}
        <ReportSection num="03" title="Spill Hotspots">
          <div style={{ height: 240, position: 'relative', border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
            <TacticalMap incidents={regionIncidents} vessels={[]} activeLayers={{ spillMask: true, searchRadius: true, coast: true }} center={[centroid.longitude, centroid.latitude]} zoom={7} />
          </div>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 6 }}>
            {regionIncidents.length} detection(s) plotted. Concentration analysis over a larger historical window is a
            Phase 4+ enhancement once real satellite ingestion is wired in.
          </p>
        </ReportSection>

        {/* 04 TEMPORAL TRENDS */}
        <ReportSection num="04" title="Temporal Trends">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-hairline-soft)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-hairline)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }}
                formatter={(v: number, _n, p) => [`${v} km²`, p.payload.id]}
              />
              <Line type="monotone" dataKey="area" stroke="#37d4ff" strokeWidth={2} dot={{ r: 3, fill: '#37d4ff' }} name="Affected area" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 4 }}>Affected area over time (km² per incident, chronological).</p>
        </ReportSection>

        {/* 05 ENVIRONMENTAL IMPACT */}
        <ReportSection num="05" title="Environmental Impact">
          <Row label="Fishing zones affected" value={fishingZonesAtRisk.join(', ') || 'None'} />
          <Row label="MPAs affected" value={mpasAtRisk.join(', ') || 'None'} />
          <Row label="Coastal risk (worst-case)" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'coastalRisk'))}>{worstRisk(regionIncidents, 'coastalRisk')}</Badge>} />
        </ReportSection>

        {/* 06 MARITIME ACTIVITY */}
        <ReportSection num="06" title="Maritime Activity">
          <div style={{ height: 220, position: 'relative', border: '1px solid var(--border-hairline-soft)', borderRadius: 4, marginBottom: 10 }}>
            <TacticalMap incidents={regionIncidents} vessels={regionVessels} activeLayers={{ aisTracks: true, spillMask: true }} center={[centroid.longitude, centroid.latitude]} zoom={6.5} />
          </div>
          <div className="chip-row">
            {Object.entries(vesselTypeCounts).map(([type, count]) => (
              <span className="badge neutral" key={type}>{type}: {count}</span>
            ))}
            {regionVessels.length === 0 && <span className="text-muted" style={{ fontSize: 11 }}>No candidate vessels recorded for this area.</span>}
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => navigate('/intelligence')}>
            Open Intelligence →
          </button>
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

        {/* 08 PROBABLE CAUSE DISTRIBUTION */}
        <ReportSection num="08" title="Probable Cause Distribution">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={causeData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-hairline-soft)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="cause" width={160} tick={{ fill: 'var(--text-secondary)', fontSize: 9.5 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }} />
              <Bar dataKey="count" fill="#f5a623" fillOpacity={0.75} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportSection>

        {/* 09 HIGH-RISK INCIDENTS */}
        <ReportSection num="09" title="High-Risk Incidents">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {highRisk.map((inc) => (
              <button key={inc.id} className="card" style={{ textAlign: 'left' }} onClick={() => navigate(`/reports/incidents/${inc.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>{inc.id}</span>
                  <Badge tone={severityTone(inc.impact.overallResponsePriority)}>{inc.impact.overallResponsePriority}</Badge>
                </div>
                <p className="text-muted" style={{ fontSize: 10.5, margin: '6px 0 0' }}>{inc.headline}</p>
                <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
              </button>
            ))}
          </div>
        </ReportSection>

        {/* 10 AREA RISK ASSESSMENT */}
        <ReportSection num="10" title="Area Risk Assessment">
          <Row label="Environmental Risk" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'environmentalRisk'))}>{worstRisk(regionIncidents, 'environmentalRisk')}</Badge>} />
          <Row label="Fisheries Risk" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'fisheriesRisk'))}>{worstRisk(regionIncidents, 'fisheriesRisk')}</Badge>} />
          <Row label="Coastal Risk" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'coastalRisk'))}>{worstRisk(regionIncidents, 'coastalRisk')}</Badge>} />
          <Row label="Maritime Risk" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'maritimeRisk'))}>{worstRisk(regionIncidents, 'maritimeRisk')}</Badge>} />
          <Row label="Overall Risk" value={<Badge tone={severityTone(worstRisk(regionIncidents, 'overallResponsePriority'))} pulse>{worstRisk(regionIncidents, 'overallResponsePriority')}</Badge>} />
        </ReportSection>

        {/* 11 EXPORT */}
        <ReportSection num="11" title="Export">
          <button className="btn primary" onClick={() => exportAreaReportPdf(region, regionIncidents)}>
            ⬇ Export Area Report (PDF)
          </button>
          <p className="text-muted" style={{ fontSize: 9.5, marginTop: 8 }}>
            Investigation dossier — not legal proof.
          </p>
        </ReportSection>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="kv-row"><span className="kv-label">{label}</span><span className="kv-value">{value}</span></div>
);
