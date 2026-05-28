import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { PlaceholderPage } from './pages/PlaceholderPage.js';

const router = createBrowserRouter([
  {
    element: <PlaceholderPage />,
    path: '/',
  },
]);

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
