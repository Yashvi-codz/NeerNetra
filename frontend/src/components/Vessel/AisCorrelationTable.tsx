import React from 'react';
import type { Vessel } from '@/types';
import { Badge, statusTone } from '../Badge';

interface AisCorrelationTableProps {
  vessels: Vessel[];
  selectedVesselId?: string | null;
  onSelectVessel: (vesselId: string) => void;
}

function proximityLabel(km: number): string {
  if (km < 2) return 'DIRECT';
  if (km < 10) return 'OFFSET';
  return 'DISTANT';
}

export const AisCorrelationTable: React.FC<AisCorrelationTableProps> = ({ vessels, selectedVesselId, onSelectVessel }) => {
  const rows = vessels.filter((v) => v.intelligence).sort(
    (a, b) => (b.intelligence?.associationStrength ?? 0) - (a.intelligence?.associationStrength ?? 0)
  );

  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Vessel / MMSI</th>
            <th>Type</th>
            <th>CPA / Distance</th>
            <th>Course</th>
            <th>Speed</th>
            <th>Risk Index</th>
            <th>Audit Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr
              key={v.id}
              className={selectedVesselId === v.id ? 'selected' : ''}
              onClick={() => onSelectVessel(v.id)}
            >
              <td className="name-cell">
                {v.name}
                <div className="text-muted" style={{ fontSize: 9.5 }}>{v.mmsi}</div>
              </td>
              <td>{v.type}</td>
              <td>
                {v.intelligence!.spillProximityKm.toFixed(2)} km ({proximityLabel(v.intelligence!.spillProximityKm)})
              </td>
              <td>{v.courseDeg}°</td>
              <td>{v.speedKn.toFixed(1)} kn</td>
              <td>{v.intelligence!.associationStrength}/100</td>
              <td>
                <Badge tone={statusTone(v.intelligence!.investigativeStatus)}>
                  {v.intelligence!.investigativeStatus}
                </Badge>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-state" style={{ fontFamily: 'var(--font-sans)' }}>
                No AIS traffic has been analyzed against this incident yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
