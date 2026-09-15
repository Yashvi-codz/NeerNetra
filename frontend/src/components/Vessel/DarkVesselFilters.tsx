import React from 'react';
import { incidents } from '@/data/incidents';
import type { DarkContactPriority, DarkContactStatus } from '@/types';

export interface DarkVesselFilterState {
  incidentId: string; // 'ALL' or incident id
  priority: 'ALL' | DarkContactPriority;
  status: 'ALL' | DarkContactStatus;
}

const PRIORITIES: DarkContactPriority[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const STATUSES: DarkContactStatus[] = ['UNRESOLVED', 'UNDER REVIEW', 'NEEDS CORRELATION', 'CLEARED'];

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="label-xs">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          background: 'var(--bg-panel-raised)',
          border: '1px solid var(--border-hairline)',
          color: 'var(--text-primary)',
          fontSize: 11,
          padding: '5px 8px',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export const DarkVesselFilters: React.FC<{
  state: DarkVesselFilterState;
  onChange: (state: DarkVesselFilterState) => void;
}> = ({ state, onChange }) => (
  <div style={{ display: 'flex', gap: 14, padding: '0 16px 12px', flexWrap: 'wrap' }}>
    <Select
      label="Incident"
      value={state.incidentId}
      options={['ALL', ...incidents.map((i) => i.id)]}
      onChange={(v) => onChange({ ...state, incidentId: v })}
    />
    <Select
      label="Priority"
      value={state.priority}
      options={['ALL', ...PRIORITIES]}
      onChange={(v) => onChange({ ...state, priority: v as DarkVesselFilterState['priority'] })}
    />
    <Select
      label="Status"
      value={state.status}
      options={['ALL', ...STATUSES]}
      onChange={(v) => onChange({ ...state, status: v as DarkVesselFilterState['status'] })}
    />
  </div>
);
