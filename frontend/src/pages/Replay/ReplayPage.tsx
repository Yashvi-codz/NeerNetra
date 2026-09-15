import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { MapLegend } from '@/components/Map/MapLegend';
import { ReplayControls } from '@/components/Replay/ReplayControls';
import { ReplayEventList } from '@/components/Replay/ReplayEventList';
import { VesselDrawer } from '@/components/Vessel/VesselDrawer';
import { getIncidentById } from '@/data/incidents';
import { vessels, getVesselById } from '@/data/vessels';
import { getReplayEvents } from '@/data/replay';
import { useReplayClock } from '@/hooks/useReplayClock';
import { buildReplaySnapshot, offsetToTimestamp } from '@/services/replayEngine';
import type { ReplayEvent } from '@/types';

export const ReplayPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const incident = incidentId ? getIncidentById(incidentId) : undefined;
  const clock = useReplayClock(-24);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  const relevantVessels = useMemo(
    () => (incident ? vessels.filter((v) => v.intelligence?.incidentId === incident.id) : []),
    [incident]
  );
  const events = incident ? getReplayEvents(incident.id) : [];

  if (!incident) {
    return (
      <div className="page" style={{ padding: 24 }}>
        <p>Incident not found.</p>
        <button className="btn" onClick={() => navigate('/reports/incidents')}>Back to reports</button>
      </div>
    );
  }

  const snapshot = buildReplaySnapshot(incident, relevantVessels, clock.offsetHours);
  const currentMs = offsetToTimestamp(incident, clock.offsetHours);
  const currentTimeLabel = new Date(currentMs).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

  const activeEvents = events.filter((e) => e.offsetHours <= clock.offsetHours);
  const lastEvent = activeEvents[activeEvents.length - 1];

  const selectedVessel = selectedVesselId ? getVesselById(selectedVesselId) : undefined;

  const activeLayers = {
    spillMask: snapshot.spillVisible,
    driftBoundary: snapshot.forecastVisible,
    aisTracks: true,
    sarEvents: clock.offsetHours >= 0.9,
    currentVectors: true,
    windVectors: false,
    probableOrigin: snapshot.originVisible,
    releaseZone: snapshot.originVisible,
    searchRadius: snapshot.originVisible,
    candidateVessels: true,
    fishingZones: snapshot.impactVisible,
    mpas: snapshot.impactVisible,
    coast: true,
    forecastFootprint: snapshot.forecastVisible && clock.offsetHours >= 6,
  };

  const onSelectEvent = (event: ReplayEvent) => {
    clock.scrubTo(event.offsetHours);
    if (event.relatedVesselId) setSelectedVesselId(event.relatedVesselId);
  };

  return (
    <div className="investigation-shell">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border-hairline)', background: 'var(--bg-panel)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="replay-mode-badge replay">
            <span className="status-dot amber pulse" /> REPLAY MODE
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{incident.id} — Time-Based Incident Replay</div>
            <div className="label-xs" style={{ marginTop: 2 }}>{incident.sector}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => navigate(`/reports/incidents/${incident.id}`)}>
            ← Back to Report
          </button>
          <button className="btn" onClick={() => navigate('/investigation', { state: { incidentId: incident.id } })}>
            Exit to Live Investigation
          </button>
        </div>
      </div>

      <div className="investigation-body">
        <div className="map-stage">
          <TacticalMap
            incidents={[snapshot.incident]}
            vessels={snapshot.vessels}
            activeLayers={activeLayers}
            center={[incident.characteristics.centroid.longitude, incident.characteristics.centroid.latitude]}
            zoom={10}
            focusIncident={incident}
            selectedVesselId={selectedVesselId}
            onVesselClick={(id) => setSelectedVesselId(id)}
          />
          <MapLegend />
          <div className="layer-bar" style={{ left: 'auto', right: 12 }}>
            <div className="layer-bar-title">Replay State @ T{clock.offsetHours >= 0 ? '+' : ''}{clock.offsetHours.toFixed(1)}H</div>
            <div style={{ padding: '0 6px 6px', fontSize: 10.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Spill area: {snapshot.incident.characteristics.areaKm2.toFixed(1)} km²</span>
              <span>Last event: {lastEvent ? lastEvent.title : '—'}</span>
            </div>
          </div>
        </div>

        <div className="side-column">
          <ReplayEventList events={events} currentOffsetHours={clock.offsetHours} onSelectEvent={onSelectEvent} />
        </div>
      </div>

      <ReplayControls
        offsetHours={clock.offsetHours}
        playing={clock.playing}
        speed={clock.speed}
        minOffset={clock.minOffset}
        maxOffset={clock.maxOffset}
        events={events}
        currentTimeLabel={currentTimeLabel}
        onTogglePlay={clock.togglePlay}
        onStepBack={() => clock.stepBack(1)}
        onStepForward={() => clock.stepForward(1)}
        onSetSpeed={clock.setSpeed}
        onScrub={clock.scrubTo}
      />

      {selectedVessel && <VesselDrawer vessel={selectedVessel} onClose={() => setSelectedVesselId(null)} />}
    </div>
  );
};
