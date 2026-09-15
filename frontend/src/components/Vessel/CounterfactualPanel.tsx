import React from 'react';
import type { ConsistencyLevel, CounterfactualResult } from '@/data/counterfactual';
import { Badge } from '../Badge';

function toneFor(level: ConsistencyLevel): 'red' | 'amber' | 'green' {
  if (level === 'HIGH') return 'green';
  if (level === 'MODERATE') return 'amber';
  return 'red';
}

function overallTone(overall: CounterfactualResult['overall']): 'red' | 'amber' | 'green' | 'neutral' {
  switch (overall) {
    case 'PHYSICALLY CONSISTENT':
      return 'green';
    case 'PARTIALLY CONSISTENT':
      return 'amber';
    case 'INCONSISTENT':
      return 'red';
    default:
      return 'neutral';
  }
}

export const CounterfactualPanel: React.FC<{ result: CounterfactualResult; vesselName: string }> = ({ result, vesselName }) => (
  <div className="panel">
    <div className="panel-header">
      <span className="panel-title">Counterfactual Analysis</span>
      <span className="demo-tag">DEMO MODEL OUTPUT</span>
    </div>
    <div className="panel-body">
      <p className="text-muted" style={{ fontSize: 10.5, marginBottom: 10 }}>
        Could {vesselName}'s movement physically explain the observed spill? This is not a
        determination of responsibility.
      </p>
      <div className="kv-row">
        <span className="kv-label">Spatial consistency</span>
        <Badge tone={toneFor(result.spatialConsistency)}>{result.spatialConsistency}</Badge>
      </div>
      <div className="kv-row">
        <span className="kv-label">Temporal consistency</span>
        <Badge tone={toneFor(result.temporalConsistency)}>{result.temporalConsistency}</Badge>
      </div>
      <div className="kv-row">
        <span className="kv-label">Trajectory consistency</span>
        <Badge tone={toneFor(result.trajectoryConsistency)}>{result.trajectoryConsistency}</Badge>
      </div>
      <div className="kv-row">
        <span className="kv-label">Environmental consistency</span>
        <Badge tone={toneFor(result.environmentalConsistency)}>{result.environmentalConsistency}</Badge>
      </div>
      <div className="kv-row" style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-hairline)' }}>
        <span className="kv-label">Overall</span>
        <Badge tone={overallTone(result.overall)}>{result.overall}</Badge>
      </div>
      <div className="kv-row">
        <span className="kv-label">Confidence</span>
        <span className="kv-value">{result.confidencePct}%</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <div className="kv-label" style={{ marginBottom: 6 }}>Reasoning</div>
        <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 11 }}>
          {result.reasoning.map((r) => (
            <li key={r} style={{ marginBottom: 4, lineHeight: 1.4 }}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
