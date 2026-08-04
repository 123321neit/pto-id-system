import { useEffect, useMemo, useState, type SetStateAction } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import { DerivedRegistryTable } from './DerivedRegistryTable.js';
import { AppBreadcrumbs, type AppBreadcrumbScreen } from './AppBreadcrumbs.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage, ObjectIntermediatePackagePage } from './ObjectFinalPackagePage.js';
import { ObjectWorkspaceNavigation } from './ObjectWorkspaceNavigation.js';
import {
  aosrPath,
  folderPath,
  objectSectionsPath,
  sectionFinalPath,
  sectionPath,
  sectionTemplatePath,
} from './app-route-paths.js';
import type { MockObjectCard } from './mock-dashboard.js';
import {
  addDemoDocumentationSectionFolder,
  createDemoDocumentationSection,
  getDemoDocumentationSectionById,
  getDemoDocumentationSectionDrafts,
  getDemoDocumentationSectionFolders,
  moveDemoDocumentationSectionFolderByDirection,
  type DemoDocumentationSection,
  type DemoDocumentationSectionFolderMoveDirection,
  type DemoDocumentationSectionId,
} from './object-documentation-sections.js';
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import {
  addDemoIdFolderDraft,
  createDemoIdFolder,
  getDemoIdFolderDrafts,
  moveDemoIdFolderDraftByDirection,
  removeDemoIdFolderDraft,
  type DemoIdFolder,
  type DemoIdFolderDraftMoveDirection,
  type DemoIdFolderId,
} from './object-id-folders.js';
import {
  formatRenumberedActCount,
  formatShortDate,
  getActCountLabel,
  getDocumentDisplayNumber,
  getFolderCountLabel,
  getLatestDraft,
} from './object-workspace-formatters.js';
import {
  maybeRenumberAutomaticSectionDrafts,
  renumberSectionDraftsByFolderOrder,
} from './object-workspace-numbering.js';
import { duplicateAosrDraftInFolder } from './object-workspace-drafts.js';
import type { ObjectWorkspaceSection } from './object-workspace-types.js';
import {
  copySectionTemplateSettingsToTarget,
  createSectionTemplateSettings,
} from './object-section-template-settings.js';
import { cloneSectionTemplateSettingsForClipboard } from './section-template-clipboard.js';
import { buildFolderRegistryModel } from './object-registry-model.js';
import {
  useDemoWorkspaceSession,
  type DemoObjectWorkspaceSession,
} from './object-workspace-session.js';

const aosrActType = getDemoActTypeById('aosr');

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly route: ObjectWorkspaceRoute;
}

export type ObjectWorkspaceRoute =
  | { readonly screen: 'documents' }
  | { readonly screen: 'overview' }
  | { readonly screen: 'sections' }
  | { readonly screen: 'section'; readonly section: DemoDocumentationSection }
  | { readonly screen: 'template'; readonly section: DemoDocumentationSection }
  | { readonly screen: 'final'; readonly section: DemoDocumentationSection }
  | {
      readonly screen: 'folder';
      readonly folder: DemoIdFolder;
      readonly section: DemoDocumentationSection;
    }
  | {
      readonly screen: 'aosr';
      readonly draft: DemoAosrDraft;
      readonly folder: DemoIdFolder;
      readonly section: DemoDocumentationSection;
    };

