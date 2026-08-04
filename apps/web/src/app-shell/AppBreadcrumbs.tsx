import { Link } from 'react-router-dom';

import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { getDocumentDisplayNumber } from './object-workspace-formatters.js';
import type { MockObjectCard } from './mock-dashboard.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import type { DemoIdFolder } from './object-id-folders.js';
import { folderPath, objectPath, objectSectionsPath, sectionPath } from './app-route-paths.js';

export type AppBreadcrumbScreen =
  | 'documents'
  | 'final'
  | 'folder'
  | 'overview'
  | 'sections'
  | 'template'
  | 'aosr'
  | 'section';

interface AppBreadcrumbsProps {
  readonly draft?: DemoAosrDraft;
  readonly folder?: DemoIdFolder;
  readonly object: MockObjectCard;
  readonly screen: AppBreadcrumbScreen;
  readonly section?: DemoDocumentationSection;
}

export function AppBreadcrumbs({
  draft,
  folder,
  object,
  screen,
  section,
}: AppBreadcrumbsProps): React.JSX.Element {
  const objectIsCurrent = screen === 'overview';
  const sectionIsCurrent = screen === 'section';
  const folderIsCurrent = screen === 'folder';

  return (
    <nav className="object-workspace-breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        <BreadcrumbLink label="Объекты" to="/objects" />
        {objectIsCurrent ? (
          <BreadcrumbCurrent label={object.title} />
        ) : (
          <BreadcrumbLink label={object.title} to={objectPath(object.id)} />
        )}
        {screen === 'sections' ? <BreadcrumbCurrent label="Разделы ИД" /> : null}
        {screen === 'documents' ? <BreadcrumbCurrent label="Документы объекта" /> : null}
        {section === undefined ? null : (
          <>
            <BreadcrumbLink label="Разделы ИД" to={objectSectionsPath(object.id)} />
            {sectionIsCurrent ? (
              <BreadcrumbCurrent label={section.name} />
            ) : (
              <BreadcrumbLink label={section.name} to={sectionPath(object.id, section.id)} />
            )}
          </>
        )}
        {screen === 'template' ? <BreadcrumbCurrent label="Шаблон раздела" /> : null}
        {screen === 'final' ? <BreadcrumbCurrent label="Итоговая ИД" /> : null}
        {folder === undefined || section === undefined ? null : folderIsCurrent ? (
          <BreadcrumbCurrent label={folder.name} />
        ) : (
          <BreadcrumbLink label={folder.name} to={folderPath(object.id, section.id, folder.id)} />
        )}
        {screen === 'aosr' && draft !== undefined ? (
          <BreadcrumbCurrent label={`АОСР ${getDocumentDisplayNumber(draft.actNumber)}`} />
        ) : null}
      </ol>
    </nav>
  );
}

function BreadcrumbLink({ label, to }: { readonly label: string; readonly to: string }) {
  return (
    <li>
      <Link to={to}>{label}</Link>
    </li>
  );
}

function BreadcrumbCurrent({ label }: { readonly label: string }) {
  return (
    <li aria-current="page">
      <span>{label}</span>
    </li>
  );
}
