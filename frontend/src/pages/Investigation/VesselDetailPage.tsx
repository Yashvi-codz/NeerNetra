import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVesselById } from '@/data/vessels';
import { getIncidentById } from '@/data/incidents';
import { getCounterfactualForVessel } from '@/data/counterfactual';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { Badge, statusTone } from '@/components/Badge';
import { CounterfactualPanel } from '@/components/Vessel/CounterfactualPanel';
import { minutesAgo } from '@/services/time';

export const VesselDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vessel = id ? getVesselById(id) : undefined;

  if (!vessel) {
    return (
      <div className="page" style={{ padding: 24 }}>
        <p>Vessel not found.</p>
        <button className="btn" onClick={() => navigate('/overview')}>Back to Overview</button>
      </div>
    );
  }

  const incident = vessel.intelligence ? getIncidentById(vessel.intelligence.incidentId) : undefined;
  const counterfactual = incident ? getCounterfactualForVessel(vessel.id, incident.id) : undefined;

  return (
    <div className="page">
      <div className="map-stage">
        <TacticalMap
          incidents={incident ? [incident] : []}
          vessels={[vessel]}
          activeLayers={{ aisTracks: true, spillMask: Boolean(incident), currentVectors: true, searchRadius: Boolean(incident) }}
          center={[vessel.longitude, vessel.latitude]}
          zoom={9}
          selectedVesselId={vessel.id}
          selectedIncidentId={incident?.id ?? null}
        />
      </div>
      <div className="side-column" style={{ width: 420 }}>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Vessel Investigation</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{vessel.name}</span>
              {vessel.intelligence && <Badge tone={statusTone(vessel.intelligence.investigativeStatus)}>{vessel.intelligence.investigativeStatus}</Badge>}
            </div>
            <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{vessel.type} · {vessel.flag} · {vessel.mmsi}</div>

            <div className="kv-row" style={{ marginTop: 10 }}>
              <span className="kv-label">Position</span>
              <span className="kv-value">{vessel.latitude.toFixed(4)}°N {vessel.longitude.toFixed(4)}°E</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Speed / Course</span>
              <span className="kv-value">{vessel.speedKn.toFixed(1)} kn @ {vessel.courseDeg}°</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">AIS freshness</span>
              <span className="kv-value">{minutesAgo(vessel.lastUpdatedUtc)}</span>
            </div>
            {incident && (
              <div className="kv-row">
                <span className="kv-label">Nearby incident</span>
                <button className="btn" onClick={() => navigate('/investigation', { state: { incidentId: incident.id } })}>
                  {incident.id} →
                </button>
              </div>
            )}
          </div>
        </div>

        {vessel.intelligence && (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Neernetra Intelligence</span>
            </div>
            <div className="panel-body">
              <div className="kv-row"><span className="kv-label">Spill proximity</span><span className="kv-value">{vessel.intelligence.spillProximityKm.toFixed(1)} km</span></div>
              <div className="kv-row"><span className="kv-label">Origin proximity</span><span className="kv-value">{vessel.intelligence.originProximityKm.toFixed(1)} km</span></div>
              <div className="kv-row"><span className="kv-label">Timing compatibility</span><span className="kv-value">{vessel.intelligence.timingCompatibilityScore}/100</span></div>
              <div className="kv-row"><span className="kv-label">Trajectory alignment</span><span className="kv-value">{vessel.intelligence.routeAlignmentScore}/100</span></div>
              <div className="kv-row"><span className="kv-label">Environmental consistency</span><span className="kv-value">{vessel.intelligence.environmentalConsistencyScore}/100</span></div>
              <div className="kv-row" style={{ borderTop: '1px solid var(--border-hairline)', marginTop: 4, paddingTop: 8 }}>
                <span className="kv-label">Association strength</span><span className="kv-value">{vessel.intelligence.associationStrength}/100</span>
              </div>
              {vessel.intelligence.behavioralAnomalies.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div className="kv-label" style={{ marginBottom: 6 }}>Behavioral anomalies</div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
                    {vessel.intelligence.behavioralAnomalies.map((a) => <li key={a} style={{ marginBottom: 4 }}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {counterfactual && <CounterfactualPanel result={counterfactual} vesselName={vessel.name} />}
      </div>
    </div>
  );
};
