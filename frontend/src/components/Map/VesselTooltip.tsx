import React from 'react';
import type { Vessel } from '@/types';
import { minutesAgo } from '@/services/time';

export const VesselTooltip: React.FC<{ vessel: Vessel }> = ({ vessel }) => (
  <div className="vessel-tooltip">
    <div className="vessel-tooltip-name">{vessel.name}</div>
    <div className="vessel-tooltip-type">{vessel.type}</div>
    <div className="vessel-tooltip-grid">
      <span>SPD {vessel.speedKn.toFixed(1)} kn</span>
      <span>COURSE {vessel.courseDeg}°</span>
      <span style={{ gridColumn: '1 / -1' }}>DESTINATION {vessel.voyage.destination}</span>
      <span style={{ gridColumn: '1 / -1' }}>AIS UPDATED {minutesAgo(vessel.lastUpdatedUtc)}</span>
    </div>
  </div>
);
