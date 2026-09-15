import React from 'react';
import type { DarkContact } from '@/types';
import { Badge, statusTone } from '../Badge';
import { formatUtcClock } from '@/services/time';
import { getVesselById } from '@/data/vessels';
import { getIncidentById } from '@/data/incidents';

interface DarkContactTableProps {
  contacts: DarkContact[];
  selectedId?: string | null;
  onSelect: (contactId: string) => void;
}

export const DarkContactTable: React.FC<DarkContactTableProps> = ({ contacts, selectedId, onSelect }) => (
  <div className="scroll-y" style={{ flex: 1 }}>
    <table className="data-table">
      <thead>
        <tr>
          <th>Contact ID</th>
          <th>Incident</th>
          <th>Detection Time</th>
          <th>Location</th>
          <th>Dist. Spill</th>
          <th>Dist. Origin</th>
          <th>Type</th>
          <th>AIS Match</th>
          <th>AIS Last Seen</th>
          <th>Time Δ</th>
          <th>Pos. Δ</th>
          <th>Source</th>
          <th>Match Conf.</th>
          <th>Priority</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => {
          const closest = c.closestVesselId ? getVesselById(c.closestVesselId) : undefined;
          const incident = getIncidentById(c.incidentId);
          return (
            <tr key={c.contactId} className={selectedId === c.contactId ? 'selected' : ''} onClick={() => onSelect(c.contactId)}>
              <td className="name-cell">{c.contactId}</td>
              <td>{incident?.id ?? c.incidentId}</td>
              <td>{formatUtcClock(c.satelliteTimestampUtc)}</td>
              <td>{c.latitude.toFixed(3)}, {c.longitude.toFixed(3)}</td>
              <td>{c.distanceToSpillKm.toFixed(1)} km</td>
              <td>{c.distanceToOriginKm.toFixed(1)} km</td>
              <td>{c.estimatedType.split(' (')[0]}</td>
              <td>{c.aisMatchStatus}</td>
              <td>{c.aisLastSeenUtc ? formatUtcClock(c.aisLastSeenUtc) : '—'}</td>
              <td>{c.timeDifferenceMinutes}m</td>
              <td>{c.positionDifferenceKm.toFixed(1)} km</td>
              <td>{c.source}</td>
              <td>{c.matchConfidencePct}%</td>
              <td>
                <Badge tone={c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'red' : c.priority === 'MODERATE' ? 'amber' : 'green'}>
                  {c.priority}
                </Badge>
              </td>
              <td>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </td>
            </tr>
          );
        })}
        {contacts.length === 0 && (
          <tr>
            <td colSpan={15} className="empty-state" style={{ fontFamily: 'var(--font-sans)' }}>
              No dark contacts match the current filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
