import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import type { MockObjectCard } from './mock-dashboard.js';
import {
  getDemoDocumentationSectionFolders,
  type DemoDocumentationSection,
  type DemoDocumentationSectionId,
} from './object-documentation-sections.js';
import type { DemoIdFolderId, DemoIdFolders } from './object-id-folders.js';
import { getDocumentDisplayNumber, getFolderCountLabel } from './object-workspace-formatters.js';
import type { ObjectWorkspaceSection } from './object-workspace-types.js';

type WorkspaceNavIconName =
  | 'documents'
  | 'final-package'
  | 'folder'
  | 'home'
  | 'section'
  | 'sections'
  | 'settings';

interface ObjectWorkspaceNavigationProps {
  readonly activeSection: ObjectWorkspaceSection;
  readonly drafts: readonly DemoAosrDraft[];
  readonly folders: DemoIdFolders;
  readonly object: MockObjectCard;
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedFolderId: DemoIdFolderId | null;
  readonly selectedDraftId: string;
  readonly selectedSectionId: DemoDocumentationSectionId | null;
  readonly onBackToObjects: () => void;
  readonly onOpenAosr: (folderId: DemoIdFolderId, draftId: string) => void;
  readonly onOpenFolder: (folderId: DemoIdFolderId) => void;
  readonly onOpenObjectDocumentsPage: () => void;
  readonly onOpenOverview: () => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionFinalPackage: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionTemplateSettings: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionsPage: () => void;
}

