import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useState } from 'react';

import { DemoAosrWorkspacePage } from './aosr-demo/DemoAosrWorkspacePage.js';
import { MockObjectDashboardPage } from './app-shell/MockObjectDashboardPage.js';
import type { MockDashboardPanel } from './app-shell/mock-dashboard.js';

const router = createBrowserRouter([
  {
    element: <AppContent />,
    path: '/',
  },
]);

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

function AppContent(): React.JSX.Element {
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [activeDashboardPanel, setActiveDashboardPanel] = useState<MockDashboardPanel>('objects');

  if (view === 'workspace') {
    return (
      <DemoAosrWorkspacePage
        onBackToObjects={() => {
          setActiveDashboardPanel('objects');
          setView('dashboard');
        }}
      />
    );
  }

  return (
    <MockObjectDashboardPage
      activePanel={activeDashboardPanel}
      onOpenObject={() => {
        setView('workspace');
      }}
      onSelectPanel={setActiveDashboardPanel}
    />
  );
}
