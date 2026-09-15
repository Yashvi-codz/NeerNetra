import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ReportsLandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="page" style={{ padding: 24, overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
        <button
          className="card"
          style={{ textAlign: 'left', padding: 20 }}
          onClick={() => navigate('/reports/incidents')}
        >
          <div className="label-xs" style={{ color: 'var(--cyan)', marginBottom: 8 }}>INCIDENT REPORTS</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Detailed reports for individual spill events — detection, forensic evidence chain,
            vessel association, impact, and response priority.
          </p>
        </button>
        <button
          className="card"
          style={{ textAlign: 'left', padding: 20 }}
          onClick={() => navigate('/reports/areas')}
        >
          <div className="label-xs" style={{ color: 'var(--cyan)', marginBottom: 8 }}>AREA REPORTS</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Regional trends, hotspots, and cumulative impact across monitored sectors over time.
          </p>
        </button>
      </div>
    </div>
  );
};
