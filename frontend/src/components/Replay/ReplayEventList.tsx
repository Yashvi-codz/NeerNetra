import React from 'react';
import type { ReplayEvent } from '@/types';

const TYPE_COLOR: Record<ReplayEvent['type'], string> = {
  AIS: 'var(--cyan)',
  DETECTION: 'var(--red)',
  ORIGIN: 'var(--amber)',
  VESSEL: 'var(--cyan)',
  COUNTERFACTUAL: 'var(--green)',
  DARK_CONTACT: 'var(--amber)',
  FORECAST: 'var(--text-secondary)',
  IMPACT: 'var(--red)',
  RESPONSE: 'var(--green)',
};

interface ReplayEventListProps {
  events: ReplayEvent[];
  currentOffsetHours: number;
  onSelectEvent: (event: ReplayEvent) => void;
}

export const ReplayEventList: React.FC<ReplayEventListProps> = ({ events, currentOffsetHours, onSelectEvent }) => {
  const sorted = [...events].sort((a, b) => a.offsetHours - b.offsetHours);

  return (
    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Replay Events</span>
      </div>
      <div className="scroll-y" style={{ flex: 1 }}>
        {sorted.map((ev) => {
          const reached = currentOffsetHours >= ev.offsetHours;
          return (
            <button
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 14px',
                borderBottom: '1px solid var(--border-hairline-soft)',
                background: reached ? 'var(--bg-panel-hover)' : 'transparent',
                opacity: reached ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[ev.type], flexShrink: 0 }}
                />
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  T{ev.offsetHours >= 0 ? '+' : ''}{ev.offsetHours.toFixed(1)}H
                </span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--cyan-dim)', fontWeight: 700 }}>
                  {ev.type.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 3, fontWeight: 600 }}>{ev.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{ev.description}</div>
            </button>
          );
        })}
        {sorted.length === 0 && <div className="empty-state">No replay events recorded for this incident.</div>}
      </div>
    </div>
  );
};
