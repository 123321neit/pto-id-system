import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import { DemoWorkspaceSessionProvider } from './app-shell/object-workspace-session.js';
import { createAppRouter } from './app-routes.js';
import { DemoStoreProvider } from './demo-store/DemoStoreProvider.js';

export function App(): React.JSX.Element {
  const [router] = useState(createAppRouter);

  return (
    <DemoStoreProvider>
      <DemoWorkspaceSessionProvider>
        <RouterProvider router={router} />
      </DemoWorkspaceSessionProvider>
    </DemoStoreProvider>
  );
}
