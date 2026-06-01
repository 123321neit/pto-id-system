import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { DemoAosrWorkspacePage } from './aosr-demo/DemoAosrWorkspacePage.js';

const router = createBrowserRouter([
  {
    element: <DemoAosrWorkspacePage />,
    path: '/',
  },
]);

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
