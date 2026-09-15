import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/overview', label: 'Overview' },
  { to: '/investigation', label: 'Investigation' },
  { to: '/intelligence', label: 'Intelligence' },
  { to: '/reports', label: 'Reports' },
];

export const MainNav: React.FC = () => (
  <nav className="main-nav">
    {TABS.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
);
