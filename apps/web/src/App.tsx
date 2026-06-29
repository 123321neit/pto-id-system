import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useState } from 'react';

import { MockObjectDashboardPage } from './app-shell/MockObjectDashboardPage.js';
import { ObjectWorkspacePage } from './app-shell/ObjectWorkspacePage.js';
import {
  mockObjectCards,
  type MockDashboardPanel,
  type MockObjectCard,
} from './app-shell/mock-dashboard.js';
import type { SectionTemplateClipboard } from './app-shell/section-template-clipboard.js';
import { DemoStoreProvider } from './demo-store/DemoStoreProvider.js';

const router = createBrowserRouter([
  {
    element: <AppContent />,
    path: '/',
  },
]);

export function App(): React.JSX.Element {
  return (
    <DemoStoreProvider>
      <RouterProvider router={router} />
    </DemoStoreProvider>
  );
}

function AppContent(): React.JSX.Element {
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [activeDashboardPanel, setActiveDashboardPanel] = useState<MockDashboardPanel>('objects');
  const [selectedObjectId, setSelectedObjectId] = useState<string>(mockObjectCards[0]?.id ?? '');
  const [sectionTemplateClipboard, setSectionTemplateClipboard] =
    useState<SectionTemplateClipboard | null>(null);
  const selectedObject = getSelectedObject(selectedObjectId);

  if (view === 'workspace') {
    return (
      <ObjectWorkspacePage
        object={selectedObject}
        sectionTemplateClipboard={sectionTemplateClipboard}
        onSectionTemplateClipboardChange={setSectionTemplateClipboard}
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
      onOpenObject={(objectId) => {
        setSelectedObjectId(objectId);
        setView('workspace');
      }}
      onSelectPanel={setActiveDashboardPanel}
    />
  );
}

function getSelectedObject(objectId: string): MockObjectCard {
  const selectedObject = mockObjectCards.find((object) => object.id === objectId);
  const fallbackObject = mockObjectCards[0];

  if (selectedObject !== undefined) {
    return selectedObject;
  }

  if (fallbackObject === undefined) {
    throw new Error('Для демо нужен хотя бы один объект.');
  }

  return fallbackObject;
}
