import React from 'react';
import type { CauseAnalysisResult } from '@/data/causeAnalysis';
import { Badge } from '../Badge';

export const CauseAnalysisPanel: React.FC<{ result: CauseAnalysisResult }> = ({ result }) => {
  const tone = result.cause === 'Unknown / insufficient evidence' ? 'neutral' : result.confidencePct >= 70 ? 'green' : 'amber';
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Probable Cause Analysis</span>
        <span className="demo-tag">DEMO MODEL OUTPUT</span>
      </div>
      <div className="panel-body">
        <div className="kv-row">
          <span className="kv-label">Cause</span>
          <Badge tone={tone}>{result.cause}</Badge>
        </div>
        <div className="kv-row">
          <span className="kv-label">Confidence</span>
          <span className="kv-value">{result.confidencePct}%</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="kv-label" style={{ marginBottom: 6 }}>Feature contributions</div>
          {result.featureContributions.map((f) => (
            <div key={f.feature} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                <span className="text-secondary">{f.feature}</span>
                <span className="mono text-muted">{f.weightPct}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                <div style={{ width: `${f.weightPct}%`, height: '100%', background: 'var(--cyan-dim)' }} />
              </div>
              <div className="text-muted" style={{ fontSize: 9.5, marginTop: 3, lineHeight: 1.4 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
