import React from 'react';
import { Logo } from '../Logo';
import { useUtcClock } from '@/hooks/useUtcClock';
import type { Incident } from '@/types';

interface TacticalHeaderProps {
  incident?: Incident;
  alertCount: number;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({ incident, alertCount }) => {
  const clock = useUtcClock();

  return (
    <header className="tactical-header">
      <div className="header-brand">
        <Logo />
        <div className="header-brand-text">
          <span className="header-brand-title">NEERNETRA</span>
          <span className="header-brand-sub">Maritime Intelligence</span>
        </div>
      </div>

      <div className="header-telemetry">
        <div className="telemetry-item">
          <span className="status-dot green pulse" />
          <span className="label-xs">System</span>
          <span className="telemetry-value">ONLINE</span>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-item">
          <span className="label-xs">Satellite</span>
          <span className="telemetry-value">SENTINEL-1</span>
        </div>
        <div className="telemetry-item">
          <span className="label-xs">AIS</span>
          <span className="telemetry-value">DEMO</span>
        </div>
        <div className="telemetry-item">
          <span className="label-xs">Ocean</span>
          <span className="telemetry-value">DEMO</span>
        </div>
        <div className="telemetry-divider" />
        {incident && (
          <>
            <div className="telemetry-item">
              <span className="label-xs">Incident</span>
              <span className="telemetry-value">{incident.id}</span>
            </div>
            <div className="telemetry-item">
              <span className="label-xs">Sector</span>
              <span className="telemetry-value">{incident.region.toUpperCase()}</span>
            </div>
          </>
        )}
        <div className="telemetry-divider" />
        <div className="telemetry-item">
          <span className="label-xs">Alerts</span>
          <span className="telemetry-value" style={{ color: alertCount > 0 ? 'var(--red)' : undefined }}>
            {String(alertCount).padStart(2, '0')} ACTIVE
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="telemetry-item">
          <span className="label-xs">UTC</span>
          <span className="clock">{clock}</span>
        </div>
      </div>
    </header>
  );
};
