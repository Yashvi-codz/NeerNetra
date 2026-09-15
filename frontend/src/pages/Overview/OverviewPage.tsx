import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { LayerBar } from '@/components/Map/LayerBar';
import { MapLegend } from '@/components/Map/MapLegend';
import { VesselDrawer } from '@/components/Vessel/VesselDrawer';
import { SpillDrawer } from '@/components/Spill/SpillDrawer';
import { Badge, severityTone, statusTone } from '@/components/Badge';
import { overviewLayers } from '@/data/mapLayers';
import { useLayerToggles } from '@/hooks/useLayerToggles';
import { incidents } from '@/data/incidents';
import { vessels, getVesselById } from '@/data/vessels';
import { getIncidentById } from '@/data/incidents';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOn, toggle } = useLayerToggles(overviewLayers);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const selectedVessel = selectedVesselId ? getVesselById(selectedVesselId) : undefined;
  const selectedIncident = selectedIncidentId ? getIncidentById(selectedIncidentId) : undefined;

  return (
    <div className="page">
      <div className="map-stage">
        <TacticalMap
          incidents={incidents}
          vessels={vessels}
          activeLayers={isOn as never as Record<string, boolean>}
          center={[71.5, 18.2]}
          zoom={5.6}
          selectedVesselId={selectedVesselId}
          selectedIncidentId={selectedIncidentId}
          onVesselClick={(id) => {
            setSelectedIncidentId(null);
            setSelectedVesselId(id);
          }}
          onSpillClick={(id) => {
            setSelectedVesselId(null);
            setSelectedIncidentId(id);
          }}
        />
        <LayerBar layers={overviewLayers} isOn={isOn} onToggle={toggle} />
        <MapLegend />
      </div>

      <div className="side-column">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Regional Situation</span>
          </div>
          <div className="panel-body">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Active Incidents</div>
                <div className="kpi-value red">
                  {incidents.filter((i) => i.status === 'ACTIVE INVESTIGATION').length}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Under Review</div>
                <div className="kpi-value amber">
                  {incidents.filter((i) => i.status === 'UNDER REVIEW').length}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Vessels Tracked</div>
                <div className="kpi-value cyan">{vessels.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Flagged Leads</div>
                <div className="kpi-value red">
                  {vessels.filter((v) => v.intelligence?.investigativeStatus === 'FLAGGED LEAD').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <span className="panel-title">Monitored Incidents</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {incidents.map((inc) => (
              <button
                key={inc.id}
                className="card"
                style={{ textAlign: 'left', width: '100%' }}
                onClick={() => {
                  setSelectedVesselId(null);
                  setSelectedIncidentId(inc.id);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{inc.id}</div>
                    <div className="text-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{inc.region}</div>
                  </div>
                  <Badge tone={severityTone(inc.characteristics.severity)}>{inc.characteristics.severity}</Badge>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '8px 0 6px' }}>{inc.headline}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                  <button
                    className="btn primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/investigation', { state: { incidentId: inc.id } });
                    }}
                  >
                    Investigate →
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedVessel && <VesselDrawer vessel={selectedVessel} onClose={() => setSelectedVesselId(null)} />}
      {selectedIncident && (
        <SpillDrawer
          incident={selectedIncident}
          onClose={() => setSelectedIncidentId(null)}
          onSelectVessel={(vid) => {
            setSelectedIncidentId(null);
            setSelectedVesselId(vid);
          }}
        />
      )}
    </div>
  );
};
