import React from 'react';
import type { DarkContact } from '@/types';
import { Drawer, DrawerSection } from '../SideDrawer/Drawer';
import { Badge, statusTone } from '../Badge';
import { formatUtcClock } from '@/services/time';
import { getVesselById } from '@/data/vessels';
import { SatelliteAisComparison } from '../Vessel/SatelliteAisComparison';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="kv-row">
    <span className="kv-label">{label}</span>
    <span className="kv-value">{value}</span>
  </div>
);

export const DarkContactDrawer: React.FC<{ contact: DarkContact; onClose: () => void }> = ({ contact, onClose }) => {
  const closest = contact.closestVesselId ? getVesselById(contact.closestVesselId) : undefined;

  return (
    <Drawer title={contact.contactId} subtitle={`Incident ${contact.incidentId}`} onClose={onClose}>
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Badge tone={statusTone(contact.status)}>{contact.status}</Badge>
        <Badge tone={contact.priority === 'HIGH' || contact.priority === 'CRITICAL' ? 'red' : contact.priority === 'MODERATE' ? 'amber' : 'green'}>
          {contact.priority}
        </Badge>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <SatelliteAisComparison contact={contact} />
      </div>

      <DrawerSection num="01" title="Satellite Observation">
        <Row label="Source" value={contact.source} />
        <Row label="Timestamp" value={formatUtcClock(contact.satelliteTimestampUtc)} />
        <Row label="Latitude" value={contact.latitude.toFixed(4)} />
        <Row label="Longitude" value={contact.longitude.toFixed(4)} />
        <Row label="Estimated type" value={contact.estimatedType} />
        <Row label="Detection confidence" value={`${contact.satelliteConfidencePct.toFixed(1)}%`} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="02" title="AIS Correlation">
        <Row label="Match status" value={contact.aisMatchStatus} />
        <Row label="Match confidence" value={`${contact.matchConfidencePct}%`} />
        <Row label="Search radius" value={`${contact.searchRadiusKm} km`} />
        <Row label="Records checked" value={contact.recordsChecked} />
        <Row label="Closest AIS vessel" value={closest ? closest.name : '—'} />
        <Row label="AIS last seen" value={contact.aisLastSeenUtc ? formatUtcClock(contact.aisLastSeenUtc) : '—'} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="03" title="Spatial Evidence">
        <Row label="Distance to spill" value={`${contact.distanceToSpillKm.toFixed(1)} km`} />
        <Row label="Distance to origin" value={`${contact.distanceToOriginKm.toFixed(1)} km`} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="04" title="Temporal Evidence">
        <Row label="Satellite time" value={formatUtcClock(contact.satelliteTimestampUtc)} />
        <Row label="AIS time" value={contact.aisLastSeenUtc ? formatUtcClock(contact.aisLastSeenUtc) : '—'} />
        <Row label="Time gap" value={`${contact.timeDifferenceMinutes} min`} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="05" title="Investigative Signals">
        <Row label="Proximity" value={`${contact.distanceToSpillKm.toFixed(1)} km to spill`} />
        <Row label="Origin proximity" value={`${contact.distanceToOriginKm.toFixed(1)} km to origin`} />
        <Row label="AIS correlation" value={contact.aisMatchStatus} />
        <Row label="Temporal consistency" value={contact.timeDifferenceMinutes <= 15 ? 'HIGH' : contact.timeDifferenceMinutes <= 45 ? 'MODERATE' : 'LOW'} />
      </DrawerSection>

      <div className="section-divider" />
      <DrawerSection num="06" title="Status">
        <div style={{ marginBottom: 10 }}>
          <Badge tone={statusTone(contact.status)}>{contact.status}</Badge>
        </div>
        <div className="kv-label" style={{ marginBottom: 6 }}>Possible explanations</div>
        <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 11 }}>
          {contact.possibleExplanations.map((e) => (
            <li key={e} style={{ marginBottom: 4, lineHeight: 1.4 }}>{e}</li>
          ))}
        </ul>
      </DrawerSection>
    </Drawer>
  );
};