export function ObjectWorkspacePage({
  object,
  route,
}: ObjectWorkspacePageProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateTo = (path: string): void => {
    if (location.pathname === path) {
      return;
    }

    void navigate(path);
  };
  const {
    sectionTemplateClipboard,
    setSectionTemplateClipboard,
    updateWorkspace,
    workspacesByObjectId,
  } = useDemoWorkspaceSession();
  const workspace = workspacesByObjectId[object.id];

  if (workspace === undefined) {
    throw new Error(`Workspace session is missing for object: ${object.id}`);
  }

  const { drafts, folders, sections, sectionTemplateSettingsById } = workspace;
  const setDrafts = createWorkspaceFieldSetter(object.id, updateWorkspace, 'drafts');
  const setFolders = createWorkspaceFieldSetter(object.id, updateWorkspace, 'folders');
  const setSections = createWorkspaceFieldSetter(object.id, updateWorkspace, 'sections');
  const setSectionTemplateSettingsById = createWorkspaceFieldSetter(
    object.id,
    updateWorkspace,
    'sectionTemplateSettingsById',
  );
  const activeSection = getActiveWorkspaceSection(route.screen);
  const selectedSection = 'section' in route ? route.section : undefined;
  const selectedFolder = 'folder' in route ? route.folder : undefined;
  const selectedDraftId = 'draft' in route ? route.draft.id : '';
  const selectedSectionId = selectedSection?.id ?? null;
  const selectedFolderId = selectedFolder?.id ?? null;
  const [isCreateDocumentPanelOpen, setCreateDocumentPanelOpen] = useState(false);
  const [isCreateFolderPanelOpen, setCreateFolderPanelOpen] = useState(false);
  const [isCreateSectionPanelOpen, setCreateSectionPanelOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [lastTemplateCopyMessage, setLastTemplateCopyMessage] = useState('');
  const [isIntermediatePackageOpen, setIntermediatePackageOpen] = useState(false);
  const isAosrVisible = route.screen === 'aosr' || route.screen === 'template';
  const selectedSectionFolders =
    selectedSection === undefined
      ? []
      : getDemoDocumentationSectionFolders(selectedSection, folders);
  const overviewSection = sections[0];
  const overviewSectionFolders =
    overviewSection === undefined
      ? []
      : getDemoDocumentationSectionFolders(overviewSection, folders);
  const selectedSectionDrafts = useMemo(
    () =>
      selectedSection === undefined
        ? []
        : getDemoDocumentationSectionDrafts(selectedSection, folders, drafts),
    [drafts, folders, selectedSection],
  );
  const selectedAutomaticSectionDrafts = useMemo(
    () => selectedSectionDrafts.filter((draft) => draft.numberingAssignment.source === 'automatic'),
    [selectedSectionDrafts],
  );
  const selectedFolderDrafts =
    selectedFolder === undefined ? [] : getDemoIdFolderDrafts(selectedFolder, drafts);
  const selectedSectionTemplateSettings =
    selectedSection === undefined
      ? demoAosrWorkspace.sectionTemplateSettings
      : (sectionTemplateSettingsById[selectedSection.templateSettingsId] ??
        createSectionTemplateSettings(selectedSection));
  const proposedAosrNumberDetails = useMemo(() => {
    if (selectedFolderId === null || selectedSection === undefined) {
      return undefined;
    }

    return getProposedDemoDocumentNumberDetails({
      documentTypeId: 'aosr',
      drafts,
      folderId: selectedFolderId,
      folders,
      sectionId: selectedSection.id,
      setting: {
        documentTypeId: 'aosr',
        mode: selectedSectionTemplateSettings.sectionTemplate.numberingMode,
        prefix: selectedSectionTemplateSettings.sectionTemplate.numberingPrefix,
        scope: selectedSectionTemplateSettings.sectionTemplate.numberingScope,
        start: selectedSectionTemplateSettings.sectionTemplate.numberingStart,
        suffix: selectedSectionTemplateSettings.sectionTemplate.numberingSuffix,
        template: '{prefix}{number}{suffix}',
      },
    });
  }, [
    drafts,
    folders,
    selectedFolderId,
    selectedSection,
    selectedSectionTemplateSettings.sectionTemplate.numberingMode,
    selectedSectionTemplateSettings.sectionTemplate.numberingPrefix,
    selectedSectionTemplateSettings.sectionTemplate.numberingScope,
    selectedSectionTemplateSettings.sectionTemplate.numberingStart,
    selectedSectionTemplateSettings.sectionTemplate.numberingSuffix,
  ]);
  const proposedAosrNumber = proposedAosrNumberDetails?.renderedNumber ?? '';

  useEffect(() => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setFolderNameInput('');
    setSectionNameInput('');
    setLastTemplateCopyMessage('');
    setIntermediatePackageOpen(false);
  }, [object.id, selectedFolderId, selectedSectionId]);

  useEffect(() => {
    if (route.screen !== 'folder') {
      setCreateDocumentPanelOpen(false);
      setIntermediatePackageOpen(false);
    }

    if (route.screen !== 'section') {
      setCreateFolderPanelOpen(false);
      setFolderNameInput('');
    }

    if (route.screen !== 'sections') {
      setCreateSectionPanelOpen(false);
      setSectionNameInput('');
    }

    if (route.screen !== 'template') {
      setLastTemplateCopyMessage('');
    }
  }, [route.screen]);

  const openCreateDocumentPanel = (): void => {
    if (selectedFolder === undefined) {
      return;
    }

    setCreateDocumentPanelOpen(true);
  };

  const openCreateSectionPanel = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setSectionNameInput('');
    setCreateSectionPanelOpen(true);
    navigateTo(objectSectionsPath(object.id));
  };

  const createSection = (): void => {
    const sectionName = sectionNameInput.trim();

    if (sectionName === '') {
      return;
    }

    const section = createDemoDocumentationSection(
      `section-created-${String(workspace.nextSectionOrdinal)}`,
      sectionName,
    );

    updateWorkspace(object.id, (currentWorkspace) => ({
      ...currentWorkspace,
      nextSectionOrdinal: currentWorkspace.nextSectionOrdinal + 1,
      sections: [...currentWorkspace.sections, section],
      sectionTemplateSettingsById: {
        ...currentWorkspace.sectionTemplateSettingsById,
        [section.templateSettingsId]: createSectionTemplateSettings(section),
      },
    }));
    setCreateSectionPanelOpen(false);
    setSectionNameInput('');
    navigateTo(sectionPath(object.id, section.id));
  };

  const openCreateFolderPanel = (): void => {
    if (selectedSection === undefined) {
      openCreateSectionPanel();
      return;
    }

    setCreateDocumentPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setFolderNameInput('');
    setCreateFolderPanelOpen(true);
    navigateTo(sectionPath(object.id, selectedSection.id));
  };

  const createFolder = (): void => {
    if (selectedSectionId === null) {
      return;
    }

    const folderName = folderNameInput.trim();

    if (folderName === '') {
      return;
    }

    const folder = createDemoIdFolder(
      `folder-created-${String(workspace.nextFolderOrdinal)}`,
      folderName,
    );

    updateWorkspace(object.id, (currentWorkspace) => ({
      ...currentWorkspace,
      folders: [...currentWorkspace.folders, folder],
      nextFolderOrdinal: currentWorkspace.nextFolderOrdinal + 1,
      sections: addDemoDocumentationSectionFolder(
        currentWorkspace.sections,
        selectedSectionId,
        folder.id,
      ),
    }));
    setCreateFolderPanelOpen(false);
    setFolderNameInput('');
    navigateTo(folderPath(object.id, selectedSectionId, folder.id));
  };

  const createAosrDraft = (): void => {
    if (
      selectedFolderId === null ||
      selectedSection === undefined ||
      proposedAosrNumberDetails === undefined
    ) {
      return;
    }

    const draft = createEmptyDemoAosrDraft({
      actNumber: proposedAosrNumber,
      folderId: selectedFolderId,
      id: `aosr-draft-created-${String(workspace.nextAosrOrdinal)}`,
      numberingAssignment: proposedAosrNumberDetails.numberingAssignment,
      sectionTemplateSettings: selectedSectionTemplateSettings,
      sectionId: selectedSection.id,
      sectionTemplateSettingsId: selectedSection.templateSettingsId,
    });

    updateWorkspace(object.id, (currentWorkspace) => ({
      ...currentWorkspace,
      drafts: [...currentWorkspace.drafts, draft],
      folders: addDemoIdFolderDraft(currentWorkspace.folders, selectedFolderId, draft.id),
      nextAosrOrdinal: currentWorkspace.nextAosrOrdinal + 1,
    }));
    setCreateDocumentPanelOpen(false);
    navigateTo(aosrPath(object.id, selectedSection.id, selectedFolderId, draft.id));
  };

  const deleteAosrDraftFromCurrentFolder = (draftId: string): void => {
    const nextFolders = removeDemoIdFolderDraft(folders, draftId);

    setFolders(nextFolders);
    setDrafts((currentDrafts) =>
      maybeRenumberAutomaticSectionDrafts({
        currentDrafts: currentDrafts.filter((currentDraft) => currentDraft.id !== draftId),
        currentFolders: nextFolders,
        section: selectedSection,
        sectionTemplateSettings: selectedSectionTemplateSettings,
      }),
    );
    if (selectedSection !== undefined && selectedFolder !== undefined) {
      navigateTo(folderPath(object.id, selectedSection.id, selectedFolder.id));
    }
  };

  const deleteAosrDraftFromFolder = (draftId: string): void => {
    const draft = drafts.find((currentDraft) => currentDraft.id === draftId);

    if (draft === undefined) {
      return;
    }

    const draftLabel = getDocumentDisplayNumber(draft.actNumber);
    const shouldDelete = window.confirm(
      `Удалить акт ${draftLabel}? Акт будет удалён из текущей папки.`,
    );

    if (!shouldDelete) {
      return;
    }

    deleteAosrDraftFromCurrentFolder(draftId);
  };

  const moveAosrDraftInSelectedFolder = (
    draftId: string,
    direction: DemoIdFolderDraftMoveDirection,
  ): void => {
    if (selectedFolderId === null || selectedSection === undefined) {
      return;
    }

    updateWorkspace(object.id, (currentWorkspace) => {
      const nextFolders = moveDemoIdFolderDraftByDirection(
        currentWorkspace.folders,
        selectedFolderId,
        draftId,
        direction,
      );

      if (nextFolders === currentWorkspace.folders) {
        return currentWorkspace;
      }

      return {
        ...currentWorkspace,
        drafts: maybeRenumberAutomaticSectionDrafts({
          currentDrafts: currentWorkspace.drafts,
          currentFolders: nextFolders,
          section: selectedSection,
          sectionTemplateSettings: selectedSectionTemplateSettings,
        }),
        folders: nextFolders,
      };
    });
  };

  const moveFolderInSelectedSection = (
    folderId: DemoIdFolderId,
    direction: DemoDocumentationSectionFolderMoveDirection,
  ): void => {
    if (selectedSection === undefined) {
      return;
    }

    const shouldMove = window.confirm(
      'Порядок папок влияет на автоматическую нумерацию актов по разделу. После перемещения номера автоматических актов будут пересчитаны. Переместить папку?',
    );

    if (!shouldMove) {
      return;
    }

    const nextSections = moveDemoDocumentationSectionFolderByDirection(
      sections,
      selectedSection.id,
      folderId,
      direction,
    );

    if (nextSections === sections) {
      return;
    }

    const nextSection = getDemoDocumentationSectionById(selectedSection.id, nextSections);
    const nextSectionTemplateSettings =
      sectionTemplateSettingsById[nextSection.templateSettingsId] ??
      createSectionTemplateSettings(nextSection);

    setSections(nextSections);
    setDrafts((currentDrafts) =>
      maybeRenumberAutomaticSectionDrafts({
        currentDrafts,
        currentFolders: folders,
        section: nextSection,
        sectionTemplateSettings: nextSectionTemplateSettings,
      }),
    );
  };

  const duplicateAosrDraft = (sourceDraftId: string): void => {
    duplicateAosrDraftWithMode(sourceDraftId, { openEditor: true });
  };

  const duplicateAosrDraftFromFolderList = (sourceDraftId: string): void => {
    duplicateAosrDraftWithMode(sourceDraftId, { openEditor: false });
  };

  const duplicateAosrDraftWithMode = (
    sourceDraftId: string,
    { openEditor }: { readonly openEditor: boolean },
  ): void => {
    if (selectedSection === undefined) {
      return;
    }

    const result = duplicateAosrDraftInFolder({
      currentDrafts: drafts,
      currentFolders: folders,
      duplicateDraftId: `aosr-draft-duplicate-${String(workspace.nextAosrOrdinal)}`,
      section: selectedSection,
      sectionTemplateSettings: selectedSectionTemplateSettings,
      sourceDraftId,
    });

    if (result === null) {
      return;
    }

    updateWorkspace(object.id, (currentWorkspace) => ({
      ...currentWorkspace,
      drafts: result.drafts,
      folders: result.folders,
      nextAosrOrdinal: currentWorkspace.nextAosrOrdinal + 1,
    }));
    if (openEditor) {
      navigateTo(
        aosrPath(
          object.id,
          result.duplicatedDraft.sectionId,
          result.duplicatedDraft.folderId,
          result.duplicatedDraft.id,
        ),
      );
    }
  };

  const updateSelectedSectionTemplateSettings = (
    nextSectionTemplateSettings: DemoSectionTemplateSettings,
  ): void => {
    if (selectedSection === undefined) {
      return;
    }

    setSectionTemplateSettingsById((currentDefaults) => ({
      ...currentDefaults,
      [selectedSection.templateSettingsId]: nextSectionTemplateSettings,
    }));
  };

  const copySelectedSectionTemplateToClipboard = (): void => {
    if (selectedSection === undefined) {
      return;
    }

    setSectionTemplateClipboard({
      sectionTemplateSettings: cloneSectionTemplateSettingsForClipboard(
        selectedSectionTemplateSettings,
      ),
      sourceObjectId: object.id,
      sourceObjectTitle: object.title,
      sourceSectionId: selectedSection.id,
      sourceSectionName: selectedSection.name,
    });
    setLastTemplateCopyMessage('Шаблонные значения скопированы.');
  };

  const pasteSectionTemplateFromClipboard = (): void => {
    if (
      selectedSection === undefined ||
      sectionTemplateClipboard === null ||
      (sectionTemplateClipboard.sourceObjectId === object.id &&
        sectionTemplateClipboard.sourceSectionId === selectedSection.id)
    ) {
      return;
    }

    const shouldPaste = window.confirm(
      `Вставить шаблонные значения из раздела «${sectionTemplateClipboard.sourceSectionName}» объекта «${sectionTemplateClipboard.sourceObjectTitle}»?\n` +
        'Будут заменены шаблонные значения текущего раздела.\n' +
        'Папки, акты, выпущенные комплекты и файлы не изменятся.\n' +
        'Префикс текущего раздела сохранится.\n' +
        'Продолжить?',
    );

    if (!shouldPaste) {
      return;
    }

    setSectionTemplateSettingsById((currentDefaults) => {
      const currentTargetSettings = currentDefaults[selectedSection.templateSettingsId];

      return {
        ...currentDefaults,
        [selectedSection.templateSettingsId]: copySectionTemplateSettingsToTarget(
          sectionTemplateClipboard.sectionTemplateSettings,
          selectedSection,
          currentTargetSettings,
        ),
      };
    });
    setLastTemplateCopyMessage('Шаблонные значения вставлены. Префикс текущего раздела сохранён.');
  };

  const renumberSelectedSectionDrafts = (): void => {
    if (
      selectedSection === undefined ||
      selectedAutomaticSectionDrafts.length === 0 ||
      selectedSectionTemplateSettings.sectionTemplate.numberingMode !== 'automatic'
    ) {
      return;
    }

    const shouldRenumber = window.confirm(
      'Пересчитать автоматические номера раздела?\n' +
        `Будут изменены номера только автоматически пронумерованных актов: ${formatRenumberedActCount(
          selectedAutomaticSectionDrafts.length,
        )}.\n` +
        'Ручные номера останутся без изменений.\n' +
        'Продолжить?',
    );

    if (!shouldRenumber) {
      return;
    }

    setDrafts((currentDrafts) =>
      renumberSectionDraftsByFolderOrder({
        currentDrafts,
        currentFolders: folders,
        section: selectedSection,
        sectionTemplateSettings: selectedSectionTemplateSettings,
      }),
    );
    setLastTemplateCopyMessage('Автоматические номера пересчитаны. Ручные номера не изменены.');
  };

  return (
    <main className="object-workspace-shell">
      <ObjectWorkspaceNavigation
        activeSection={activeSection}
        drafts={drafts}
        folders={folders}
        object={object}
        sections={sections}
        selectedDraftId={selectedDraftId}
        selectedFolderId={selectedFolderId}
        selectedSectionId={selectedSectionId}
      />

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} route={route} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            objectId={object.id}
            sections={sections}
            selectedSection={overviewSection}
            selectedSectionFolders={overviewSectionFolders}
            onCreateSection={openCreateSectionPanel}
          />
        ) : null}

        {activeSection === 'sections' ? (
          <ObjectSectionsPage
            drafts={drafts}
            isCreateSectionPanelOpen={isCreateSectionPanelOpen}
            sectionName={sectionNameInput}
            folders={folders}
            objectId={object.id}
            sections={sections}
            onChangeSectionName={setSectionNameInput}
            onCloseCreateSectionPanel={() => {
              setCreateSectionPanelOpen(false);
            }}
            onCreateSection={createSection}
            onOpenCreateSectionPanel={openCreateSectionPanel}
          />
        ) : null}

        {activeSection === 'section' ? (
          <ObjectSectionPage
            drafts={drafts}
            folderName={folderNameInput}
            isCreateFolderPanelOpen={isCreateFolderPanelOpen}
            objectId={object.id}
            selectedSection={selectedSection}
            selectedSectionFolders={selectedSectionFolders}
            onChangeFolderName={setFolderNameInput}
            onCloseCreateFolderPanel={() => {
              setCreateFolderPanelOpen(false);
            }}
            onCreateFolder={createFolder}
            onOpenCreateFolderPanel={openCreateFolderPanel}
            onMoveFolder={moveFolderInSelectedSection}
          />
        ) : null}

        {activeSection === 'folder' &&
        !isIntermediatePackageOpen &&
        selectedFolder !== undefined ? (
          <ObjectFolderPage
            drafts={selectedFolderDrafts}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            folder={selectedFolder}
            objectId={object.id}
            sectionId={selectedSection?.id}
            sectionName={selectedSection?.name}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={createAosrDraft}
            onDeleteAosr={deleteAosrDraftFromFolder}
            onDuplicateAosr={duplicateAosrDraftFromFolderList}
            onMoveAosr={moveAosrDraftInSelectedFolder}
            onOpenCreateDocumentPanel={openCreateDocumentPanel}
            onOpenIntermediatePackage={() => {
              setCreateDocumentPanelOpen(false);
              setIntermediatePackageOpen(true);
            }}
          />
        ) : null}

        {route.screen === 'folder' && isIntermediatePackageOpen && selectedFolder !== undefined ? (
          <section aria-label="Промежуточная ИД папки">
            <button
              className="secondary-action"
              onClick={() => {
                setIntermediatePackageOpen(false);
              }}
              type="button"
            >
              ← К документам папки
            </button>
            <ObjectIntermediatePackagePage drafts={drafts} folder={selectedFolder} />
          </section>
        ) : null}

        {isAosrVisible && (selectedFolder !== undefined || activeSection === 'settings') ? (
          <DemoAosrWorkspacePage
            drafts={drafts}
            initialSelectedDraftId={selectedDraftId}
            selectedDraftId={selectedDraftId}
            isEmbeddedInObjectWorkspace
            isSectionTemplateSettingsPage={activeSection === 'settings'}
            sectionTemplateSettings={selectedSectionTemplateSettings}
            onDraftsChange={setDrafts}
            onDeleteDraft={deleteAosrDraftFromCurrentFolder}
            onSelectDraft={(draftId) => {
              if (selectedSection !== undefined && selectedFolder !== undefined) {
                navigateTo(aosrPath(object.id, selectedSection.id, selectedFolder.id, draftId));
              }
            }}
            getDraftHref={(draftId) =>
              selectedSection === undefined || selectedFolder === undefined
                ? undefined
                : aosrPath(object.id, selectedSection.id, selectedFolder.id, draftId)
            }
            onSectionTemplateSettingsChange={updateSelectedSectionTemplateSettings}
            lastTemplateCopyMessage={lastTemplateCopyMessage}
            folderName={selectedFolder?.name}
            objectId={object.id}
            objectTitle={object.title}
            objectSettingsCloseHref={
              selectedSection === undefined ? undefined : sectionPath(object.id, selectedSection.id)
            }
            automaticSectionDraftCount={selectedAutomaticSectionDrafts.length}
            sectionId={selectedSection?.id}
            sectionName={selectedSection?.name}
            sectionTemplateClipboard={sectionTemplateClipboard}
            visibleDraftIds={selectedFolder?.draftIds ?? []}
            onCopySectionTemplate={copySelectedSectionTemplateToClipboard}
            onCreateActInFolder={openCreateDocumentPanel}
            onDuplicateDraft={duplicateAosrDraft}
            onMoveDraft={moveAosrDraftInSelectedFolder}
            onObjectSettingsClosed={() => {
              if (selectedSection !== undefined) {
                navigateTo(sectionPath(object.id, selectedSection.id));
              }
            }}
            onPasteSectionTemplate={pasteSectionTemplateFromClipboard}
            onRenumberSectionDrafts={renumberSelectedSectionDrafts}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'final-package' ? (
          <ObjectFinalPackagePage
            drafts={selectedSectionDrafts}
            folders={selectedSectionFolders}
            sectionName={selectedSection?.name}
          />
        ) : null}
      </section>
    </main>
  );
}

