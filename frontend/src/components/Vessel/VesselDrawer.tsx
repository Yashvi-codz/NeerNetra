import React from 'react';
import type { Vessel } from '@/types';
import { Drawer, DrawerSection } from '../SideDrawer/Drawer';
import { Badge, statusTone } from '../Badge';
import { minutesAgo, formatUtcClock, formatUtcDate } from '@/services/time';
import { getTrajectoryForVessel } from '@/data/aisTrajectories';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="kv-row">
    <span className="kv-label">{label}</span>
    <span className="kv-value">{value}</span>
  </div>
);

interface VesselDrawerProps {
  vessel: Vessel;
  onClose: () => void;
}

export const VesselDrawer: React.FC<VesselDrawerProps> = ({ vessel, onClose }) => {
  const trajectory = getTrajectoryForVessel(vessel.id);

  return (
    <Drawer title={vessel.name} subtitle={`${vessel.type} · ${vessel.flag}`} onClose={onClose}>
      <DrawerSection num="01" title="Live Status">
        <Row label="Position" value={`${vessel.latitude.toFixed(4)}°N ${vessel.longitude.toFixed(4)}°E`} />
        <Row label="Speed" value={`${vessel.speedKn.toFixed(1)} kn`} />
        <Row label="Course" value={`${vessel.courseDeg}°`} />
        <Row label="Heading" value={`${vessel.headingDeg}°`} />
        <Row label="Nav status" value={vessel.navStatus} />
        <Row label="AIS source" value={vessel.aisSource} />
        <Row label="Last update" value={formatUtcClock(vessel.lastUpdatedUtc)} />
        <Row label="AIS freshness" value={minutesAgo(vessel.lastUpdatedUtc)} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="02" title="Identity">
        <Row label="Name" value={vessel.name} />
        <Row label="IMO" value={vessel.imo} />
        <Row label="MMSI" value={vessel.mmsi} />
        <Row label="Callsign" value={vessel.callsign} />
        <Row label="Type" value={vessel.type} />
        <Row label="Flag" value={vessel.flag} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="03" title="Voyage">
        <Row label="Destination" value={vessel.voyage.destination} />
        <Row label="ETA" value={formatUtcClock(vessel.voyage.etaUtc)} />
        <Row label="Departure port" value={vessel.voyage.departurePort} />
        <Row label="Last port" value={vessel.voyage.lastPort} />
        <Row label="Departure country" value={vessel.voyage.departurePortCountry} />
        <Row label="Last port country" value={vessel.voyage.lastPortCountry} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="04" title="Particulars">
        <Row label="Built" value={vessel.particulars.builtYear} />
        <Row label="Builder" value={vessel.particulars.builder} />
        <Row label="Length" value={`${vessel.particulars.dimensions.lengthM} m`} />
        <Row label="Beam" value={`${vessel.particulars.dimensions.beamM} m`} />
        <Row label="Draught" value={`${vessel.particulars.dimensions.maxDraughtM} m`} />
        <Row label="GT" value={vessel.particulars.dimensions.grossTonnage.toLocaleString()} />
        <Row label="NT" value={vessel.particulars.dimensions.netTonnage.toLocaleString()} />
        <Row label="DWT" value={vessel.particulars.dimensions.deadweightTonnage.toLocaleString()} />
        {vessel.particulars.dimensions.teu !== undefined && (
          <Row label="TEU" value={vessel.particulars.dimensions.teu.toLocaleString()} />
        )}
        {vessel.particulars.dimensions.crudeCapacityBbl !== undefined && (
          <Row label="Crude capacity" value={`${vessel.particulars.dimensions.crudeCapacityBbl.toLocaleString()} bbl`} />
        )}
        {vessel.particulars.dimensions.gasCapacityM3 !== undefined && (
          <Row label="Gas capacity" value={`${vessel.particulars.dimensions.gasCapacityM3.toLocaleString()} m³`} />
        )}
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="05" title="Ownership">
        <Row label="Owner" value={vessel.ownership.owner} />
        <Row label="Manager" value={vessel.ownership.manager} />
        <Row label="Class" value={vessel.ownership.classificationSociety} />
      </DrawerSection>

      {vessel.intelligence && (
        <>
          <div className="section-divider" />
          <DrawerSection num="06" title="Neernetra Intelligence">
            <div style={{ marginBottom: 10 }}>
              <Badge tone={statusTone(vessel.intelligence.investigativeStatus)}>
                {vessel.intelligence.investigativeStatus}
              </Badge>
            </div>
            <Row label="Spill proximity" value={`${vessel.intelligence.spillProximityKm.toFixed(1)} km`} />
            <Row label="Origin proximity" value={`${vessel.intelligence.originProximityKm.toFixed(1)} km`} />
            <Row label="Route alignment" value={`${vessel.intelligence.routeAlignmentScore}/100`} />
            <Row label="Timing compatibility" value={`${vessel.intelligence.timingCompatibilityScore}/100`} />
            <Row label="Environmental consistency" value={`${vessel.intelligence.environmentalConsistencyScore}/100`} />
            <Row label="Association strength" value={`${vessel.intelligence.associationStrength}/100`} />
            {vessel.intelligence.behavioralAnomalies.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div className="kv-label" style={{ marginBottom: 6 }}>Behavioral anomalies</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 11 }}>
                  {vessel.intelligence.behavioralAnomalies.map((a) => (
                    <li key={a} style={{ marginBottom: 4 }}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {vessel.intelligence.notes && (
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                {vessel.intelligence.notes}
              </p>
            )}
            <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-hairline)', lineHeight: 1.4 }}>
              Investigative lead only. Correlation does not establish vessel responsibility.
            </p>
          </DrawerSection>
        </>
      )}

      <div className="section-divider" />
      <DrawerSection num={vessel.intelligence ? '07' : '06'} title="Activity">
        {vessel.activity.aisGaps.length === 0 &&
        vessel.activity.speedChanges.length === 0 &&
        vessel.activity.courseChanges.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 11 }}>No AIS gaps or notable maneuvers in the recent activity window.</p>
        ) : (
          <>
            {vessel.activity.aisGaps.map((g, i) => (
              <Row
                key={`gap-${i}`}
                label={`AIS gap · ${formatUtcDate(g.startUtc)}`}
                value={`${g.durationMinutes} min`}
              />
            ))}
            {vessel.activity.speedChanges.map((s, i) => (
              <Row
                key={`spd-${i}`}
                label={`Speed change · ${formatUtcClock(s.timestampUtc)}`}
                value={`${s.fromKn} → ${s.toKn} kn`}
              />
            ))}
            {vessel.activity.courseChanges.map((c, i) => (
              <Row
                key={`crs-${i}`}
                label={`Course change · ${formatUtcClock(c.timestampUtc)}`}
                value={`${c.fromDeg}° → ${c.toDeg}°`}
              />
            ))}
          </>
        )}
        {trajectory && (
          <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 10 }}>
            Recent trajectory highlighted on map · {trajectory.points.length} AIS points in window.
          </p>
        )}
      </DrawerSection>
    </Drawer>
  );
};
