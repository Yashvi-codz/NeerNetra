import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { incidents } from '@/data/incidents';
import { formatUtcDate } from '@/services/time';

export const AffectedAreaChart: React.FC = () => {
  const data = [...incidents]
    .sort((a, b) => a.createdUtc.localeCompare(b.createdUtc))
    .map((i) => ({
      date: formatUtcDate(i.createdUtc).slice(5),
      id: i.id,
      areaKm2: i.impact.affectedAreaKm2,
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border-hairline-soft)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-hairline)' }} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }}
          labelStyle={{ color: 'var(--text-primary)' }}
          formatter={(value: number, _name, props) => [`${value} km²`, props.payload.id]}
        />
        <Line type="monotone" dataKey="areaKm2" stroke="#37d4ff" strokeWidth={2} dot={{ r: 3, fill: '#37d4ff' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
