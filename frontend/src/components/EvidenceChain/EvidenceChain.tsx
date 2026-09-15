import React, { useState } from 'react';
import type { EvidenceChainEntry } from '@/types';
import { formatUtcClock } from '@/services/time';

export const EvidenceChain: React.FC<{ entries: EvidenceChainEntry[] }> = ({ entries }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {entries.map((entry, i) => (
        <div key={entry.id} style={{ display: 'flex', gap: 10, paddingBottom: i === entries.length - 1 ? 0 : 14, position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--cyan)',
                boxShadow: '0 0 6px rgba(55,212,255,0.5)',
                flexShrink: 0,
              }}
            />
            {i !== entries.length - 1 && (
              <span style={{ width: 1, flex: 1, background: 'var(--border-active)', marginTop: 2 }} />
            )}
          </div>
          <button
            onClick={() => setExpandedId((cur) => (cur === entry.id ? null : entry.id))}
            style={{ paddingBottom: 2, background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--cyan-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
                {entry.stage}
              </span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                {formatUtcClock(entry.timestampUtc)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{entry.summary}</div>
            {entry.confidencePct !== undefined && (
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                Confidence {entry.confidencePct.toFixed(0)}%
              </div>
            )}
            {expandedId === entry.id && (
              <div className="text-muted" style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.4 }}>
                Stage detail is reflected in the corresponding panel above (Detection, Environment, Hindcast,
                AIS Correlation, Counterfactual, Dark Contacts, Impact, or Response Priority).
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
};
