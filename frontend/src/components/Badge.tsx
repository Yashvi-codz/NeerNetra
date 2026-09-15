import React from 'react';

export type BadgeTone = 'cyan' | 'red' | 'amber' | 'green' | 'neutral';

export function severityTone(severity: string): BadgeTone {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return 'red';
    case 'MODERATE':
      return 'amber';
    case 'LOW':
      return 'green';
    default:
      return 'neutral';
  }
}

export function statusTone(status: string): BadgeTone {
  const s = status.toUpperCase();
  if (s.includes('ACTIVE') || s.includes('FLAGGED')) return 'red';
  if (s.includes('REVIEW') || s.includes('UNRESOLVED') || s.includes('NEEDS')) return 'amber';
  if (s.includes('CLEARED') || s.includes('CORROBORATED') || s.includes('VERIFIED')) return 'green';
  return 'cyan';
}

interface BadgeProps {
  tone: BadgeTone;
  children: React.ReactNode;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ tone, children, pulse }) => (
  <span className={`badge ${tone}`}>
    <span className={`status-dot ${tone}${pulse ? ' pulse' : ''}`} />
    {children}
  </span>
);
