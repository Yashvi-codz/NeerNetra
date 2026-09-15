import React, { useMemo, useState } from 'react';
import { TacticalMap } from '@/components/Map/TacticalMap';
import { MapLegend } from '@/components/Map/MapLegend';
import { DarkVesselKpiCards } from '@/components/Vessel/DarkVesselKpiCards';
import { DarkVesselFilters, type DarkVesselFilterState } from '@/components/Vessel/DarkVesselFilters';
import { DarkContactTable } from '@/components/Vessel/DarkContactTable';
import { DarkContactDrawer } from '@/components/Vessel/DarkContactDrawer';
import { darkContacts } from '@/data/darkContacts';
import { incidents, getIncidentById } from '@/data/incidents';
import { vessels } from '@/data/vessels';

export const DarkVesselsPage: React.FC = () => {
  const [filters, setFilters] = useState<DarkVesselFilterState>({ incidentId: 'ALL', priority: 'ALL', status: 'ALL' });
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      darkContacts.filter((c) => {
        if (filters.incidentId !== 'ALL' && c.incidentId !== filters.incidentId) return false;
        if (filters.priority !== 'ALL' && c.priority !== filters.priority) return false;
        if (filters.status !== 'ALL' && c.status !== filters.status) return false;
        return true;
      }),
    [filters]
  );

  const selectedContact = darkContacts.find((c) => c.contactId === selectedContactId);
  const mapIncidents = filters.incidentId === 'ALL' ? incidents : [getIncidentById(filters.incidentId)!].filter(Boolean);

  return (
    <div className="investigation-shell">
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-hairline)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14 }}>DARK VESSEL INTELLIGENCE</div>
        <div className="label-xs" style={{ marginTop: 2 }}>AIS CORRELATION &amp; SATELLITE CROSS-VERIFICATION</div>
      </div>

      <DarkVesselKpiCards contacts={filtered} />
      <DarkVesselFilters state={filters} onChange={setFilters} />

      <div className="investigation-body">
        <div className="map-stage">
          <TacticalMap
            incidents={mapIncidents}
            vessels={vessels}
            activeLayers={{ spillMask: true, sarEvents: true, aisTracks: true, searchRadius: true, currentVectors: false }}
            center={[71.5, 18.2]}
            zoom={5.4}
            onDarkContactClick={(id) => setSelectedContactId(id)}
          />
          <MapLegend />
        </div>
      </div>

      <div className="investigation-bottom" style={{ maxHeight: '48%' }}>
        <div className="panel-header" style={{ paddingBottom: 0 }}>
          <span className="panel-title">Dark Contact Register</span>
          <span className="text-muted" style={{ fontSize: 9.5 }}>{filtered.length} contact(s)</span>
        </div>
        <DarkContactTable contacts={filtered} selectedId={selectedContactId} onSelect={setSelectedContactId} />
      </div>

      {selectedContact && <DarkContactDrawer contact={selectedContact} onClose={() => setSelectedContactId(null)} />}
    </div>
  );
};
