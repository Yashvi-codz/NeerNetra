import React from 'react';
import type { Incident } from '@/types';
import { Drawer, DrawerSection } from '../SideDrawer/Drawer';
import { Badge, severityTone, statusTone } from '../Badge';
import { formatUtcClock, formatUtcDate } from '@/services/time';
import { getVesselById } from '@/data/vessels';
import { EvidenceChain } from '../EvidenceChain/EvidenceChain';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="kv-row">
    <span className="kv-label">{label}</span>
    <span className="kv-value">{value}</span>
  </div>
);

interface SpillDrawerProps {
  incident: Incident;
  onClose: () => void;
  onSelectVessel?: (vesselId: string) => void;
}

export const SpillDrawer: React.FC<SpillDrawerProps> = ({ incident, onClose, onSelectVessel }) => (
  <Drawer title={incident.id} subtitle={incident.headline} onClose={onClose}>
    <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <Badge tone={statusTone(incident.status)}>{incident.status}</Badge>
      <Badge tone={severityTone(incident.characteristics.severity)}>{incident.characteristics.severity}</Badge>
      <span className="demo-tag">DEMO MODEL OUTPUT</span>
    </div>

    <DrawerSection num="01" title="Detection">
      <Row label="Incident ID" value={incident.id} />
      <Row label="Status" value={incident.status} />
      <Row label="Detection time" value={formatUtcClock(incident.detection.detectedUtc)} />
      <Row label="Satellite" value={incident.detection.satellite} />
      <Row label="Sensor" value={incident.detection.sensor} />
      <Row label="Acquisition" value={formatUtcClock(incident.detection.acquisitionUtc)} />
      <Row label="Source image" value={incident.detection.sourceImageId} />
      <Row label="Confidence" value={`${incident.detection.confidencePct.toFixed(1)}%`} />
      <Row label="Detection method" value={incident.detection.detectionMethod} />
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="02" title="Spill Characteristics">
      <Row label="Area" value={`${incident.characteristics.areaKm2.toFixed(1)} km²`} />
      <Row label="Length" value={`${incident.characteristics.lengthKm.toFixed(1)} km`} />
      <Row label="Width" value={`${incident.characteristics.widthKm.toFixed(1)} km`} />
      <Row
        label="Centroid"
        value={`${incident.characteristics.centroid.latitude.toFixed(4)}°N ${incident.characteristics.centroid.longitude.toFixed(4)}°E`}
      />
      <Row
        label="Bounding box"
        value={`${incident.characteristics.boundingBox.north.toFixed(2)}/${incident.characteristics.boundingBox.south.toFixed(2)}/${incident.characteristics.boundingBox.east.toFixed(2)}/${incident.characteristics.boundingBox.west.toFixed(2)}`}
      />
      <Row label="Severity" value={incident.characteristics.severity} />
      <Row label="Confidence" value={`${incident.characteristics.confidencePct.toFixed(1)}%`} />
      <Row label="Shape" value={incident.characteristics.shapeDescription} />
      <Row label="Segments" value={incident.characteristics.segments} />
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="03" title="Environment">
      <Row label="Current" value={`${incident.environment.currentSpeedKn.toFixed(1)} kn @ ${incident.environment.currentDirectionDeg}°`} />
      <Row label="Wind" value={`${incident.environment.windSpeedKt.toFixed(1)} kt @ ${incident.environment.windDirectionDeg}°`} />
      <Row label="Waves" value={`${incident.environment.waveHeightM.toFixed(1)} m`} />
      <Row label="SST" value={`${incident.environment.seaSurfaceTempC.toFixed(1)}°C`} />
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="04" title="Hindcast">
      <Row
        label="Probable origin"
        value={`${incident.hindcast.probableOriginPoint.latitude.toFixed(4)}°N ${incident.hindcast.probableOriginPoint.longitude.toFixed(4)}°E`}
      />
      <Row
        label="Release window"
        value={`${formatUtcClock(incident.hindcast.estimatedReleaseStartUtc)} – ${formatUtcClock(incident.hindcast.estimatedReleaseEndUtc)}`}
      />
      <Row label="Trajectory points" value={incident.hindcast.trajectoryPoints.length} />
      <Row label="Confidence" value={`${incident.hindcast.confidencePct.toFixed(0)}%`} />
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="05" title="Impact">
      <Row label="Affected area" value={`${incident.impact.affectedAreaKm2.toFixed(1)} km²`} />
      <Row label="Fishing zones at risk" value={incident.impact.fishingZonesAtRisk.length || '—'} />
      <Row label="MPAs at risk" value={incident.impact.mpasAtRisk.length || '—'} />
      <Row label="Coastline distance" value={`${incident.impact.coastlineDistanceKm.toFixed(1)} km`} />
      <Row
        label="Coastline ETA"
        value={incident.impact.coastlineEtaHours !== null ? `${incident.impact.coastlineEtaHours} hr` : 'N/A'}
      />
      {incident.impact.fishingZonesAtRisk.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="kv-label" style={{ marginBottom: 6 }}>Zones</div>
          <div className="chip-row">
            {incident.impact.fishingZonesAtRisk.map((z) => (
              <span className="badge amber" key={z}>{z}</span>
            ))}
            {incident.impact.mpasAtRisk.map((z) => (
              <span className="badge cyan" key={z}>{z}</span>
            ))}
          </div>
        </div>
      )}
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="06" title="Vessel Connection">
      <Row label="Vessels analyzed" value={incident.vesselConnection.vesselsAnalyzed} />
      <Row label="Top association" value={`${incident.vesselConnection.topAssociationStrength}/100`} />
      {incident.vesselConnection.candidateVesselIds.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 11, marginTop: 8 }}>No candidate vessels identified for this incident.</p>
      ) : (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {incident.vesselConnection.candidateVesselIds.map((vid) => {
            const v = getVesselById(vid);
            if (!v) return null;
            return (
              <button
                key={vid}
                className="card"
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                onClick={() => onSelectVessel?.(vid)}
              >
                <span>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{v.name}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>{v.type}</div>
                </span>
                {v.intelligence && (
                  <Badge tone={statusTone(v.intelligence.investigativeStatus)}>
                    {v.intelligence.investigativeStatus}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="07" title="Neernetra Risk">
      <Row label="Environmental" value={<Badge tone={severityTone(incident.impact.environmentalRisk)}>{incident.impact.environmentalRisk}</Badge>} />
      <Row label="Fisheries" value={<Badge tone={severityTone(incident.impact.fisheriesRisk)}>{incident.impact.fisheriesRisk}</Badge>} />
      <Row label="Coastal" value={<Badge tone={severityTone(incident.impact.coastalRisk)}>{incident.impact.coastalRisk}</Badge>} />
      <Row label="Maritime" value={<Badge tone={severityTone(incident.impact.maritimeRisk)}>{incident.impact.maritimeRisk}</Badge>} />
      <Row
        label="Overall response priority"
        value={<Badge tone={severityTone(incident.impact.overallResponsePriority)}>{incident.impact.overallResponsePriority}</Badge>}
      />
      <p className="text-muted" style={{ fontSize: 10.5, marginTop: 8 }}>
        Probable cause: {incident.probableCause}. Investigative language only — see docs/ARCHITECTURE.md.
      </p>
    </DrawerSection>

    <div className="section-divider" />
    <DrawerSection num="08" title="Evidence Chain">
      <EvidenceChain entries={incident.evidenceChain} />
    </DrawerSection>

    <div style={{ padding: '4px 16px 20px' }}>
      <span className="text-muted" style={{ fontSize: 9.5 }}>
        Updated {formatUtcDate(incident.updatedUtc)} · {formatUtcClock(incident.updatedUtc)}
      </span>
    </div>
  </Drawer>
);
