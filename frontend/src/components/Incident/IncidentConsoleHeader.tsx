import React from 'react';
import type { Incident } from '@/types';
import { Badge, severityTone, statusTone } from '../Badge';

export const IncidentConsoleHeader: React.FC<{ incident: Incident }> = ({ incident }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border-hairline)',
      background: 'var(--bg-panel)',
      flexShrink: 0,
      flexWrap: 'wrap',
      gap: 10,
    }}
  >
    <div>
      <div className="label-xs" style={{ marginBottom: 2 }}>NEERNETRA INCIDENT CONSOLE</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{incident.id}</span>
        <span className="text-secondary mono" style={{ fontSize: 11 }}>{incident.sector}</span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge tone={statusTone(incident.status)} pulse>{incident.status}</Badge>
      <Badge tone={severityTone(incident.characteristics.severity)}>{incident.characteristics.severity}</Badge>
      <span className="text-muted mono" style={{ fontSize: 10.5 }}>
        SATELLITE: {incident.detection.satellite.toUpperCase()} · AIS: DEMO · OCEAN: DEMO
      </span>
    </div>
  </div>
);
