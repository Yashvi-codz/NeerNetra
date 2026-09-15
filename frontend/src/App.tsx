import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { InvestigationPage } from './pages/Investigation/InvestigationPage';
import { VesselDetailPage } from './pages/Investigation/VesselDetailPage';
import { IntelligencePage } from './pages/Intelligence/IntelligencePage';
import { DarkVesselsPage } from './pages/Intelligence/DarkVesselsPage';
import { ReportsLandingPage } from './pages/Reports/ReportsLandingPage';
import { IncidentReportsIndexPage } from './pages/Reports/IncidentReportsIndexPage';
import { IncidentReportPage } from './pages/Reports/IncidentReportPage';
import { AreaReportsLandingPage } from './pages/Reports/AreaReportsLandingPage';
import { AreaReportPage } from './pages/Reports/AreaReportPage';
import { ReplayPage } from './pages/Replay/ReplayPage';
import { primaryIncident, incidents } from './data/incidents';

const App: React.FC = () => {
  const alertCount = incidents.filter((i) => i.status === 'ACTIVE INVESTIGATION' || i.status === 'UNDER REVIEW').length + 1;

  return (
    <AppShell incident={primaryIncident} alertCount={alertCount}>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/intelligence/dark-vessels" element={<DarkVesselsPage />} />
        <Route path="/vessels/:id" element={<VesselDetailPage />} />
        <Route path="/reports" element={<ReportsLandingPage />} />
        <Route path="/reports/incidents" element={<IncidentReportsIndexPage />} />
        <Route path="/reports/incidents/:id" element={<IncidentReportPage />} />
        <Route path="/reports/areas" element={<AreaReportsLandingPage />} />
        <Route path="/reports/areas/:area" element={<AreaReportPage />} />
        <Route path="/replay/:incidentId" element={<ReplayPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
