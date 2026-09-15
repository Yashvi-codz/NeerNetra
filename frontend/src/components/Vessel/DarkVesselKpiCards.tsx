import React from 'react';
import type { DarkContact } from '@/types';

export const DarkVesselKpiCards: React.FC<{ contacts: DarkContact[] }> = ({ contacts }) => {
  const darkContactsCount = contacts.length;
  const aisMismatches = contacts.filter((c) => c.aisMatchStatus !== 'MATCHED').length;
  const nearSpill = contacts.filter((c) => c.distanceToSpillKm <= 5).length;
  const unresolved = contacts.filter((c) => c.status === 'UNRESOLVED').length;
  const highPriority = contacts.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;

  const cards = [
    { label: 'Dark Contacts', value: darkContactsCount, tone: 'cyan' },
    { label: 'AIS Mismatches', value: aisMismatches, tone: 'amber' },
    { label: 'Near-Spill Contacts', value: nearSpill, tone: 'amber' },
    { label: 'Unresolved', value: unresolved, tone: 'red' },
    { label: 'High Priority', value: highPriority, tone: 'red' },
  ] as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, padding: '12px 16px' }}>
      {cards.map((c) => (
        <div className="kpi-card" key={c.label}>
          <div className="kpi-label">{c.label}</div>
          <div className={`kpi-value ${c.tone}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
};
