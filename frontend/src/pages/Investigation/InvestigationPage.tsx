import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { LayerBar } from '@/components/Map/LayerBar';
import { MapLegend } from '@/components/Map/MapLegend';
import { VesselDrawer } from '@/components/Vessel/VesselDrawer';
import { IncidentConsoleHeader } from '@/components/Incident/IncidentConsoleHeader';
import { SpillCharacteristicsPanel } from '@/components/Incident/SpillCharacteristicsPanel';
import { EnvironmentTelemetry } from '@/components/Incident/EnvironmentTelemetry';
import { CauseAnalysisPanel } from '@/components/Incident/CauseAnalysisPanel';
import { ResponsePriorityPanel } from '@/components/Incident/ResponsePriorityPanel';
import { ForecastPanel } from '@/components/Forecast/ForecastPanel';
import { ImpactAnalysisPanel } from '@/components/Impact/ImpactAnalysisPanel';
import { CounterfactualPanel } from '@/components/Vessel/CounterfactualPanel';
import { AisCorrelationTable } from '@/components/Vessel/AisCorrelationTable';
import { IncidentHorizon } from '@/components/Timeline/IncidentHorizon';
import { Badge, statusTone } from '@/components/Badge';
import { investigationLayers } from '@/data/mapLayers';
import { useLayerToggles } from '@/hooks/useLayerToggles';
import { incidents, getIncidentById } from '@/data/incidents';
import { vessels, getVesselById } from '@/data/vessels';
import { incidentHorizon } from '@/data/replay';
import { getDarkContactsForIncident } from '@/data/darkContacts';
import { getCounterfactualForVessel } from '@/data/counterfactual';
import { getCauseAnalysisForIncident } from '@/data/causeAnalysis';

export const InvestigationPage: React.FC = () => {
  const location = useLocation() as { state?: { incidentId?: string } };
  const navigate = useNavigate();
  const [incidentId, setIncidentId] = useState(location.state?.incidentId ?? 'NEER-001');
  const incident = getIncidentById(incidentId) ?? incidents[0];
  const { isOn, toggle } = useLayerToggles(investigationLayers);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const selectedVessel = selectedVesselId ? getVesselById(selectedVesselId) : undefined;
  const selectedVesselCounterfactual = selectedVessel
    ? getCounterfactualForVessel(selectedVessel.id, incident.id)
    : undefined;
  const causeAnalysis = getCauseAnalysisForIncident(incident.id);

  const relevantVessels = useMemo(
    () => vessels.filter((v) => v.intelligence?.incidentId === incident.id),
    [incident.id]
  );
  const darkContacts = getDarkContactsForIncident(incident.id);

  return (
    <div className="investigation-shell">
      <IncidentConsoleHeader incident={incident} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-hairline)' }}>
        <span className="replay-mode-badge live">
          <span className="status-dot green pulse" /> LIVE MODE
        </span>
        <button className="btn primary" onClick={() => navigate(`/replay/${incident.id}`)}>
          ▶ Start Time-Based Incident Replay
        </button>
      </div>

      <div className="investigation-body">
        <div className="left-column">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Select Incident</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  className={`layer-chip${inc.id === incident.id ? ' on' : ''}`}
                  onClick={() => {
                    setIncidentId(inc.id);
                    setSelectedVesselId(null);
                  }}
                >
                  {inc.id} — {inc.region}
                </button>
              ))}
            </div>
          </div>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title">Dark Contacts</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {darkContacts.length === 0 && <p className="text-muted" style={{ fontSize: 11 }}>None identified for this incident.</p>}
              {darkContacts.map((dc) => (
                <div className="card" key={dc.contactId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 10.5 }}>{dc.contactId}</span>
                    <Badge tone={statusTone(dc.status)}>{dc.status}</Badge>
                  </div>
                  <div className="text-muted" style={{ fontSize: 10, marginTop: 4 }}>{dc.estimatedType}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>
                    {dc.distanceToOriginKm.toFixed(1)} km from origin · priority {dc.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="map-stage">
          <TacticalMap
            incidents={[incident]}
            vessels={relevantVessels}
            activeLayers={isOn as never as Record<string, boolean>}
            center={[incident.characteristics.centroid.longitude, incident.characteristics.centroid.latitude]}
            zoom={10.2}
            focusIncident={incident}
            selectedIncidentId={incident.id}
            selectedVesselId={selectedVesselId}
            onVesselClick={(id) => setSelectedVesselId(id)}
          />
          <LayerBar title="INVESTIGATION LAYERS" layers={investigationLayers} isOn={isOn} onToggle={toggle} />
          <MapLegend />
        </div>

        <div className="side-column">
          <SpillCharacteristicsPanel incident={incident} />
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Environmental Telemetry</span>
            </div>
            <div className="panel-body">
              <EnvironmentTelemetry environment={incident.environment} />
            </div>
          </div>
          {selectedVessel && selectedVesselCounterfactual && (
            <CounterfactualPanel result={selectedVesselCounterfactual} vesselName={selectedVessel.name} />
          )}
          <ImpactAnalysisPanel incident={incident} />
          <ForecastPanel incident={incident} />
          {causeAnalysis && <CauseAnalysisPanel result={causeAnalysis} />}
          <ResponsePriorityPanel incident={incident} />
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Dark Vessel Correlation</span>
            </div>
            <div className="panel-body">
              <p className="text-muted" style={{ fontSize: 11 }}>
                {darkContacts.length} dark contact(s) identified for this incident.
              </p>
              <button className="btn primary" style={{ width: '100%', marginTop: 6 }} onClick={() => navigate('/intelligence/dark-vessels')}>
                Open Dark Vessel Intelligence →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="investigation-bottom">
        <IncidentHorizon markers={incidentHorizon[incident.id] ?? []} />
        <div className="section-divider" />
        <div className="panel-header" style={{ paddingBottom: 0 }}>
          <span className="panel-title">AIS Spatio-Temporal Correlation Matrix</span>
          <span className="text-muted" style={{ fontSize: 9.5 }}>Phase 2 adds analytical scoring</span>
        </div>
        <AisCorrelationTable
          vessels={relevantVessels}
          selectedVesselId={selectedVesselId}
          onSelectVessel={(id) => setSelectedVesselId(id)}
        />
      </div>

      {selectedVessel && <VesselDrawer vessel={selectedVessel} onClose={() => setSelectedVesselId(null)} />}
    </div>
  );
};
