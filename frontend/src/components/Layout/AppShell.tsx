import React from 'react';
import { TacticalHeader } from '../TacticalHeader/TacticalHeader';
import { MainNav } from './MainNav';
import type { Incident } from '@/types';

interface AppShellProps {
  incident?: Incident;
  alertCount: number;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ incident, alertCount, children }) => (
  <div className="app-shell">
    <TacticalHeader incident={incident} alertCount={alertCount} />
    <MainNav />
    {children}
  </div>
);