interface ObjectWorkspaceHeaderProps {
  readonly object: MockObjectCard;
  readonly route: ObjectWorkspaceRoute;
}

function ObjectWorkspaceHeader({ object, route }: ObjectWorkspaceHeaderProps): React.JSX.Element {
  return (
    <header className="object-workspace-header">
      <div className="object-workspace-header__title">
        <AppBreadcrumbs
          {...('draft' in route ? { draft: route.draft } : {})}
          {...('folder' in route ? { folder: route.folder } : {})}
          object={object}
          screen={route.screen satisfies AppBreadcrumbScreen}
          {...('section' in route ? { section: route.section } : {})}
        />
        <h1 id="object-workspace-title">{object.title}</h1>
        <p>{object.address}</p>
      </div>
    </header>
  );
}

function getActiveWorkspaceSection(screen: ObjectWorkspaceRoute['screen']): ObjectWorkspaceSection {
  switch (screen) {
    case 'overview':
    case 'documents':
    case 'sections':
    case 'section':
    case 'folder':
    case 'aosr':
      return screen;
    case 'template':
      return 'settings';
    case 'final':
      return 'final-package';
  }
}

function createWorkspaceFieldSetter<TKey extends keyof DemoObjectWorkspaceSession>(
  objectId: string,
  updateWorkspace: (
    objectId: string,
    updater: (current: DemoObjectWorkspaceSession) => DemoObjectWorkspaceSession,
  ) => void,
  field: TKey,
): (action: SetStateAction<DemoObjectWorkspaceSession[TKey]>) => void {
  return (action) => {
    updateWorkspace(objectId, (currentWorkspace) => ({
      ...currentWorkspace,
      [field]: typeof action === 'function' ? action(currentWorkspace[field]) : action,
    }));
  };
}

