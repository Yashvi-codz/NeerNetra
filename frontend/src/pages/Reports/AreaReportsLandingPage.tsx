import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidents } from '@/data/incidents';
import { getDarkContactsForIncident } from '@/data/darkContacts';
import type { IncidentSeverity } from '@/types';

const TIME_PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

function areaSlug(region: string) {
  return region.toLowerCase().replace(/\s+/g, '-');
}

const PERIOD_DAYS: Record<TimePeriod, number | null> = {
  'Last 7 Days': 7,
  'Last 30 Days': 30,
  'Last 90 Days': 90,
  'All Time': null,
};

// "Now" is anchored to the latest demo incident so time-period filters are
// meaningful against NEERNETRA's fixed demo dataset (see services/time.ts).
const DEMO_NOW = new Date('2026-09-13T14:32:18Z').getTime();

export const AreaReportsLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const regions = useMemo(() => Array.from(new Set(incidents.map((i) => i.region))), []);
  const [area, setArea] = useState<string>(regions[0] ?? '');
  const [period, setPeriod] = useState<TimePeriod>('Last 30 Days');
  const [severity, setSeverity] = useState<'ALL' | IncidentSeverity>('ALL');
  const [generated, setGenerated] = useState(false);

  const filtered = useMemo(() => {
    const days = PERIOD_DAYS[period];
    return incidents.filter((inc) => {
      if (inc.region !== area) return false;
      if (severity !== 'ALL' && inc.characteristics.severity !== severity) return false;
      if (days !== null) {
        const ageDays = (DEMO_NOW - new Date(inc.createdUtc).getTime()) / 86_400_000;
        if (ageDays > days) return false;
      }
      return true;
    });
  }, [area, period, severity]);

  const stats = useMemo(() => {
    const highSeverity = filtered.filter((i) => i.characteristics.severity === 'HIGH' || i.characteristics.severity === 'CRITICAL').length;
    const totalArea = filtered.reduce((s, i) => s + i.impact.affectedAreaKm2, 0);
    const highPriorityVessels = filtered.reduce(
      (s, i) => s + i.vesselConnection.candidateVesselIds.length,
      0
    );
    const darkContacts = filtered.reduce((s, i) => s + getDarkContactsForIncident(i.id).length, 0);
    const mpas = new Set(filtered.flatMap((i) => i.impact.mpasAtRisk)).size;
    return { count: filtered.length, highSeverity, totalArea, highPriorityVessels, darkContacts, mpas };
  }, [filtered]);

  return (
    <div className="page" style={{ padding: 24, overflowY: 'auto', display: 'block' }}>
      <div className="label-xs" style={{ marginBottom: 12 }}>AREA REPORTS</div>

      <div className="card" style={{ maxWidth: 620, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Field label="Area">
            <select value={area} onChange={(e) => { setArea(e.target.value); setGenerated(false); }} style={selectStyle}>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Time Period">
            <select value={period} onChange={(e) => { setPeriod(e.target.value as TimePeriod); setGenerated(false); }} style={selectStyle}>
              {TIME_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select value={severity} onChange={(e) => { setSeverity(e.target.value as typeof severity); setGenerated(false); }} style={selectStyle}>
              {['ALL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setGenerated(true)}>
          Generate Area Report
        </button>
      </div>

      {generated && (
        <div style={{ maxWidth: 820 }}>
          <div className="label-xs" style={{ marginBottom: 10 }}>{area.toUpperCase()} · {period.toUpperCase()} · PREVIEW</div>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
            <div className="kpi-card"><div className="kpi-label">Total Incidents</div><div className="kpi-value cyan">{stats.count}</div></div>
            <div className="kpi-card"><div className="kpi-label">High-Severity Incidents</div><div className="kpi-value red">{stats.highSeverity}</div></div>
            <div className="kpi-card"><div className="kpi-label">Total Affected Area</div><div className="kpi-value">{stats.totalArea.toFixed(1)} km²</div></div>
            <div className="kpi-card"><div className="kpi-label">High-Priority Vessel Assoc.</div><div className="kpi-value amber">{stats.highPriorityVessels}</div></div>
            <div className="kpi-card"><div className="kpi-label">Dark Vessel Contacts</div><div className="kpi-value amber">{stats.darkContacts}</div></div>
            <div className="kpi-card"><div className="kpi-label">MPAs at Risk</div><div className="kpi-value">{stats.mpas}</div></div>
          </div>
          <button
            className="btn primary"
            onClick={() => navigate(`/reports/areas/${areaSlug(area)}`, { state: { period, severity } })}
            disabled={stats.count === 0}
          >
            Open Full Area Report →
          </button>
          {stats.count === 0 && (
            <p className="text-muted" style={{ fontSize: 11, marginTop: 8 }}>
              No incidents match this area/period/severity combination.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)',
  fontSize: 11, padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', minWidth: 160,
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span className="label-xs">{label}</span>
    {children}
  </label>
);
