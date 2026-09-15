import React from 'react';
import type { DarkContact } from '@/types';
import { getVesselById } from '@/data/vessels';
import { formatUtcClock } from '@/services/time';

export const SatelliteAisComparison: React.FC<{ contact: DarkContact }> = ({ contact }) => {
  const closest = contact.closestVesselId ? getVesselById(contact.closestVesselId) : undefined;

  return (
    <div className="card">
      <div className="label-xs" style={{ marginBottom: 10 }}>Satellite vs AIS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--amber)',
              boxShadow: '0 0 8px rgba(245,166,35,0.6)',
            }}
          />
          <div className="mono" style={{ fontSize: 10.5, marginTop: 6 }}>{formatUtcClock(contact.satelliteTimestampUtc)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Satellite contact</div>
          <div className="mono text-muted" style={{ fontSize: 9.5 }}>
            {contact.latitude.toFixed(4)}°N {contact.longitude.toFixed(4)}°E
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 60, height: 1, background: 'var(--border-active)' }} />
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
            {contact.positionDifferenceKm.toFixed(1)} km
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: contact.aisMatchStatus === 'MATCHED' ? 'var(--green)' : 'var(--cyan)',
              boxShadow: '0 0 8px rgba(55,212,255,0.5)',
            }}
          />
          <div className="mono" style={{ fontSize: 10.5, marginTop: 6 }}>
            {contact.aisLastSeenUtc ? formatUtcClock(contact.aisLastSeenUtc) : '— NO REPORT —'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
            {closest ? closest.name : 'No AIS position'}
          </div>
          <div className="mono text-muted" style={{ fontSize: 9.5 }}>
            {closest ? `${closest.latitude.toFixed(4)}°N ${closest.longitude.toFixed(4)}°E` : '—'}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--border-hairline-soft)',
          fontSize: 10.5,
        }}
      >
        <span className="text-muted">TIME GAP</span>
        <span className="mono">{contact.timeDifferenceMinutes} min</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5 }}>
        <span className="text-muted">POSITION GAP</span>
        <span className="mono">{contact.positionDifferenceKm.toFixed(1)} km</span>
      </div>
    </div>
  );
};