export function ObjectWorkspaceNavigation({
  activeSection,
  drafts,
  folders,
  object,
  sections,
  selectedFolderId,
  selectedDraftId,
  selectedSectionId,
  onBackToObjects,
  onOpenAosr,
  onOpenFolder,
  onOpenObjectDocumentsPage,
  onOpenOverview,
  onOpenSection,
  onOpenSectionFinalPackage,
  onOpenSectionTemplateSettings,
  onOpenSectionsPage,
}: ObjectWorkspaceNavigationProps): React.JSX.Element {
  return (
    <aside className="object-workspace-nav" aria-label="Навигация объекта">
      <button
        aria-label="Назад к объектам"
        className="object-workspace-nav__back"
        onClick={onBackToObjects}
        type="button"
      >
        ← Назад к объектам
      </button>

      <div className="object-workspace-nav__identity">
        <p className="section-kicker">Объект</p>
        <strong>{object.title}</strong>
        <small>{object.address}</small>
      </div>

      <nav className="object-workspace-nav__sections" aria-label="Разделы объекта">
        <div className="object-workspace-nav__group" aria-labelledby="object-nav-work-title">
          <p className="object-workspace-nav__group-label" id="object-nav-work-title">
            Работа
          </p>
          <button
            aria-current={activeSection === 'overview' ? 'page' : undefined}
            aria-label="Обзор объекта"
            onClick={onOpenOverview}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              <WorkspaceNavIcon name="home" />
            </span>
            <span className="object-workspace-nav__label">
              <strong>Обзор объекта</strong>
              <small>Общая картина</small>
            </span>
          </button>
          <button
            aria-label="Разделы ИД"
            aria-current={activeSection === 'sections' ? 'page' : undefined}
            onClick={onOpenSectionsPage}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              <WorkspaceNavIcon name="sections" />
            </span>
            <span className="object-workspace-nav__label">
              <strong>Разделы ИД</strong>
              <small>Список разделов</small>
            </span>
          </button>
        </div>

        <div
          className="object-workspace-nav__group object-workspace-nav__group--tree"
          aria-labelledby="object-nav-current-title"
        >
          <p className="object-workspace-nav__group-label" id="object-nav-current-title">
            Объект
          </p>
          {sections.length === 0 ? (
            <div className="object-workspace-nav__empty-current">
              <strong>Разделов пока нет</strong>
              <small>Создайте первый раздел в «Разделы ИД».</small>
            </div>
          ) : (
            <ul className="object-workspace-tree" aria-label="Дерево разделов и папок объекта">
              {sections.map((section) => {
                const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
                const isSelectedSection = selectedSectionId === section.id;

                return (
                  <li className="object-workspace-tree__section" key={section.id}>
                    <button
                      aria-current={
                        isSelectedSection && activeSection === 'section' ? 'page' : undefined
                      }
                      aria-label={`Открыть раздел ${section.name}`}
                      onClick={() => {
                        onOpenSection(section.id);
                      }}
                      type="button"
                    >
                      <span className="object-workspace-nav__icon" aria-hidden="true">
                        <WorkspaceNavIcon name="section" />
                      </span>
                      <span className="object-workspace-nav__label">
                        <strong>{section.name}</strong>
                        <small>
                          {sectionFolders.length === 0
                            ? 'Папок пока нет'
                            : `${String(sectionFolders.length)} ${getFolderCountLabel(
                                sectionFolders.length,
                              )}`}
                        </small>
                      </span>
                    </button>

                    {isSelectedSection ? (
                      <ul className="object-workspace-tree__children">
                        <li>
                          <button
                            aria-current={activeSection === 'settings' ? 'page' : undefined}
                            aria-label={`Шаблонные значения раздела ${section.name}`}
                            className="object-workspace-nav__subitem"
                            onClick={() => {
                              onOpenSectionTemplateSettings(section.id);
                            }}
                            type="button"
                          >
                            <span className="object-workspace-nav__icon" aria-hidden="true">
                              <WorkspaceNavIcon name="settings" />
                            </span>
                            <span className="object-workspace-nav__label">
                              <strong>Шаблонные значения раздела</strong>
                              <small>{section.name}</small>
                            </span>
                          </button>
                        </li>
                        {sectionFolders.map((folder) => {
                          const isSelectedFolder = selectedFolderId === folder.id;
                          const folderDrafts = isSelectedFolder
                            ? folder.draftIds
                                .map((draftId) => drafts.find((draft) => draft.id === draftId))
                                .filter((draft): draft is DemoAosrDraft => draft !== undefined)
                            : [];

                          return (
                            <li key={folder.id}>
                              <button
                                aria-current={
                                  isSelectedFolder &&
                                  (activeSection === 'folder' ||
                                    activeSection === 'intermediate-package' ||
                                    activeSection === 'aosr')
                                    ? 'page'
                                    : undefined
                                }
                                aria-label={`Открыть папку ${folder.name}`}
                                className="object-workspace-nav__subitem"
                                onClick={() => {
                                  onOpenFolder(folder.id);
                                }}
                                type="button"
                              >
                                <span className="object-workspace-nav__icon" aria-hidden="true">
                                  <WorkspaceNavIcon name="folder" />
                                </span>
                                <span className="object-workspace-nav__label">
                                  <strong>{folder.name}</strong>
                                  <small>Папка раздела</small>
                                </span>
                              </button>
                              {folderDrafts.length === 0 ? null : (
                                <ul
                                  className="object-workspace-tree__acts"
                                  aria-label={`Акты папки ${folder.name}`}
                                >
                                  {folderDrafts.map((draft) => (
                                    <li key={draft.id}>
                                      <button
                                        aria-current={
                                          selectedDraftId === draft.id ? 'page' : undefined
                                        }
                                        aria-label={`Открыть АОСР ${getDocumentDisplayNumber(draft.actNumber)}`}
                                        className="object-workspace-nav__act"
                                        onClick={() => {
                                          onOpenAosr(folder.id, draft.id);
                                        }}
                                        type="button"
                                      >
                                        АОСР {getDocumentDisplayNumber(draft.actNumber)}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                        <li>
                          <button
                            aria-current={activeSection === 'final-package' ? 'page' : undefined}
                            aria-label={`Итоговая ИД по разделу ${section.name}`}
                            className="object-workspace-nav__subitem"
                            onClick={() => {
                              onOpenSectionFinalPackage(section.id);
                            }}
                            type="button"
                          >
                            <span className="object-workspace-nav__icon" aria-hidden="true">
                              <WorkspaceNavIcon name="final-package" />
                            </span>
                            <span className="object-workspace-nav__label">
                              <strong>Итоговая ИД по разделу</strong>
                              <small>{section.name}</small>
                            </span>
                          </button>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className="object-workspace-nav__group object-workspace-nav__group--service"
          aria-labelledby="object-nav-service-title"
        >
          <p className="object-workspace-nav__group-label" id="object-nav-service-title">
            Сервис
          </p>
          <button
            aria-current={activeSection === 'documents' ? 'page' : undefined}
            aria-label="Открыть документы объекта"
            onClick={onOpenObjectDocumentsPage}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              <WorkspaceNavIcon name="documents" />
            </span>
            <span className="object-workspace-nav__label">
              <strong>Документы объекта</strong>
              <small>Схемы и журналы</small>
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

function WorkspaceNavIcon({ name }: { readonly name: WorkspaceNavIconName }): React.JSX.Element {
  switch (name) {
    case 'documents':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M7 4.75h7.2L18 8.55v10.7H7z" />
          <path d="M14 4.75v4h4" />
          <path d="M9.5 12h6M9.5 15h5" />
        </svg>
      );
    case 'final-package':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 7.25h11v12h-11z" />
          <path d="M8.5 4.75h7v2.5h-7zM9.5 11h5M9.5 14h4" />
          <path d="m15.2 15.7 1.1 1.1 2-2.4" />
        </svg>
      );
    case 'folder':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M4.75 8.25h5l1.55 2h7.95v8H4.75z" />
          <path d="M4.75 8.25v-1.5h4.2l1.45 1.5" />
        </svg>
      );
    case 'home':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="m5 11.2 7-5.7 7 5.7" />
          <path d="M7.25 10.25v8.5h9.5v-8.5" />
          <path d="M10.25 18.75v-4h3.5v4" />
        </svg>
      );
    case 'section':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 5.75h11v12.5h-11z" />
          <path d="M9 9h6M9 12h6M9 15h3.5" />
        </svg>
      );
    case 'sections':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M5.5 6h5.25v5.25H5.5zM13.25 6h5.25v5.25h-5.25zM5.5 13.25h5.25v5.25H5.5zM13.25 13.25h5.25v5.25h-5.25z" />
        </svg>
      );
    case 'settings':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6 8.25h12M6 15.75h12" />
          <path d="M9.25 6.5v3.5M14.75 14v3.5" />
        </svg>
      );
  }
}
