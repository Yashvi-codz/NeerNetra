import React from 'react';
import type { HorizonMarker } from '@/data/replay';

interface IncidentHorizonProps {
  markers: HorizonMarker[];
}

export const IncidentHorizon: React.FC<IncidentHorizonProps> = ({ markers }) => (
  <div>
    <div className="panel-header" style={{ paddingBottom: 0 }}>
      <span className="panel-title">Incident Horizon</span>
      <span className="text-muted" style={{ fontSize: 9.5 }}>Phase 3 enables full scrub &amp; replay</span>
    </div>
    <div className="horizon-track">
      {markers.map((m, i) => (
        <React.Fragment key={m.id}>
          <div className="horizon-node">
            <span className="horizon-label">{m.label}</span>
            <span className={`horizon-dot${m.offsetHours === 6 ? ' now' : ''}`} />
            <span className="horizon-time">{m.timestampUtc.slice(11, 16)} UTC</span>
            {m.eventSummary && <span className="horizon-event">{m.eventSummary}</span>}
          </div>
          {i !== markers.length - 1 && <span className="horizon-line" />}
        </React.Fragment>
      ))}
    </div>
  </div>
);
