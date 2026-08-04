import { Link, Navigate, createBrowserRouter, useParams, type RouteObject } from 'react-router-dom';

import { MockObjectDashboardPage } from './app-shell/MockObjectDashboardPage.js';
import { ObjectWorkspacePage, type ObjectWorkspaceRoute } from './app-shell/ObjectWorkspacePage.js';
import {
  folderPath,
  objectPath,
  objectSectionsPath,
  sectionPath,
} from './app-shell/app-route-paths.js';
import {
  resolveRouteDraft,
  resolveRouteFolder,
  resolveRouteObject,
  resolveRouteSection,
} from './app-shell/route-entity-resolution.js';
import { useDemoWorkspaceSession } from './app-shell/object-workspace-session.js';

const appRoutes: RouteObject[] = [
  { element: <Navigate replace to="/objects" />, path: '/' },
  { element: <DashboardRoute panel="objects" />, path: '/objects' },
  { element: <DashboardRoute panel="certificates" />, path: '/certificates' },
  { element: <DashboardRoute panel="representatives" />, path: '/organizations' },
  { element: <ObjectWorkspaceRoute screen="overview" />, path: '/objects/:objectId' },
  {
    element: <ObjectWorkspaceRoute screen="documents" />,
    path: '/objects/:objectId/documents',
  },
  { element: <ObjectWorkspaceRoute screen="sections" />, path: '/objects/:objectId/sections' },
  {
    element: <ObjectWorkspaceRoute screen="section" />,
    path: '/objects/:objectId/sections/:sectionId',
  },
  {
    element: <ObjectWorkspaceRoute screen="template" />,
    path: '/objects/:objectId/sections/:sectionId/template',
  },
  {
    element: <ObjectWorkspaceRoute screen="final" />,
    path: '/objects/:objectId/sections/:sectionId/final',
  },
  {
    element: <ObjectWorkspaceRoute screen="folder" />,
    path: '/objects/:objectId/sections/:sectionId/folders/:folderId',
  },
  {
    element: <ObjectWorkspaceRoute screen="aosr" />,
    path: '/objects/:objectId/sections/:sectionId/folders/:folderId/aosr/:draftId',
  },
  { element: <RouteNotFoundPage />, path: '*' },
];

export function createAppRouter(): ReturnType<typeof createBrowserRouter> {
  return createBrowserRouter(appRoutes);
}

function DashboardRoute({
  panel,
}: {
  readonly panel: 'certificates' | 'objects' | 'representatives';
}): React.JSX.Element {
  return <MockObjectDashboardPage activePanel={panel} />;
}

function ObjectWorkspaceRoute({
  screen,
}: {
  readonly screen: ObjectWorkspaceRoute['screen'];
}): React.JSX.Element {
  const { draftId, folderId, objectId, sectionId } = useParams();
  const { workspacesByObjectId } = useDemoWorkspaceSession();
  const object = resolveRouteObject(objectId);

  if (object === undefined) {
    return (
      <RouteNotFoundPage
        description="Объект не существует или ссылка больше не актуальна."
        title="Объект не найден"
      />
    );
  }

  const workspace = workspacesByObjectId[object.id];

  if (workspace === undefined) {
    return <RouteNotFoundPage title="Рабочая область объекта не найдена" />;
  }

  if (screen === 'overview' || screen === 'documents' || screen === 'sections') {
    return <ObjectWorkspacePage object={object} route={{ screen }} />;
  }

  const section = resolveRouteSection(sectionId, workspace);

  if (section === undefined) {
    return (
      <RouteNotFoundPage
        description="Раздел не найден в указанном объекте."
        links={[
          { label: 'К объекту', to: objectPath(object.id) },
          { label: 'К разделам ИД', to: objectSectionsPath(object.id) },
        ]}
        title="Раздел ИД не найден"
      />
    );
  }

  if (screen === 'section' || screen === 'template' || screen === 'final') {
    return <ObjectWorkspacePage object={object} route={{ screen, section }} />;
  }

  const folder = resolveRouteFolder(folderId, section, workspace);

  if (folder === undefined) {
    return (
      <RouteNotFoundPage
        description="Папка не найдена в указанном разделе."
        links={[
          { label: 'К объекту', to: objectPath(object.id) },
          { label: 'К разделу', to: sectionPath(object.id, section.id) },
        ]}
        title="Папка ИД не найдена"
      />
    );
  }

  if (screen === 'folder') {
    return <ObjectWorkspacePage object={object} route={{ folder, screen, section }} />;
  }

  const draft = resolveRouteDraft(draftId, folder, section, workspace);

  if (draft === undefined) {
    return (
      <RouteNotFoundPage
        description="Акт не найден в указанной папке и разделе."
        links={[
          { label: 'К разделу', to: sectionPath(object.id, section.id) },
          { label: 'К папке', to: folderPath(object.id, section.id, folder.id) },
        ]}
        title="АОСР не найден"
      />
    );
  }

  return <ObjectWorkspacePage object={object} route={{ draft, folder, screen, section }} />;
}

interface RouteNotFoundPageProps {
  readonly description?: string;
  readonly links?: readonly { readonly label: string; readonly to: string }[];
  readonly title?: string;
}

function RouteNotFoundPage({
  description = 'Проверьте адрес или вернитесь к списку объектов.',
  links = [{ label: 'К объектам', to: '/objects' }],
  title = 'Страница не найдена',
}: RouteNotFoundPageProps = {}): React.JSX.Element {
  return (
    <main className="route-not-found" aria-labelledby="route-not-found-title">
      <section className="empty-state-card">
        <p className="section-kicker">Навигация</p>
        <h1 id="route-not-found-title">{title}</h1>
        <p>{description}</p>
        <div className="route-not-found__actions">
          {links.map((link) => (
            <Link className="secondary-action" key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
