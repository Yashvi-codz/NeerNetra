import React from 'react';

export const ReportSection: React.FC<{ num: string; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
  <section style={{ marginTop: 22 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-hairline)' }}>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--cyan-dim)', fontWeight: 700 }}>{num}</span>
      <h2 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: 0 }}>
        {title}
      </h2>
    </div>
    {children}
  </section>
);
