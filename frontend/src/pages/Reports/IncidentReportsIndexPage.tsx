import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidents } from '@/data/incidents';
import { Badge, severityTone, statusTone } from '@/components/Badge';
import { formatUtcDate } from '@/services/time';
import type { IncidentSeverity, IncidentStatus } from '@/types';

type SortKey = 'newest' | 'oldest' | 'severity' | 'area' | 'confidence';

export const IncidentReportsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'ALL' | IncidentSeverity>('ALL');
  const [region, setRegion] = useState<'ALL' | string>('ALL');
  const [status, setStatus] = useState<'ALL' | IncidentStatus>('ALL');
  const [sort, setSort] = useState<SortKey>('newest');

  const regions = useMemo(() => Array.from(new Set(incidents.map((i) => i.region))), []);
  const severities: IncidentSeverity[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  const statuses: IncidentStatus[] = Array.from(new Set(incidents.map((i) => i.status))) as IncidentStatus[];

  const filtered = useMemo(() => {
    let list = incidents.filter((inc) => {
      if (search && !`${inc.id} ${inc.region} ${inc.headline}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (severity !== 'ALL' && inc.characteristics.severity !== severity) return false;
      if (region !== 'ALL' && inc.region !== region) return false;
      if (status !== 'ALL' && inc.status !== status) return false;
      return true;
    });

    const severityRank: Record<IncidentSeverity, number> = { LOW: 0, MODERATE: 1, HIGH: 2, CRITICAL: 3 };
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.createdUtc.localeCompare(b.createdUtc);
        case 'severity':
          return severityRank[b.characteristics.severity] - severityRank[a.characteristics.severity];
        case 'area':
          return b.characteristics.areaKm2 - a.characteristics.areaKm2;
        case 'confidence':
          return b.characteristics.confidencePct - a.characteristics.confidencePct;
        case 'newest':
        default:
          return b.createdUtc.localeCompare(a.createdUtc);
      }
    });
    return list;
  }, [search, severity, region, status, sort]);

  return (
    <div className="page" style={{ padding: 24, overflowY: 'auto', display: 'block' }}>
      <div className="label-xs" style={{ marginBottom: 12 }}>INCIDENT REPORTS</div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="label-xs">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Incident ID, region, headline…"
            style={{
              background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)',
              fontSize: 11, padding: '6px 9px', borderRadius: 'var(--radius-sm)', minWidth: 220,
            }}
          />
        </label>
        <SelectField label="Severity" value={severity} options={['ALL', ...severities]} onChange={(v) => setSeverity(v as typeof severity)} />
        <SelectField label="Region" value={region} options={['ALL', ...regions]} onChange={setRegion} />
        <SelectField label="Status" value={status} options={['ALL', ...statuses]} onChange={(v) => setStatus(v as typeof status)} />
        <SelectField
          label="Sort"
          value={sort}
          options={['newest', 'oldest', 'severity', 'area', 'confidence']}
          onChange={(v) => setSort(v as SortKey)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map((inc) => (
          <div className="card" key={inc.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{inc.id}</span>
              <Badge tone={severityTone(inc.characteristics.severity)}>{inc.characteristics.severity}</Badge>
            </div>
            <div className="text-secondary" style={{ fontSize: 11 }}>{inc.region.toUpperCase()}</div>
            <div className="text-muted mono" style={{ fontSize: 10 }}>{formatUtcDate(inc.createdUtc)}</div>

            <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="kpi-card">
                <div className="kpi-label">Area</div>
                <div className="kpi-value" style={{ fontSize: 14 }}>{inc.characteristics.areaKm2.toFixed(1)} km²</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Confidence</div>
                <div className="kpi-value cyan" style={{ fontSize: 14 }}>{inc.characteristics.confidencePct.toFixed(0)}%</div>
              </div>
            </div>

            <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>

            <button className="btn primary" style={{ marginTop: 4 }} onClick={() => navigate(`/reports/incidents/${inc.id}`)}>
              View Report →
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state">No incidents match the current filters.</div>}
      </div>
    </div>
  );
};

function SelectField<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="label-xs">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)',
          fontSize: 11, padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
