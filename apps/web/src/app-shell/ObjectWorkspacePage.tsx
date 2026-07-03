import { useMemo, useState } from 'react';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage, ObjectIntermediatePackagePage } from './ObjectFinalPackagePage.js';
import { ObjectWorkspaceNavigation } from './ObjectWorkspaceNavigation.js';
import type { MockObjectCard } from './mock-dashboard.js';
import {
  addDemoDocumentationSectionFolder,
  createDemoDocumentationSection,
  demoDocumentationSections,
  getDemoDocumentationSectionById,
  getDemoDocumentationSectionDrafts,
  getDemoDocumentationSectionForFolderId,
  getDemoDocumentationSectionFolders,
  moveDemoDocumentationSectionFolderByDirection,
  type DemoDocumentationSection,
  type DemoDocumentationSectionFolderMoveDirection,
  type DemoDocumentationSectionId,
  type DemoDocumentationSections,
} from './object-documentation-sections.js';
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import {
  addDemoIdFolderDraft,
  createDemoIdFolder,
  demoIdFolders,
  getDemoIdFolderById,
  getDemoIdFolderDrafts,
  moveDemoIdFolderDraftByDirection,
  removeDemoIdFolderDraft,
  type DemoIdFolder,
  type DemoIdFolderDraftMoveDirection,
  type DemoIdFolderId,
  type DemoIdFolders,
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
  type DemoSectionTemplateSettingsById,
} from './object-section-template-settings.js';
import {
  cloneSectionTemplateSettingsForClipboard,
  type SectionTemplateClipboard,
} from './section-template-clipboard.js';

const aosrActType = getDemoActTypeById('aosr');

function buildInitialSectionTemplateSettings(
  hasDemoContent: boolean,
): DemoSectionTemplateSettingsById {
  if (!hasDemoContent) {
    return {};
  }

  return Object.fromEntries(
    demoDocumentationSections.map((section) => [
      section.templateSettingsId,
      createSectionTemplateSettings(section),
    ]),
  );
}

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly sectionTemplateClipboard: SectionTemplateClipboard | null;
  readonly onBackToObjects: () => void;
  readonly onSectionTemplateClipboardChange: (clipboard: SectionTemplateClipboard | null) => void;
}

