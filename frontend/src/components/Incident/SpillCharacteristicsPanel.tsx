import React from 'react';
import type { Incident } from '@/types';

export const SpillCharacteristicsPanel: React.FC<{ incident: Incident }> = ({ incident }) => {
  const c = incident.characteristics;
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Spill Characteristics</span>
        <span className="demo-tag">DEMO</span>
      </div>
      <div className="panel-body">
        <div className="kpi-grid" style={{ marginBottom: 10 }}>
          <div className="kpi-card">
            <div className="kpi-label">Detected Area</div>
            <div className="kpi-value red">{c.areaKm2.toFixed(1)} km²</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Mean Confidence</div>
            <div className="kpi-value cyan">{c.confidencePct.toFixed(1)}%</div>
          </div>
        </div>
        <div className="kv-row">
          <span className="kv-label">Centroid</span>
          <span className="kv-value">
            {c.centroid.latitude.toFixed(4)}°N {c.centroid.longitude.toFixed(4)}°E
          </span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Severity</span>
          <span className="kv-value">{c.severity}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Bounding box</span>
          <span className="kv-value">
            {c.boundingBox.north.toFixed(2)}/{c.boundingBox.south.toFixed(2)}/{c.boundingBox.east.toFixed(2)}/{c.boundingBox.west.toFixed(2)}
          </span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Length</span>
          <span className="kv-value">{c.lengthKm.toFixed(1)} km</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Width</span>
          <span className="kv-value">{c.widthKm.toFixed(1)} km</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Shape</span>
          <span className="kv-value" style={{ textAlign: 'right', maxWidth: 170, whiteSpace: 'normal' }}>{c.shapeDescription}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Segmentation quality</span>
          <span className="kv-value">{c.segmentationQualityPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