interface ObjectOverviewProps {
  readonly objectId: string;
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onCreateSection: () => void;
}

function ObjectOverview({
  objectId,
  sections,
  selectedSection,
  selectedSectionFolders,
  onCreateSection,
}: ObjectOverviewProps): React.JSX.Element {
  return (
    <section className="object-overview" aria-labelledby="object-overview-title">
      <div className="object-overview__heading">
        <p className="section-kicker">Обзор</p>
        <h2 id="object-overview-title">Обзор объекта</h2>
      </div>

      {selectedSection === undefined ? (
        <section
          className="object-overview__focus object-overview__focus--empty"
          aria-labelledby="overview-focus-title"
        >
          <div className="object-overview__focus-main">
            <p className="section-kicker">Начало работы</p>
            <h3 id="overview-focus-title">Создайте первый раздел ИД</h3>
            <p>
              Раздел объединяет свои папки, промежуточные комплекты и итоговую ИД. Например:
              «Вентиляция» или «Отопление».
            </p>
          </div>
          <div className="object-overview__focus-actions">
            <button
              className="action-button action-button--primary"
              onClick={onCreateSection}
              type="button"
            >
              Создать раздел
            </button>
          </div>
        </section>
      ) : (
        <section className="object-overview__focus" aria-labelledby="overview-focus-title">
          <div className="object-overview__focus-main">
            <p className="section-kicker">Продолжить работу</p>
            <h3 id="overview-focus-title">{selectedSection.name}</h3>
            <p>
              Раздел содержит {selectedSectionFolders.length}{' '}
              {getFolderCountLabel(selectedSectionFolders.length)}. Итоговая ИД по разделу
              собирается именно из папок выбранного раздела.
            </p>
          </div>
          <div className="object-overview__focus-actions">
            <Link
              className="action-button action-button--primary"
              to={sectionPath(objectId, selectedSection.id)}
            >
              Открыть раздел
            </Link>
            <Link className="compact-toggle" to={objectSectionsPath(objectId)}>
              Перейти к разделам ИД
            </Link>
          </div>
        </section>
      )}

      {sections.length > 0 ? (
        <section className="object-overview__panel" aria-labelledby="overview-sections-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Разделы ИД</p>
            <h3 id="overview-sections-title">Рабочие разделы объекта</h3>
          </div>
          <ul className="object-overview__recent-list object-overview__recent-list--wide">
            {sections.map((section) => (
              <li key={section.id}>
                <Link to={sectionPath(objectId, section.id)}>
                  <span>
                    <strong>{section.name}</strong>
                    <small>
                      {section.folderIds.length} {getFolderCountLabel(section.folderIds.length)}
                    </small>
                  </span>
                  <span>
                    <small>Итоговая ИД</small>
                    <strong>по разделу</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="object-overview__panel" aria-labelledby="overview-workflow-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Порядок работы</p>
          <h3 id="overview-workflow-title">Объект → раздел → папка → акт</h3>
        </div>
        <ol className="object-workspace-help-list">
          <li>Выберите или создайте раздел ИД.</li>
          <li>Внутри раздела создайте папку.</li>
          <li>Акты создаются только внутри выбранной папки.</li>
        </ol>
      </section>
    </section>
  );
}

interface ObjectSectionsPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly isCreateSectionPanelOpen: boolean;
  readonly sectionName: string;
  readonly folders: readonly DemoIdFolder[];
  readonly objectId: string;
  readonly sections: readonly DemoDocumentationSection[];
  readonly onChangeSectionName: (value: string) => void;
  readonly onCloseCreateSectionPanel: () => void;
  readonly onCreateSection: () => void;
  readonly onOpenCreateSectionPanel: () => void;
}

function ObjectSectionsPage({
  drafts,
  isCreateSectionPanelOpen,
  sectionName,
  folders,
  objectId,
  sections,
  onChangeSectionName,
  onCloseCreateSectionPanel,
  onCreateSection,
  onOpenCreateSectionPanel,
}: ObjectSectionsPageProps): React.JSX.Element {
  return (
    <section className="object-folders" aria-labelledby="object-folders-title">
      <div className="object-folders__topline">
        <div className="object-folders__heading">
          <p className="section-kicker">Разделы ИД — список разделов</p>
          <h2 id="object-folders-title">Разделы исполнительной документации</h2>
          <p>
            Раздел — это направление или часть работ на объекте. Например: Вентиляция, Отопление,
            ВК, Дымоудаление, Система В1.
          </p>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateSectionPanel}
            type="button"
          >
            Создать раздел
          </button>
        </div>
      </div>

      {isCreateSectionPanelOpen ? (
        <form
          className="object-folder-create-panel"
          aria-label="Создать раздел ИД"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateSection();
          }}
        >
          <div>
            <p className="section-kicker">Новый раздел</p>
            <h3>Как назвать раздел?</h3>
            <p>Например: «Вентиляция», «Отопление», «Водоснабжение» или «Система В1».</p>
          </div>
          <label>
            Название раздела
            <input
              autoFocus
              onChange={(event) => {
                onChangeSectionName(event.currentTarget.value);
              }}
              placeholder="Введите произвольное название раздела"
              value={sectionName}
            />
          </label>
          <div className="object-folder-create-panel__actions">
            <button className="compact-toggle" onClick={onCloseCreateSectionPanel} type="button">
              Отмена
            </button>
            <button
              className="action-button action-button--primary"
              disabled={sectionName.trim() === ''}
              type="submit"
            >
              Создать раздел
            </button>
          </div>
        </form>
      ) : null}

      {sections.length === 0 ? (
        <section className="object-folders__empty" aria-label="Разделов ИД пока нет">
          <span aria-hidden="true">◧</span>
          <div>
            <h3>Разделов ИД пока нет</h3>
            <p>Создайте первый раздел, затем добавьте в него папку и акты.</p>
          </div>
        </section>
      ) : (
        <>
          <div className="object-section-card-list" aria-label="Все разделы ИД">
            {sections.map((section) => {
              const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
              const sectionDrafts = getDemoDocumentationSectionDrafts(section, folders, drafts);
              const lastDraft = getLatestDraft(sectionDrafts);

              return (
                <article className="object-section-card" key={section.id}>
                  <span className="object-section-card__icon" aria-hidden="true">
                    ◧
                  </span>
                  <div className="object-section-card__body">
                    <h3>{section.name}</h3>
                    <p className="object-section-card__meta">
                      {sectionFolders.length === 0
                        ? 'Папок пока нет'
                        : `${String(sectionFolders.length)} ${getFolderCountLabel(
                            sectionFolders.length,
                          )} · ${String(sectionDrafts.length)} ${getActCountLabel(
                            sectionDrafts.length,
                          )}`}
                    </p>
                    {lastDraft === undefined ? (
                      <p className="object-section-card__hint">Акты пока не созданы</p>
                    ) : (
                      <p className="object-section-card__hint">
                        Последний акт: {getDocumentDisplayNumber(lastDraft.actNumber)} от{' '}
                        {formatShortDate(lastDraft.actDate)}
                      </p>
                    )}
                  </div>
                  <div className="object-section-card__actions">
                    <Link
                      aria-label={`Открыть раздел ${section.name}`}
                      className="compact-toggle compact-toggle--accent"
                      to={sectionPath(objectId, section.id)}
                    >
                      Открыть раздел
                    </Link>
                    <Link
                      aria-label={`Шаблонные значения раздела ${section.name}`}
                      className="compact-toggle"
                      to={sectionTemplatePath(objectId, section.id)}
                    >
                      Шаблонные значения раздела
                    </Link>
                    <button
                      aria-label={`Дополнительные действия раздела ${section.name}`}
                      className="compact-toggle compact-toggle--icon"
                      type="button"
                    >
                      …
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="object-overview__panel" aria-labelledby="sections-start-title">
            <div className="object-overview__panel-heading">
              <p className="section-kicker">С чего начать?</p>
              <h3 id="sections-start-title">Простой порядок работы</h3>
            </div>
            <ol className="object-workspace-help-list">
              <li>Создайте раздел.</li>
              <li>Создайте папку внутри раздела.</li>
              <li>Создайте акт уже внутри папки.</li>
            </ol>
          </section>
        </>
      )}
    </section>
  );
}

interface ObjectSectionPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly folderName: string;
  readonly isCreateFolderPanelOpen: boolean;
  readonly objectId: string;
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onChangeFolderName: (value: string) => void;
  readonly onCloseCreateFolderPanel: () => void;
  readonly onCreateFolder: () => void;
  readonly onOpenCreateFolderPanel: () => void;
  readonly onMoveFolder: (
    folderId: DemoIdFolderId,
    direction: DemoDocumentationSectionFolderMoveDirection,
  ) => void;
}

function ObjectSectionPage({
  drafts,
  folderName,
  isCreateFolderPanelOpen,
  objectId,
  selectedSection,
  selectedSectionFolders,
  onChangeFolderName,
  onCloseCreateFolderPanel,
  onCreateFolder,
  onOpenCreateFolderPanel,
  onMoveFolder,
}: ObjectSectionPageProps): React.JSX.Element {
  if (selectedSection === undefined) {
    return (
      <section className="object-folders__empty" aria-label="Раздел не выбран">
        <span aria-hidden="true">◧</span>
        <div>
          <h2>Раздел не выбран</h2>
          <p>Откройте раздел на экране «Разделы ИД».</p>
        </div>
      </section>
    );
  }

  return (
    <section className="object-folders" aria-labelledby="section-overview-title">
      <div className="object-folders__topline">
        <div className="object-folders__heading">
          <h2 id="section-overview-title">{selectedSection.name}</h2>
          <p>
            Раздел исполнительной документации. Внутри раздела создаются папки, а акты создаются уже
            внутри папок.
          </p>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateFolderPanel}
            type="button"
          >
            Создать папку
          </button>
          <Link className="compact-toggle" to={sectionFinalPath(objectId, selectedSection.id)}>
            Итоговая ИД по разделу
          </Link>
          <Link className="compact-toggle" to={sectionTemplatePath(objectId, selectedSection.id)}>
            Шаблонные значения раздела
          </Link>
          <button
            aria-label={`Дополнительные действия раздела ${selectedSection.name}`}
            className="compact-toggle compact-toggle--icon"
            type="button"
          >
            …
          </button>
        </div>
      </div>

      {isCreateFolderPanelOpen ? (
        <form
          className="object-folder-create-panel"
          aria-label="Создать папку ИД"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateFolder();
          }}
        >
          <div>
            <p className="section-kicker">Новая папка</p>
            <h3>Как назвать папку?</h3>
            <p>
              Папка будет создана внутри раздела <strong>{selectedSection.name}</strong>. Например:
              «Сентябрь 2026», «Монтаж воздуховодов» или «Этап 1».
            </p>
          </div>
          <label>
            Название папки
            <input
              autoFocus
              onChange={(event) => {
                onChangeFolderName(event.currentTarget.value);
              }}
              placeholder="Введите произвольное название"
              value={folderName}
            />
          </label>
          <div className="object-folder-create-panel__actions">
            <button className="compact-toggle" onClick={onCloseCreateFolderPanel} type="button">
              Отмена
            </button>
            <button
              className="action-button action-button--primary"
              disabled={folderName.trim() === ''}
              type="submit"
            >
              Создать папку
            </button>
          </div>
        </form>
      ) : null}

      <section className="object-overview__panel" aria-labelledby="section-folders-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Папки раздела</p>
          <h3 id="section-folders-title">Папки раздела</h3>
        </div>
        {selectedSectionFolders.length === 0 ? (
          <div className="object-folder-panel__empty">
            <strong>В этом разделе пока нет папок.</strong>
            <p>
              Папка — это этап, месяц или комплект документов внутри раздела. Например: «Сентябрь
              2026», «Монтаж воздуховодов», «Этап 1».
            </p>
            <button
              className="action-button action-button--primary"
              onClick={onOpenCreateFolderPanel}
              type="button"
            >
              Создать папку
            </button>
          </div>
        ) : (
          <div className="object-folder-directory" aria-label="Папки раздела">
            {selectedSectionFolders.map((folder, folderIndex) => {
              const folderDrafts = getDemoIdFolderDrafts(folder, drafts);
              const lastDraft = getLatestDraft(folderDrafts);

              return (
                <div
                  aria-label={`Папка ${folder.name}`}
                  className="object-folder-row"
                  key={folder.id}
                  role="group"
                >
                  <span
                    className="object-folder-row__order"
                    aria-label={`Порядок папки ${folder.name}`}
                  >
                    <button
                      disabled={folderIndex === 0}
                      onClick={() => {
                        onMoveFolder(folder.id, 'up');
                      }}
                      type="button"
                    >
                      ↑ Вверх
                    </button>
                    <button
                      disabled={folderIndex === selectedSectionFolders.length - 1}
                      onClick={() => {
                        onMoveFolder(folder.id, 'down');
                      }}
                      type="button"
                    >
                      ↓ Вниз
                    </button>
                  </span>
                  <span className="object-folder-row__icon" aria-hidden="true">
                    ▣
                  </span>
                  <span className="object-folder-row__main">
                    <strong>{folder.name}</strong>
                    <small>
                      {folderDrafts.length} {getActCountLabel(folderDrafts.length)}
                    </small>
                  </span>
                  <span className="object-folder-row__count">
                    {lastDraft === undefined
                      ? 'Обновлений нет'
                      : `Обновлено: ${formatShortDate(lastDraft.actDate)}`}
                  </span>
                  <span className="object-folder-row__actions">
                    <Link
                      aria-label={`Открыть папку ${folder.name}`}
                      className="compact-toggle"
                      to={folderPath(objectId, selectedSection.id, folder.id)}
                    >
                      Открыть
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

interface CreateDocumentPanelProps {
  readonly selectedSectionName: string | undefined;
  readonly selectedFolder: DemoIdFolder;
  readonly onClose: () => void;
  readonly onCreateAosr: () => void;
}

function CreateDocumentPanel({
  selectedSectionName,
  selectedFolder,
  onClose,
  onCreateAosr,
}: CreateDocumentPanelProps): React.JSX.Element {
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<string>(aosrActType.id);

  return (
    <section
      className="object-overview__create-panel"
      role="dialog"
      aria-labelledby="create-document-title"
    >
      <div className="object-overview__create-panel-header">
        <p className="section-kicker">Новый акт</p>
        <h3 id="create-document-title">Создание акта</h3>
        <p>
          Акт будет сохранён в папке <strong>«{selectedFolder.name}»</strong>
          {selectedSectionName === undefined ? '.' : ` раздела «${selectedSectionName}».`}
        </p>
      </div>
      <div className="object-overview__numbering-note">
        <h4>Номер будет присвоен после создания</h4>
        <p>
          Номер будет назначен после создания акта, если автоматическая нумерация включена в
          шаблонных значениях раздела. Если нумерация ручная — номер можно указать в редактировании
          акта.
        </p>
      </div>
      <ul className="document-type-card-list" role="radiogroup" aria-label="Тип акта">
        {registeredDemoActTypes.map((actType) => {
          const isSelected = selectedDocumentTypeId === actType.id;

          return (
            <li key={actType.id}>
              <button
                aria-checked={isSelected}
                className={`document-type-card document-type-card--available${
                  isSelected ? ' document-type-card--selected' : ''
                }`}
                onClick={() => {
                  setSelectedDocumentTypeId(actType.id);
                }}
                role="radio"
                type="button"
              >
                <span className="document-type-card__icon" aria-hidden="true">
                  {isSelected ? '✓' : actType.code}
                </span>
                <span className="document-type-card__body">
                  <strong>{actType.code}</strong>
                  <small>
                    {actType.code} — {actType.title}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
        <li className="document-type-card document-type-card--disabled" aria-disabled="true">
          <span className="document-type-card__icon" aria-hidden="true">
            АИ
          </span>
          <span className="document-type-card__body">
            <strong>Акт испытаний</strong>
            <small>Будущий тип документа — скоро</small>
          </span>
          <button className="compact-toggle" disabled type="button">
            Скоро
          </button>
        </li>
        <li className="document-type-card document-type-card--disabled" aria-disabled="true">
          <span className="document-type-card__icon" aria-hidden="true">
            ИС
          </span>
          <span className="document-type-card__body">
            <strong>Исполнительная схема</strong>
            <small>Будущий тип документа — скоро</small>
          </span>
          <button className="compact-toggle" disabled type="button">
            Скоро
          </button>
        </li>
      </ul>
      <div className="object-folder-create-panel__actions">
        <button
          className="action-button action-button--primary"
          onClick={() => {
            if (selectedDocumentTypeId === 'aosr') {
              onCreateAosr();
            }
          }}
          type="button"
        >
          Создать акт
        </button>
        <button className="compact-toggle" onClick={onClose} type="button">
          Отмена
        </button>
      </div>
    </section>
  );
}

interface ObjectFolderPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly isCreateDocumentPanelOpen: boolean;
  readonly folder: DemoIdFolder;
  readonly objectId: string;
  readonly sectionId: DemoDocumentationSectionId | undefined;
  readonly sectionName: string | undefined;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onDeleteAosr: (draftId: string) => void;
  readonly onDuplicateAosr: (draftId: string) => void;
  readonly onMoveAosr: (draftId: string, direction: DemoIdFolderDraftMoveDirection) => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenIntermediatePackage: () => void;
}

function ObjectFolderPage({
  drafts,
  isCreateDocumentPanelOpen,
  folder,
  objectId,
  sectionId,
  sectionName,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onDeleteAosr,
  onDuplicateAosr,
  onMoveAosr,
  onOpenCreateDocumentPanel,
  onOpenIntermediatePackage,
}: ObjectFolderPageProps): React.JSX.Element {
  const folderRegistry = buildFolderRegistryModel(folder, drafts);

  return (
    <section className="object-folder-workspace" aria-labelledby="object-folder-title">
      <div className="object-folder-hero">
        <div className="object-folder-hero__title">
          <span className="object-folder-hero__icon" aria-hidden="true">
            ▣
          </span>
          <div>
            <p className="section-kicker">Рабочая папка ИД</p>
            <h2 id="object-folder-title">{folder.name}</h2>
            <p>
              Разделы ИД / <strong>{sectionName ?? 'без названия'}</strong> / {folder.name}
            </p>
            <p>Папка содержит документы одного этапа, месяца или комплекта работ.</p>
          </div>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateDocumentPanel}
            type="button"
          >
            Создать акт
          </button>
          <button className="compact-toggle" onClick={onOpenIntermediatePackage} type="button">
            Промежуточная ИД по папке
          </button>
          <button
            aria-label={`Дополнительные действия папки ${folder.name}`}
            className="compact-toggle compact-toggle--icon"
            type="button"
          >
            …
          </button>
        </div>
      </div>

      {isCreateDocumentPanelOpen ? (
        <CreateDocumentPanel
          selectedSectionName={sectionName}
          selectedFolder={folder}
          onClose={onCloseCreateDocumentPanel}
          onCreateAosr={onCreateAosr}
        />
      ) : null}

      <div className="object-folder-grid">
        <section
          className="object-folder-panel object-folder-panel--documents object-folder-panel--primary"
          aria-labelledby="folder-documents-title"
        >
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Состав папки</p>
            <h3 id="folder-documents-title">Акты в папке</h3>
          </div>
          {drafts.length === 0 ? (
            <div className="object-folder-panel__empty">
              <strong>В этой папке пока нет актов</strong>
              <p>Создайте первый акт — он сразу появится в составе папки.</p>
            </div>
          ) : (
            <ul className="object-folder-draft-list" aria-label={`Акты в папке ${folder.name}`}>
              {drafts.map((draft, draftIndex) => (
                <li
                  className="object-folder-draft-card"
                  data-folder-draft-id={draft.id}
                  key={draft.id}
                >
                  <div
                    className="object-folder-draft-card__order"
                    aria-label={`Порядок акта ${getDocumentDisplayNumber(draft.actNumber)}`}
                  >
                    <button
                      disabled={draftIndex === 0}
                      onClick={() => {
                        onMoveAosr(draft.id, 'up');
                      }}
                      type="button"
                    >
                      ↑ Вверх
                    </button>
                    <button
                      disabled={draftIndex === drafts.length - 1}
                      onClick={() => {
                        onMoveAosr(draft.id, 'down');
                      }}
                      type="button"
                    >
                      ↓ Вниз
                    </button>
                  </div>
                  <div className="object-folder-draft-card__body">
                    <div className="object-folder-draft-card__title">
                      <strong className="object-folder-draft-card__number">
                        {getDocumentDisplayNumber(draft.actNumber)}
                      </strong>
                      <span className="object-folder-draft-card__type">
                        {aosrActType.code} — {aosrActType.title}
                      </span>
                    </div>
                    <p
                      className={
                        draft.workDescription.trim() === ''
                          ? 'object-folder-draft-card__work object-folder-draft-card__work--empty'
                          : 'object-folder-draft-card__work'
                      }
                    >
                      {getDraftWorkDescriptionPreview(draft)}
                    </p>
                    {draft.actDate.trim() === '' ? null : (
                      <p className="object-folder-draft-card__date">
                        Дата: <span>{formatShortDate(draft.actDate)}</span>
                      </p>
                    )}
                  </div>
                  <div className="object-folder-draft-card__actions">
                    {sectionId === undefined ? null : (
                      <Link
                        aria-label={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                        className="compact-toggle"
                        title={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                        to={aosrPath(objectId, sectionId, folder.id, draft.id)}
                      >
                        Открыть
                      </Link>
                    )}
                    <button
                      className="compact-toggle"
                      onClick={() => {
                        onDuplicateAosr(draft.id);
                      }}
                      title={`Дублировать акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                      type="button"
                    >
                      Дублировать
                    </button>
                    <button
                      aria-label="Удалить акт"
                      className="compact-toggle compact-toggle--danger object-folder-draft-card__delete"
                      onClick={() => {
                        onDeleteAosr(draft.id);
                      }}
                      title={`Удалить акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                      type="button"
                    >
                      Удалить акт
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="object-folder-panel__note">
            Меняйте порядок кнопками ↑ Вверх / ↓ Вниз. При автоматической нумерации порядок сразу
            пересчитывает номера.
          </p>
        </section>

        <div className="object-folder-generated-views" aria-label="Действия папки">
          <section
            className="object-folder-panel object-folder-panel--secondary"
            aria-labelledby="folder-registry-title"
          >
            <div className="object-overview__panel-heading">
              <p className="section-kicker">Экранный реестр</p>
              <h3 id="folder-registry-title">Реестр папки</h3>
              <p>{folderRegistry.description}</p>
            </div>
            <DerivedRegistryTable registry={folderRegistry} />
          </section>

          <section
            className="object-folder-panel object-folder-placeholder object-folder-panel--secondary"
            aria-labelledby="folder-package-title"
          >
            <span className="object-folder-placeholder__icon" aria-hidden="true">
              ◫
            </span>
            <div>
              <p className="section-kicker">Комплект папки</p>
              <h3 id="folder-package-title">Промежуточная ИД по папке</h3>
              <p>Реестр и печатный состав открываются в промежуточной ИД этой папки.</p>
              <button className="compact-toggle" onClick={onOpenIntermediatePackage} type="button">
                Открыть промежуточную ИД по папке
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function getDraftWorkDescriptionPreview(draft: DemoAosrDraft): string {
  const workDescription = draft.workDescription.trim();

  return workDescription === '' ? 'Работы не заполнены' : workDescription;
}
