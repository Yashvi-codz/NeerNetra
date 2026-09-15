import React, { useState } from 'react';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { SeverityDistributionChart } from '@/components/Charts/SeverityDistributionChart';
import { AffectedAreaChart } from '@/components/Charts/AffectedAreaChart';
import { CauseDistributionChart } from '@/components/Charts/CauseDistributionChart';
import { incidents } from '@/data/incidents';
import { vessels } from '@/data/vessels';

type TrafficMode = 'aisTracks' | 'routeDensity' | 'trafficHeatmap';

const TRAFFIC_CONTROLS: { id: TrafficMode; label: string }[] = [
  { id: 'aisTracks', label: 'LIVE TRAFFIC' },
  { id: 'routeDensity', label: 'ROUTE DENSITY' },
  { id: 'trafficHeatmap', label: 'TRAFFIC HEATMAP' },
];

export const IntelligencePage: React.FC = () => {
  const [trafficMode, setTrafficMode] = useState<TrafficMode>('aisTracks');

  const vesselTypeCounts = vessels.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page" style={{ flexDirection: 'column', overflowY: 'auto', padding: 16, gap: 16, display: 'flex' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel" style={{ border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
          <div className="panel-header">
            <span className="panel-title">Spill Hotspots</span>
          </div>
          <div style={{ height: 260, position: 'relative' }}>
            <TacticalMap
              incidents={incidents}
              vessels={[]}
              activeLayers={{ spillMask: true, coast: true }}
              center={[71.5, 18.2]}
              zoom={4.8}
            />
          </div>
        </div>

        <div className="panel" style={{ border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
          <div className="panel-header">
            <span className="panel-title">Severity Distribution</span>
          </div>
          <div className="panel-body">
            <SeverityDistributionChart />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel" style={{ border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
          <div className="panel-header">
            <span className="panel-title">Affected Area Over Time</span>
          </div>
          <div className="panel-body">
            <AffectedAreaChart />
          </div>
        </div>

        <div className="panel" style={{ border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
          <div className="panel-header">
            <span className="panel-title">Probable Cause Distribution</span>
          </div>
          <div className="panel-body">
            <CauseDistributionChart />
          </div>
        </div>
      </div>

      <div className="panel" style={{ border: '1px solid var(--border-hairline-soft)', borderRadius: 4 }}>
        <div className="panel-header">
          <span className="panel-title">Vessel Activity &amp; Maritime Routes</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {TRAFFIC_CONTROLS.map((ctrl) => (
              <button
                key={ctrl.id}
                className={`btn${trafficMode === ctrl.id ? ' primary' : ''}`}
                onClick={() => setTrafficMode(ctrl.id)}
              >
                {ctrl.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 340, position: 'relative' }}>
          <TacticalMap
            incidents={incidents}
            vessels={vessels}
            activeLayers={{
              spillMask: true,
              aisTracks: trafficMode === 'aisTracks',
              routeDensity: trafficMode === 'routeDensity',
              trafficHeatmap: trafficMode === 'trafficHeatmap',
            }}
            center={[71.5, 18.2]}
            zoom={5.0}
          />
        </div>
        <div className="panel-body">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card">
              <div className="kpi-label">AIS Coverage</div>
              <div className="kpi-value cyan">DEMO</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Last Updated</div>
              <div className="kpi-value" style={{ fontSize: 13 }}>14:32 UTC</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Vessels</div>
              <div className="kpi-value">{vessels.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Active Routes</div>
              <div className="kpi-value">{Object.keys(vesselTypeCounts).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