export function ObjectWorkspacePage({
  object,
  sectionTemplateClipboard,
  onBackToObjects,
  onSectionTemplateClipboardChange,
}: ObjectWorkspacePageProps): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<ObjectWorkspaceSection>('overview');
  const hasDemoContent = object.workspaceSeed === 'demo-content';
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(
    hasDemoContent ? demoAosrWorkspace.drafts : [],
  );
  const [sections, setSections] = useState<DemoDocumentationSections>(
    hasDemoContent ? demoDocumentationSections : [],
  );
  const [selectedSectionId, setSelectedSectionId] = useState<DemoDocumentationSectionId | null>(
    hasDemoContent ? (demoDocumentationSections[0]?.id ?? null) : null,
  );
  const [sectionTemplateSettingsById, setSectionTemplateSettingsById] =
    useState<DemoSectionTemplateSettingsById>(() =>
      buildInitialSectionTemplateSettings(hasDemoContent),
    );
  const [folders, setFolders] = useState<DemoIdFolders>(hasDemoContent ? demoIdFolders : []);
  const [selectedFolderId, setSelectedFolderId] = useState<DemoIdFolderId | null>(
    hasDemoContent ? (demoIdFolders[0]?.id ?? null) : null,
  );
  const [selectedDraftId, setSelectedDraftId] = useState(
    hasDemoContent ? (demoAosrWorkspace.drafts[0]?.id ?? '') : '',
  );
  const [createdAosrDraftCount, setCreatedAosrDraftCount] = useState(1);
  const [createdFolderCount, setCreatedFolderCount] = useState(1);
  const [createdSectionCount, setCreatedSectionCount] = useState(1);
  const [isCreateDocumentPanelOpen, setCreateDocumentPanelOpen] = useState(false);
  const [isCreateFolderPanelOpen, setCreateFolderPanelOpen] = useState(false);
  const [isCreateSectionPanelOpen, setCreateSectionPanelOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [lastTemplateCopyMessage, setLastTemplateCopyMessage] = useState('');
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const selectedSection =
    selectedSectionId === null
      ? undefined
      : getDemoDocumentationSectionById(selectedSectionId, sections);
  const selectedSectionFolders =
    selectedSection === undefined
      ? []
      : getDemoDocumentationSectionFolders(selectedSection, folders);
  const selectedFolder =
    selectedFolderId === null ? undefined : getDemoIdFolderById(selectedFolderId, folders);
  const selectedSectionDrafts = useMemo(
    () =>
      selectedSection === undefined
        ? []
        : getDemoDocumentationSectionDrafts(selectedSection, folders, drafts),
    [drafts, folders, selectedSection],
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

  const openCreateDocumentPanel = (): void => {
    if (selectedFolder === undefined) {
      return;
    }

    setActiveSection('folder');
    setCreateDocumentPanelOpen(true);
  };

  const openCreateSectionPanel = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setSectionNameInput('');
    setCreateSectionPanelOpen(true);
    setActiveSection('sections');
  };

  const openSectionsPage = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('sections');
  };

  const openObjectDocumentsPage = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('documents');
  };

  const createSection = (): void => {
    const sectionName = sectionNameInput.trim();

    if (sectionName === '') {
      return;
    }

    const section = createDemoDocumentationSection(
      `section-created-${String(createdSectionCount)}`,
      sectionName,
    );

    setSections((currentSections) => [...currentSections, section]);
    setSectionTemplateSettingsById((currentDefaults) => ({
      ...currentDefaults,
      [section.templateSettingsId]: createSectionTemplateSettings(section),
    }));
    setSelectedSectionId(section.id);
    setSelectedFolderId(null);
    setSelectedDraftId('');
    setCreatedSectionCount((currentCount) => currentCount + 1);
    setCreateSectionPanelOpen(false);
    setSectionNameInput('');
    setActiveSection('section');
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
    setActiveSection('section');
  };

  const createFolder = (): void => {
    if (selectedSectionId === null) {
      return;
    }

    const folderName = folderNameInput.trim();

    if (folderName === '') {
      return;
    }

    const folder = createDemoIdFolder(`folder-created-${String(createdFolderCount)}`, folderName);

    setFolders((currentFolders) => [...currentFolders, folder]);
    setSections((currentSections) =>
      addDemoDocumentationSectionFolder(currentSections, selectedSectionId, folder.id),
    );
    setSelectedFolderId(folder.id);
    setSelectedDraftId('');
    setCreatedFolderCount((currentCount) => currentCount + 1);
    setCreateFolderPanelOpen(false);
    setFolderNameInput('');
    setActiveSection('folder');
  };

  const openSection = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(sectionId);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setLastTemplateCopyMessage('');
    setActiveSection('section');
  };

  const openFolder = (folderId: DemoIdFolderId): void => {
    const section = getDemoDocumentationSectionForFolderId(folderId, sections);

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(folderId);
    const folder = getDemoIdFolderById(folderId, folders);
    setSelectedDraftId(folder.draftIds[0] ?? '');
    setLastTemplateCopyMessage('');
    setActiveSection('folder');
  };

  const openAosr = (folderId: DemoIdFolderId | null = selectedFolderId, draftId?: string): void => {
    if (folderId === null) {
      return;
    }

    const folder = getDemoIdFolderById(folderId, folders);
    const section = getDemoDocumentationSectionForFolderId(folderId, sections);

    setCreateDocumentPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(folderId);
    setSelectedDraftId(draftId ?? folder.draftIds[0] ?? '');
    setActiveSection('aosr');
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
      id: `aosr-draft-created-${String(createdAosrDraftCount)}`,
      numberingAssignment: proposedAosrNumberDetails.numberingAssignment,
      sectionTemplateSettings: selectedSectionTemplateSettings,
      sectionId: selectedSection.id,
      sectionTemplateSettingsId: selectedSection.templateSettingsId,
    });

    setDrafts((currentDrafts) => [...currentDrafts, draft]);
    setFolders((currentFolders) =>
      addDemoIdFolderDraft(currentFolders, selectedFolderId, draft.id),
    );
    setCreatedAosrDraftCount((currentCount) => currentCount + 1);
    setCreateDocumentPanelOpen(false);
    setSelectedDraftId(draft.id);
    setActiveSection('aosr');
  };

  const deleteAosrDraftFromCurrentFolder = (draftId: string, nextSelectedDraftId: string): void => {
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
    setSelectedDraftId(nextSelectedDraftId);

    if (nextSelectedDraftId === '') {
      setActiveSection('folder');
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

    const nextSelectedDraftId = selectedFolderDrafts.find(({ id }) => id !== draftId)?.id ?? '';

    deleteAosrDraftFromCurrentFolder(draftId, nextSelectedDraftId);
  };

  const moveAosrDraftInSelectedFolder = (
    draftId: string,
    direction: DemoIdFolderDraftMoveDirection,
  ): void => {
    if (selectedFolderId === null || selectedSection === undefined) {
      return;
    }

    setFolders((currentFolders) => {
      const nextFolders = moveDemoIdFolderDraftByDirection(
        currentFolders,
        selectedFolderId,
        draftId,
        direction,
      );

      if (nextFolders === currentFolders) {
        return currentFolders;
      }

      setDrafts((currentDrafts) =>
        maybeRenumberAutomaticSectionDrafts({
          currentDrafts,
          currentFolders: nextFolders,
          section: selectedSection,
          sectionTemplateSettings: selectedSectionTemplateSettings,
        }),
      );

      return nextFolders;
    });
    setSelectedDraftId(draftId);
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
    setSelectedSectionId(nextSection.id);
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
      duplicateDraftId: `aosr-draft-duplicate-${String(createdAosrDraftCount)}`,
      section: selectedSection,
      sectionTemplateSettings: selectedSectionTemplateSettings,
      sourceDraftId,
    });

    if (result === null) {
      return;
    }

    setDrafts(result.drafts);
    setFolders(result.folders);
    setCreatedAosrDraftCount((currentCount) => currentCount + 1);
    setSelectedDraftId(result.duplicatedDraft.id);
    if (openEditor) {
      setActiveSection('aosr');
    }
  };

  const openObjectSettings = (): void => {
    if (selectedSection === undefined) {
      openCreateSectionPanel();
      return;
    }

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('settings');
  };

  const openSectionTemplateSettings = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setActiveSection('settings');
  };

  const openSectionFinalPackage = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setActiveSection('final-package');
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

    onSectionTemplateClipboardChange({
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
      selectedSectionDrafts.length === 0 ||
      selectedSectionTemplateSettings.sectionTemplate.numberingMode !== 'automatic'
    ) {
      return;
    }

    const shouldRenumber = window.confirm(
      'Задать автоматическую нумерацию для всех актов раздела?\n' +
        `Будут изменены номера актов выбранного раздела: ${formatRenumberedActCount(
          selectedSectionDrafts.length,
        )}.\n` +
        'Шаблонные значения акта и ручной/связанный режим шаблона не изменятся.\n' +
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
    setLastTemplateCopyMessage('Автоматическая нумерация применена ко всем актам раздела.');
  };

  return (
    <main className="object-workspace-shell">
      <ObjectWorkspaceNavigation
        activeSection={activeSection}
        folders={folders}
        object={object}
        sections={sections}
        selectedFolderId={selectedFolderId}
        selectedSectionId={selectedSectionId}
        onBackToObjects={onBackToObjects}
        onOpenFolder={openFolder}
        onOpenObjectDocumentsPage={openObjectDocumentsPage}
        onOpenOverview={() => {
          setCreateDocumentPanelOpen(false);
          setCreateFolderPanelOpen(false);
          setCreateSectionPanelOpen(false);
          setActiveSection('overview');
        }}
        onOpenSection={openSection}
        onOpenSectionFinalPackage={openSectionFinalPackage}
        onOpenSectionTemplateSettings={openSectionTemplateSettings}
        onOpenSectionsPage={openSectionsPage}
      />

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} activeSection={activeSection} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            sections={sections}
            selectedSection={selectedSection}
            selectedSectionFolders={selectedSectionFolders}
            onCreateSection={openCreateSectionPanel}
            onOpenSection={openSection}
            onOpenSectionsPage={openSectionsPage}
          />
        ) : null}

        {activeSection === 'sections' ? (
          <ObjectSectionsPage
            drafts={drafts}
            isCreateSectionPanelOpen={isCreateSectionPanelOpen}
            sectionName={sectionNameInput}
            folders={folders}
            sections={sections}
            onChangeSectionName={setSectionNameInput}
            onCloseCreateSectionPanel={() => {
              setCreateSectionPanelOpen(false);
            }}
            onCreateSection={createSection}
            onOpenCreateSectionPanel={openCreateSectionPanel}
            onOpenSection={openSection}
            onOpenSectionTemplateSettings={(sectionId) => {
              setSelectedSectionId(sectionId);
              setActiveSection('settings');
            }}
          />
        ) : null}

        {activeSection === 'section' ? (
          <ObjectSectionPage
            drafts={drafts}
            folderName={folderNameInput}
            isCreateFolderPanelOpen={isCreateFolderPanelOpen}
            selectedSection={selectedSection}
            selectedSectionFolders={selectedSectionFolders}
            onChangeFolderName={setFolderNameInput}
            onCloseCreateFolderPanel={() => {
              setCreateFolderPanelOpen(false);
            }}
            onCreateFolder={createFolder}
            onOpenCreateFolderPanel={openCreateFolderPanel}
            onOpenFinalPackage={() => {
              setActiveSection('final-package');
            }}
            onOpenFolder={openFolder}
            onOpenSectionTemplateSettings={openObjectSettings}
            onMoveFolder={moveFolderInSelectedSection}
          />
        ) : null}

        {activeSection === 'folder' && selectedFolder !== undefined ? (
          <ObjectFolderPage
            drafts={selectedFolderDrafts}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            folder={selectedFolder}
            sectionName={selectedSection?.name}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={createAosrDraft}
            onDeleteAosr={deleteAosrDraftFromFolder}
            onDuplicateAosr={duplicateAosrDraftFromFolderList}
            onMoveAosr={moveAosrDraftInSelectedFolder}
            onOpenAosr={(draftId) => {
              openAosr(selectedFolder.id, draftId);
            }}
            onOpenCreateDocumentPanel={openCreateDocumentPanel}
            onOpenIntermediatePackage={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('intermediate-package');
            }}
          />
        ) : null}

        {activeSection === 'intermediate-package' && selectedFolder !== undefined ? (
          <ObjectIntermediatePackagePage drafts={drafts} folder={selectedFolder} />
        ) : null}

        {isAosrVisible && (selectedFolder !== undefined || activeSection === 'settings') ? (
          <DemoAosrWorkspacePage
            drafts={drafts}
            initialSelectedDraftId={selectedDraftId}
            isEmbeddedInObjectWorkspace
            isSectionTemplateSettingsPage={activeSection === 'settings'}
            sectionTemplateSettings={selectedSectionTemplateSettings}
            onDraftsChange={setDrafts}
            onDeleteDraft={deleteAosrDraftFromCurrentFolder}
            onSectionTemplateSettingsChange={updateSelectedSectionTemplateSettings}
            lastTemplateCopyMessage={lastTemplateCopyMessage}
            folderName={selectedFolder?.name}
            objectId={object.id}
            objectTitle={object.title}
            sectionDraftCount={selectedSectionDrafts.length}
            sectionId={selectedSection?.id}
            sectionName={selectedSection?.name}
            sectionTemplateClipboard={sectionTemplateClipboard}
            visibleDraftIds={selectedFolder?.draftIds ?? []}
            onCopySectionTemplate={copySelectedSectionTemplateToClipboard}
            onCreateActInFolder={openCreateDocumentPanel}
            onDuplicateDraft={duplicateAosrDraft}
            onMoveDraft={moveAosrDraftInSelectedFolder}
            onObjectSettingsClosed={() => {
              setActiveSection('section');
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
  readonly activeSection: ObjectWorkspaceSection;
  readonly object: MockObjectCard;
}

function ObjectWorkspaceHeader({
  activeSection,
  object,
}: ObjectWorkspaceHeaderProps): React.JSX.Element {
  const sectionBreadcrumb = getSectionBreadcrumb(activeSection);

  return (
    <header className="object-workspace-header">
      <div className="object-workspace-header__title">
        <p className="object-workspace-breadcrumbs">
          Объекты / {object.title} / {sectionBreadcrumb}
        </p>
        <h1 id="object-workspace-title">{object.title}</h1>
        <p>{object.address}</p>
      </div>
    </header>
  );
}

function getSectionBreadcrumb(section: ObjectWorkspaceSection): string {
  switch (section) {
    case 'overview':
      return 'Обзор';
    case 'sections':
      return 'Разделы ИД';
    case 'section':
      return 'Разделы ИД / Обзор раздела';
    case 'folder':
      return 'Разделы ИД / Папка';
    case 'intermediate-package':
      return 'Разделы ИД / Промежуточная ИД по папке';
    case 'aosr':
      return `Разделы ИД / ${aosrActType.code}`;
    case 'settings':
      return 'Шаблонные значения раздела';
    case 'documents':
      return 'Документы объекта';
    case 'final-package':
      return 'Итоговая ИД по разделу';
  }
}

interface ObjectOverviewProps {
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onCreateSection: () => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionsPage: () => void;
}

function ObjectOverview({
  sections,
  selectedSection,
  selectedSectionFolders,
  onCreateSection,
  onOpenSection,
  onOpenSectionsPage,
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
            <button
              className="action-button action-button--primary"
              onClick={() => {
                onOpenSection(selectedSection.id);
              }}
              type="button"
            >
              Открыть раздел
            </button>
            <button className="compact-toggle" onClick={onOpenSectionsPage} type="button">
              Перейти к разделам ИД
            </button>
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
                <button
                  onClick={() => {
                    onOpenSection(section.id);
                  }}
                  type="button"
                >
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
                </button>
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
  readonly sections: readonly DemoDocumentationSection[];
  readonly onChangeSectionName: (value: string) => void;
  readonly onCloseCreateSectionPanel: () => void;
  readonly onCreateSection: () => void;
  readonly onOpenCreateSectionPanel: () => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionTemplateSettings: (sectionId: DemoDocumentationSectionId) => void;
}

function ObjectSectionsPage({
  drafts,
  isCreateSectionPanelOpen,
  sectionName,
  folders,
  sections,
  onChangeSectionName,
  onCloseCreateSectionPanel,
  onCreateSection,
  onOpenCreateSectionPanel,
  onOpenSection,
  onOpenSectionTemplateSettings,
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
                    <button
                      aria-label={`Открыть раздел ${section.name}`}
                      className="compact-toggle compact-toggle--accent"
                      onClick={() => {
                        onOpenSection(section.id);
                      }}
                      type="button"
                    >
                      Открыть раздел
                    </button>
                    <button
                      aria-label={`Шаблонные значения раздела ${section.name}`}
                      className="compact-toggle"
                      onClick={() => {
                        onOpenSectionTemplateSettings(section.id);
                      }}
                      type="button"
                    >
                      Шаблонные значения раздела
                    </button>
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
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onChangeFolderName: (value: string) => void;
  readonly onCloseCreateFolderPanel: () => void;
  readonly onCreateFolder: () => void;
  readonly onOpenCreateFolderPanel: () => void;
  readonly onOpenFinalPackage: () => void;
  readonly onOpenFolder: (folderId: DemoIdFolderId) => void;
  readonly onOpenSectionTemplateSettings: () => void;
  readonly onMoveFolder: (
    folderId: DemoIdFolderId,
    direction: DemoDocumentationSectionFolderMoveDirection,
  ) => void;
}

function ObjectSectionPage({
  drafts,
  folderName,
  isCreateFolderPanelOpen,
  selectedSection,
  selectedSectionFolders,
  onChangeFolderName,
  onCloseCreateFolderPanel,
  onCreateFolder,
  onOpenCreateFolderPanel,
  onOpenFinalPackage,
  onOpenFolder,
  onOpenSectionTemplateSettings,
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
          <p className="object-workspace-breadcrumbs">Разделы ИД / {selectedSection.name}</p>
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
          <button className="compact-toggle" onClick={onOpenFinalPackage} type="button">
            Итоговая ИД по разделу
          </button>
          <button className="compact-toggle" onClick={onOpenSectionTemplateSettings} type="button">
            Шаблонные значения раздела
          </button>
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
                    <button
                      aria-label={`Открыть папку ${folder.name}`}
                      className="compact-toggle"
                      onClick={() => {
                        onOpenFolder(folder.id);
                      }}
                      type="button"
                    >
                      Открыть
                    </button>
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
  readonly sectionName: string | undefined;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onDeleteAosr: (draftId: string) => void;
  readonly onDuplicateAosr: (draftId: string) => void;
  readonly onMoveAosr: (draftId: string, direction: DemoIdFolderDraftMoveDirection) => void;
  readonly onOpenAosr: (draftId: string) => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenIntermediatePackage: () => void;
}

function ObjectFolderPage({
  drafts,
  isCreateDocumentPanelOpen,
  folder,
  sectionName,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onDeleteAosr,
  onDuplicateAosr,
  onMoveAosr,
  onOpenAosr,
  onOpenCreateDocumentPanel,
  onOpenIntermediatePackage,
}: ObjectFolderPageProps): React.JSX.Element {
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
                    <button
                      aria-label={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                      className="compact-toggle"
                      onClick={() => {
                        onOpenAosr(draft.id);
                      }}
                      title={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                      type="button"
                    >
                      Открыть
                    </button>
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
