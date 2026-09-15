import React from 'react';
import { forecastSnapshots } from '@/data/forecasts';
import type { Incident } from '@/types';

export const ForecastPanel: React.FC<{ incident: Incident }> = ({ incident }) => {
  const rows = forecastSnapshots.filter((f) => f.incidentId === incident.id);
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Spill Drift Forecast</span>
        <span className="demo-tag">DEMO MODEL OUTPUT</span>
      </div>
      <div className="panel-body">
        {rows.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 11 }}>No forecast has been generated for this incident.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="kv-row">
              <span className="kv-label">T0 (current)</span>
              <span className="kv-value">{incident.characteristics.areaKm2.toFixed(1)} km²</span>
            </div>
            {rows.map((f) => (
              <div className="kv-row" key={f.horizonHours}>
                <span className="kv-label">T+{f.horizonHours}H</span>
                <span className="kv-value">
                  {f.projectedAreaKm2.toFixed(1)} km² · {f.confidencePct}% confidence
                </span>
              </div>
            ))}
            <p className="text-muted" style={{ fontSize: 9.5, marginTop: 4 }}>
              Projected footprints are shown as concentric placeholders on the map (FORECAST layer) pending
              a live drift model in Phase 3.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
