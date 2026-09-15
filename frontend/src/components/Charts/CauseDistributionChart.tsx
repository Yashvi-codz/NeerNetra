import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { causeDistribution } from '@/data/causes';

export const CauseDistributionChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart
      data={causeDistribution}
      layout="vertical"
      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
    >
      <CartesianGrid stroke="var(--border-hairline-soft)" horizontal={false} />
      <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
      <YAxis
        type="category"
        dataKey="cause"
        width={150}
        tick={{ fill: 'var(--text-secondary)', fontSize: 9.5 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border-hairline)', fontSize: 11 }}
        labelStyle={{ color: 'var(--text-primary)' }}
      />
      <Bar dataKey="incidentCount" fill="#f5a623" fillOpacity={0.75} radius={[0, 2, 2, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
