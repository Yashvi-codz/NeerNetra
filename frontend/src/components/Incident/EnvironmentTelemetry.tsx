import React from 'react';
import type { EnvironmentSnapshot } from '@/types';

export const EnvironmentTelemetry: React.FC<{ environment: EnvironmentSnapshot }> = ({ environment }) => (
  <div className="kpi-grid">
    <div className="kpi-card">
      <div className="kpi-label">Wind</div>
      <div className="kpi-value">
        {environment.windSpeedKt.toFixed(1)} <span style={{ fontSize: 11 }}>kt</span> @ {environment.windDirectionDeg}°
      </div>
    </div>
    <div className="kpi-card">
      <div className="kpi-label">Current</div>
      <div className="kpi-value cyan">
        {environment.currentSpeedKn.toFixed(1)} <span style={{ fontSize: 11 }}>kn</span> @ {environment.currentDirectionDeg}°
      </div>
    </div>
    <div className="kpi-card">
      <div className="kpi-label">Sea Temp</div>
      <div className="kpi-value">{environment.seaSurfaceTempC.toFixed(1)}°C</div>
    </div>
    <div className="kpi-card">
      <div className="kpi-label">Wave Height</div>
      <div className="kpi-value">{environment.waveHeightM.toFixed(1)} m</div>
    </div>
  </div>
);
