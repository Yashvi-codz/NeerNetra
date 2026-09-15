import React from 'react';

const ROWS: { swatch: React.ReactNode; label: string }[] = [
  { swatch: <span style={{ width: 10, height: 10, background: '#ff4d4f', borderRadius: 2 }} />, label: 'SPILL' },
  { swatch: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#37d4ff', border: '1px solid #0b131e' }} />, label: 'DETECTION POINT' },
  { swatch: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', border: '1px solid #0b131e' }} />, label: 'PROBABLE ORIGIN' },
  { swatch: <span style={{ width: 12, height: 2, background: '#f5a623' }} />, label: 'DRIFT BOUNDARY' },
  { swatch: <span style={{ width: 12, height: 2, background: '#37d4ff' }} />, label: 'AIS TRACK' },
  { swatch: <span style={{ width: 12, height: 2, background: '#f5a623' }} />, label: 'ROUTE DENSITY' },
  { swatch: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5a623', border: '1px solid #0b131e' }} />, label: 'SATELLITE CONTACT' },
  { swatch: <span style={{ width: 12, height: 2, borderTop: '1px dashed #37d4ff' }} />, label: 'SEARCH RADIUS' },
  { swatch: <span style={{ width: 12, height: 2, background: '#37d4ff' }} />, label: 'CURRENT' },
  { swatch: <span style={{ width: 12, height: 2, borderTop: '1px dashed #a98cf0' }} />, label: 'WIND' },
  { swatch: <span style={{ width: 12, height: 2, background: '#cfe3f0' }} />, label: 'COASTLINE' },
  { swatch: <span style={{ width: 10, height: 10, background: '#35d399', opacity: 0.5 }} />, label: 'FISHING ZONE' },
  { swatch: <span style={{ width: 10, height: 10, border: '1.4px dashed #37d4ff' }} />, label: 'MPA' },
];

export const MapLegend: React.FC = () => (
  <div className="map-legend">
    {ROWS.map((row) => (
      <div className="map-legend-row" key={row.label}>
        {row.swatch}
        <span>{row.label}</span>
      </div>
    ))}
  </div>
);
