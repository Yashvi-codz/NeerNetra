import React from 'react';
import type { Incident } from '@/types';
import { computeResponsePriority } from '@/services/responsePriority';
import { Badge, severityTone } from '../Badge';

export const ResponsePriorityPanel: React.FC<{ incident: Incident }> = ({ incident }) => {
  const result = computeResponsePriority(incident);
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Response Priority</span>
      </div>
      <div className="panel-body">
        <div className="kpi-grid" style={{ marginBottom: 10 }}>
          <div className="kpi-card">
            <div className="kpi-label">Priority</div>
            <div className="kpi-value" style={{ padding: 0 }}>
              <Badge tone={severityTone(result.priority)} pulse={result.priority === 'CRITICAL'}>
                {result.priority}
              </Badge>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Composite Score</div>
            <div className="kpi-value cyan">{result.scoreOf100}/100</div>
          </div>
        </div>
        <div className="kv-label" style={{ marginBottom: 6 }}>Contributing factors</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.reasons.map((r) => (
            <div key={r.factor} style={{ fontSize: 10.5 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{r.factor}</span>
              <span className="text-muted"> — {r.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
