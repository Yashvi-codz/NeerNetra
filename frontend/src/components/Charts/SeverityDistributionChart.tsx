import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { incidents } from '@/data/incidents';

const ORDER = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const COLOR: Record<string, string> = {
  LOW: '#35d399',
  MODERATE: '#f5a623',
  HIGH: '#ff4d4f',
  CRITICAL: '#ff4d4f',
};

export const SeverityDistributionChart: React.FC = () => {
  const data = ORDER.map((sev) => ({
    severity: sev,
    count: incidents.filter((i) => i.characteristics.severity === sev).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border-hairline-soft)" vertical={false} />
        <XAxis dataKey="severity" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-hairline)' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }}
          labelStyle={{ color: 'var(--text-primary)' }}
        />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.severity} fill={COLOR[d.severity]} fillOpacity={0.75} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
