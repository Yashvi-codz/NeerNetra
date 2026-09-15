import React from 'react';
import type { Incident } from '@/types';
import { Badge, severityTone } from '../Badge';

export const ImpactAnalysisPanel: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { impact } = incident;
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Impact Analysis</span>
        <span className="demo-tag">DEMO</span>
      </div>
      <div className="panel-body">
        <div className="kv-row">
          <span className="kv-label">Spill ∩ Fishing Zone</span>
          <Badge tone={severityTone(impact.fisheriesRisk)}>{impact.fisheriesRisk}</Badge>
        </div>
        <div className="kv-row">
          <span className="kv-label">Spill ∩ MPA</span>
          <Badge tone={severityTone(impact.environmentalRisk)}>{impact.environmentalRisk}</Badge>
        </div>
        <div className="kv-row">
          <span className="kv-label">Spill ∩ Coastal Region</span>
          <Badge tone={severityTone(impact.coastalRisk)}>{impact.coastalRisk}</Badge>
        </div>
        <div className="kv-row" style={{ borderTop: '1px solid var(--border-hairline)', marginTop: 4, paddingTop: 8 }}>
          <span className="kv-label">Overall environmental risk</span>
          <Badge tone={severityTone(impact.environmentalRisk)}>{impact.environmentalRisk}</Badge>
        </div>
        <div className="kv-row">
          <span className="kv-label">Affected area</span>
          <span className="kv-value">{impact.affectedAreaKm2.toFixed(1)} km²</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Coastline distance</span>
          <span className="kv-value">{impact.coastlineDistanceKm.toFixed(1)} km</span>
        </div>
        <p className="text-muted" style={{ fontSize: 9.5, marginTop: 8 }}>
          Computed via geometry overlap (GeoPandas / Shapely) between the spill polygon and
          fisheries/MPA/coastal reference layers. See docs/MODEL_INTEGRATION.md.
        </p>
      </div>
    </div>
  );
};
