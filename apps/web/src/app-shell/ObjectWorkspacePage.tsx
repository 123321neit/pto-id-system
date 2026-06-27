import { useEffect, useMemo, useState } from 'react';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoAosrObjectDefaults,
} from '../aosr-demo/demo-aosr-workspace.js';
import { DerivedRegistryTable } from './DerivedRegistryTable.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage, ObjectPeriodicPackagePage } from './ObjectFinalPackagePage.js';
import type { MockObjectCard } from './mock-dashboard.js';
import {
  addDemoDocumentationSectionFolder,
  createDemoDocumentationSection,
  demoDocumentationSections,
  getDemoDocumentationSectionById,
  getDemoDocumentationSectionDrafts,
  getDemoDocumentationSectionForFolderId,
  getDemoDocumentationSectionPeriods,
  type DemoDocumentationSection,
  type DemoDocumentationSectionId,
  type DemoDocumentationSections,
} from './object-documentation-sections.js';
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import {
  addDemoObjectPeriodDraft,
  createDemoObjectPeriod,
  demoObjectPeriods,
  getDemoObjectPeriodById,
  getDemoObjectPeriodDrafts,
  getDemoObjectPeriodForDraftId,
  type DemoObjectPeriod,
  type DemoObjectPeriodId,
  type DemoObjectPeriods,
} from './object-periods.js';
import { buildPeriodRegistryModel } from './object-registry-model.js';

const aosrActType = getDemoActTypeById('aosr');
const untitledDocumentLabel = 'Без номера';

function getDocumentDisplayNumber(documentNumber: string): string {
  return documentNumber.trim() === '' ? untitledDocumentLabel : documentNumber;
}

function createSectionObjectDefaults(sectionName: string): DemoAosrObjectDefaults {
  const baseDefaults = demoAosrWorkspace.objectDefaults;
  const normalizedSectionName = sectionName.trim().toLowerCase();
  const numberingPrefix =
    normalizedSectionName.includes('отоп') || normalizedSectionName.includes('тепл')
      ? 'ОТ-'
      : baseDefaults.objectTemplate.numberingPrefix;

  return {
    ...baseDefaults,
    objectTemplate: {
      ...baseDefaults.objectTemplate,
      numberingPrefix,
    },
  };
}

function buildInitialSectionObjectDefaults(
  hasDemoContent: boolean,
): Readonly<Record<DemoDocumentationSectionId, DemoAosrObjectDefaults>> {
  if (!hasDemoContent) {
    return {};
  }

  return Object.fromEntries(
    demoDocumentationSections.map((section) => [
      section.id,
      createSectionObjectDefaults(section.name),
    ]),
  );
}

type ObjectWorkspaceSection =
  | 'overview'
  | 'folders'
  | 'period'
  | 'periodic-package'
  | 'aosr'
  | 'documents'
  | 'final-package'
  | 'settings';

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly onBackToObjects: () => void;
}

export function ObjectWorkspacePage({
  object,
  onBackToObjects,
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
  const [sectionObjectDefaultsById, setSectionObjectDefaultsById] = useState<
    Readonly<Record<DemoDocumentationSectionId, DemoAosrObjectDefaults>>
  >(() => buildInitialSectionObjectDefaults(hasDemoContent));
  const [periods, setPeriods] = useState<DemoObjectPeriods>(
    hasDemoContent ? demoObjectPeriods : [],
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<DemoObjectPeriodId | null>(
    hasDemoContent ? (demoObjectPeriods[0]?.id ?? null) : null,
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
  const [documentNumberInput, setDocumentNumberInput] = useState('');
  const [folderNameInput, setFolderNameInput] = useState('');
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
  const [lastTemplateCopyTargetName, setLastTemplateCopyTargetName] = useState('');
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const selectedSection =
    selectedSectionId === null
      ? undefined
      : getDemoDocumentationSectionById(selectedSectionId, sections);
  const selectedSectionPeriods =
    selectedSection === undefined
      ? []
      : getDemoDocumentationSectionPeriods(selectedSection, periods);
  const selectedPeriod =
    selectedPeriodId === null ? undefined : getDemoObjectPeriodById(selectedPeriodId, periods);
  const selectedSectionDrafts = useMemo(
    () =>
      selectedSection === undefined
        ? []
        : getDemoDocumentationSectionDrafts(selectedSection, periods, drafts),
    [drafts, periods, selectedSection],
  );
  const selectedPeriodDrafts =
    selectedPeriod === undefined ? [] : getDemoObjectPeriodDrafts(selectedPeriod, drafts);
  const selectedSectionObjectDefaults =
    selectedSection === undefined
      ? demoAosrWorkspace.objectDefaults
      : (sectionObjectDefaultsById[selectedSection.id] ?? demoAosrWorkspace.objectDefaults);
  const proposedAosrNumberDetails = useMemo(() => {
    if (selectedPeriodId === null) {
      return undefined;
    }

    return getProposedDemoDocumentNumberDetails({
      documentTypeId: 'aosr',
      drafts: selectedSectionDrafts,
      periodId: selectedPeriodId,
      periods,
      setting: {
        documentTypeId: 'aosr',
        prefix: selectedSectionObjectDefaults.objectTemplate.numberingPrefix,
        scope: selectedSectionObjectDefaults.objectTemplate.numberingScope,
        suffix: selectedSectionObjectDefaults.objectTemplate.numberingSuffix,
        template: '{prefix}{number}{suffix}',
      },
    });
  }, [
    periods,
    selectedPeriodId,
    selectedSectionDrafts,
    selectedSectionObjectDefaults.objectTemplate.numberingPrefix,
    selectedSectionObjectDefaults.objectTemplate.numberingScope,
    selectedSectionObjectDefaults.objectTemplate.numberingSuffix,
  ]);
  const proposedAosrNumber = proposedAosrNumberDetails?.renderedNumber ?? '';

  useEffect(() => {
    if (isCreateDocumentPanelOpen) {
      setDocumentNumberInput(proposedAosrNumber);
    }
  }, [isCreateDocumentPanelOpen, proposedAosrNumber]);

  const openCreateDocumentPanel = (): void => {
    if (selectedPeriod === undefined) {
      return;
    }

    setDocumentNumberInput(proposedAosrNumber);
    setCreateDocumentPanelOpen(true);
  };

  const openCreateSectionPanel = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setSectionNameInput('');
    setCreateSectionPanelOpen(true);
    setActiveSection('folders');
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
    setSectionObjectDefaultsById((currentDefaults) => ({
      ...currentDefaults,
      [section.id]: createSectionObjectDefaults(section.name),
    }));
    setSelectedSectionId(section.id);
    setSelectedPeriodId(null);
    setSelectedDraftId('');
    setCreatedSectionCount((currentCount) => currentCount + 1);
    setCreateSectionPanelOpen(false);
    setSectionNameInput('');
    setActiveSection('folders');
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
    setActiveSection('folders');
  };

  const createFolder = (): void => {
    if (selectedSectionId === null) {
      return;
    }

    const folderName = folderNameInput.trim();

    if (folderName === '') {
      return;
    }

    const folder = createDemoObjectPeriod(
      `folder-created-${String(createdFolderCount)}`,
      folderName,
    );

    setPeriods((currentPeriods) => [...currentPeriods, folder]);
    setSections((currentSections) =>
      addDemoDocumentationSectionFolder(currentSections, selectedSectionId, folder.id),
    );
    setSelectedPeriodId(folder.id);
    setSelectedDraftId('');
    setCreatedFolderCount((currentCount) => currentCount + 1);
    setCreateFolderPanelOpen(false);
    setFolderNameInput('');
    setActiveSection('period');
  };

  const openSection = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionPeriods = getDemoDocumentationSectionPeriods(section, periods);
    const firstFolder = sectionPeriods[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(sectionId);
    setSelectedPeriodId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setLastTemplateCopyTargetName('');
    setActiveSection('folders');
  };

  const openPeriod = (periodId: DemoObjectPeriodId): void => {
    const section = getDemoDocumentationSectionForFolderId(periodId, sections);

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedPeriodId(periodId);
    const period = getDemoObjectPeriodById(periodId, periods);
    setSelectedDraftId(period.draftIds[0] ?? '');
    setLastTemplateCopyTargetName('');
    setActiveSection('period');
  };

  const openAosr = (
    periodId: DemoObjectPeriodId | null = selectedPeriodId,
    draftId?: string,
  ): void => {
    if (periodId === null) {
      return;
    }

    const period = getDemoObjectPeriodById(periodId, periods);
    const section = getDemoDocumentationSectionForFolderId(periodId, sections);

    setCreateDocumentPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedPeriodId(periodId);
    setSelectedDraftId(draftId ?? period.draftIds[0] ?? '');
    setActiveSection('aosr');
  };

  const openDraft = (draft: DemoAosrDraft): void => {
    const period = getDemoObjectPeriodForDraftId(draft.id, periods);

    openAosr(period.id, draft.id);
  };

  const createAosrDraft = (): void => {
    if (selectedPeriodId === null || proposedAosrNumberDetails === undefined) {
      return;
    }

    const usesAutomaticNumber = documentNumberInput === proposedAosrNumber;
    const draft = createEmptyDemoAosrDraft({
      actNumber: documentNumberInput,
      id: `aosr-draft-created-${String(createdAosrDraftCount)}`,
      numberingAssignment: usesAutomaticNumber
        ? {
            automaticSequences: proposedAosrNumberDetails.sequences,
            source: 'automatic',
          }
        : { source: 'manual' },
      objectDefaults: selectedSectionObjectDefaults,
    });

    setDrafts((currentDrafts) => [...currentDrafts, draft]);
    setPeriods((currentPeriods) =>
      addDemoObjectPeriodDraft(currentPeriods, selectedPeriodId, draft.id),
    );
    setCreatedAosrDraftCount((currentCount) => currentCount + 1);
    setCreateDocumentPanelOpen(false);
    setSelectedDraftId(draft.id);
    setActiveSection('period');
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
    setSettingsOpenRequest((currentRequest) => currentRequest + 1);
  };

  const updateSelectedSectionObjectDefaults = (
    nextObjectDefaults: DemoAosrObjectDefaults,
  ): void => {
    if (selectedSectionId === null) {
      return;
    }

    setSectionObjectDefaultsById((currentDefaults) => ({
      ...currentDefaults,
      [selectedSectionId]: nextObjectDefaults,
    }));
  };

  const copySelectedSectionTemplate = (targetSectionId: DemoDocumentationSectionId): void => {
    if (selectedSection === undefined) {
      return;
    }

    const targetSection = getDemoDocumentationSectionById(targetSectionId, sections);

    setSectionObjectDefaultsById((currentDefaults) => ({
      ...currentDefaults,
      [targetSectionId]: selectedSectionObjectDefaults,
    }));
    setLastTemplateCopyTargetName(targetSection.name);
  };

  return (
    <main className="object-workspace-shell">
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
          <span className={`status-chip status-chip--${object.status}`}>{object.statusLabel}</span>
        </div>

        <nav className="object-workspace-nav__sections" aria-label="Разделы объекта">
          <div className="object-workspace-nav__group" aria-labelledby="object-nav-work-title">
            <p className="object-workspace-nav__group-label" id="object-nav-work-title">
              Работа
            </p>
            <button
              aria-current={activeSection === 'overview' ? 'page' : undefined}
              aria-label="Обзор"
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('overview');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ⌂
              </span>
              <span className="object-workspace-nav__label">
                <strong>Обзор</strong>
                <small>Командный центр</small>
              </span>
            </button>
            <button
              aria-label="Разделы ИД"
              aria-current={
                activeSection === 'folders' ||
                activeSection === 'period' ||
                activeSection === 'periodic-package' ||
                activeSection === 'aosr'
                  ? 'page'
                  : undefined
              }
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('folders');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ▦
              </span>
              <span className="object-workspace-nav__label">
                <strong>Разделы ИД</strong>
                <small>Раздел → папки → документы</small>
              </span>
            </button>
            {sections.map((section) => (
              <button
                aria-label={section.name}
                aria-current={
                  (activeSection === 'folders' ||
                    activeSection === 'period' ||
                    activeSection === 'periodic-package' ||
                    activeSection === 'aosr' ||
                    activeSection === 'settings') &&
                  selectedSectionId === section.id
                    ? 'page'
                    : undefined
                }
                className="object-workspace-nav__subitem"
                key={section.id}
                onClick={() => {
                  openSection(section.id);
                }}
                type="button"
              >
                <span className="object-workspace-nav__icon" aria-hidden="true">
                  ◧
                </span>
                <span className="object-workspace-nav__label">
                  <strong>{section.name}</strong>
                  <small>
                    {section.folderIds.length} {getFolderCountLabel(section.folderIds.length)}
                  </small>
                </span>
              </button>
            ))}
            {selectedSectionPeriods.map((period) => (
              <button
                aria-label={period.name}
                aria-current={
                  (activeSection === 'period' ||
                    activeSection === 'periodic-package' ||
                    activeSection === 'aosr') &&
                  selectedPeriodId === period.id
                    ? 'page'
                    : undefined
                }
                className="object-workspace-nav__subitem object-workspace-nav__subitem--nested"
                key={period.id}
                onClick={() => {
                  openPeriod(period.id);
                }}
                type="button"
              >
                <span className="object-workspace-nav__icon" aria-hidden="true">
                  ▣
                </span>
                <span className="object-workspace-nav__label">
                  <strong>{period.name}</strong>
                  <small>Папка документов</small>
                </span>
              </button>
            ))}
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
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('documents');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ▤
              </span>
              <span className="object-workspace-nav__label">
                <strong>Документы объекта</strong>
                <small>Схемы и журналы</small>
              </span>
            </button>
            <button
              aria-current={activeSection === 'final-package' ? 'page' : undefined}
              aria-label="Печать итоговой ИД раздела"
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('final-package');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ◫
              </span>
              <span className="object-workspace-nav__label">
                <strong>Печать итоговой ИД</strong>
                <small>По выбранному разделу</small>
              </span>
            </button>
            <button
              aria-current={activeSection === 'settings' ? 'page' : undefined}
              aria-label="Открыть настройки шаблона раздела"
              onClick={openObjectSettings}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ○
              </span>
              <span className="object-workspace-nav__label">
                <strong>Настройки шаблона раздела</strong>
                <small>{selectedSection?.name ?? 'Сначала создайте раздел'}</small>
              </span>
            </button>
          </div>
        </nav>
      </aside>

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} activeSection={activeSection} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            drafts={drafts}
            periods={periods}
            sections={sections}
            selectedSection={selectedSection}
            selectedSectionPeriods={selectedSectionPeriods}
            onCreateFolder={openCreateFolderPanel}
            onCreateSection={openCreateSectionPanel}
            onOpenDraft={openDraft}
            onOpenSection={openSection}
          />
        ) : null}

        {activeSection === 'folders' ? (
          <ObjectFoldersPage
            drafts={drafts}
            folderName={folderNameInput}
            isCreateFolderPanelOpen={isCreateFolderPanelOpen}
            isCreateSectionPanelOpen={isCreateSectionPanelOpen}
            sectionName={sectionNameInput}
            sections={sections}
            selectedSection={selectedSection}
            selectedSectionPeriods={selectedSectionPeriods}
            onChangeFolderName={setFolderNameInput}
            onChangeSectionName={setSectionNameInput}
            onCloseCreateFolderPanel={() => {
              setCreateFolderPanelOpen(false);
            }}
            onCloseCreateSectionPanel={() => {
              setCreateSectionPanelOpen(false);
            }}
            onCreateFolder={createFolder}
            onCreateSection={createSection}
            onOpenCreateFolderPanel={openCreateFolderPanel}
            onOpenCreateSectionPanel={openCreateSectionPanel}
            onOpenPeriod={openPeriod}
            onOpenSection={openSection}
          />
        ) : null}

        {activeSection === 'period' && selectedPeriod !== undefined ? (
          <ObjectPeriodPage
            drafts={selectedPeriodDrafts}
            documentNumber={documentNumberInput}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            period={selectedPeriod}
            proposedAosrNumber={proposedAosrNumber}
            sectionName={selectedSection?.name}
            onChangeDocumentNumber={setDocumentNumberInput}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={createAosrDraft}
            onOpenAosr={(draftId) => {
              openAosr(selectedPeriod.id, draftId);
            }}
            onOpenCreateDocumentPanel={openCreateDocumentPanel}
            onOpenPeriodicPackage={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('periodic-package');
            }}
          />
        ) : null}

        {activeSection === 'periodic-package' && selectedPeriod !== undefined ? (
          <ObjectPeriodicPackagePage drafts={drafts} period={selectedPeriod} />
        ) : null}

        {isAosrVisible && (selectedPeriod !== undefined || activeSection === 'settings') ? (
          <DemoAosrWorkspacePage
            drafts={drafts}
            initialSelectedDraftId={selectedDraftId}
            isEmbeddedInObjectWorkspace
            objectDefaults={selectedSectionObjectDefaults}
            onDraftsChange={setDrafts}
            onObjectDefaultsChange={updateSelectedSectionObjectDefaults}
            copyTargetSections={sections
              .filter((section) => section.id !== selectedSection?.id)
              .map(({ id, name }) => ({ id, name }))}
            lastTemplateCopyTargetName={lastTemplateCopyTargetName}
            periodName={selectedPeriod?.name}
            sectionName={selectedSection?.name}
            settingsOpenRequest={settingsOpenRequest}
            visibleDraftIds={selectedPeriod?.draftIds ?? []}
            onCopySectionTemplate={copySelectedSectionTemplate}
            onObjectSettingsClosed={() => {
              setActiveSection(selectedPeriod === undefined ? 'overview' : 'aosr');
            }}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'final-package' ? (
          <ObjectFinalPackagePage
            drafts={selectedSectionDrafts}
            periods={selectedSectionPeriods}
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
    case 'folders':
      return 'Разделы ИД';
    case 'period':
      return 'Разделы ИД / Папка ИД';
    case 'periodic-package':
      return 'Разделы ИД / Промежуточная ИД';
    case 'aosr':
      return `Разделы ИД / ${aosrActType.code}`;
    case 'settings':
      return 'Настройки шаблона раздела';
    case 'documents':
      return 'Документы объекта';
    case 'final-package':
      return 'Печать итоговой ИД раздела';
  }
}

interface ObjectOverviewProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly periods: readonly DemoObjectPeriod[];
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionPeriods: readonly DemoObjectPeriod[];
  readonly onCreateFolder: () => void;
  readonly onCreateSection: () => void;
  readonly onOpenDraft: (draft: DemoAosrDraft) => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
}

function ObjectOverview({
  drafts,
  periods,
  sections,
  selectedSection,
  selectedSectionPeriods,
  onCreateFolder,
  onCreateSection,
  onOpenDraft,
  onOpenSection,
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
              Раздел содержит {selectedSectionPeriods.length}{' '}
              {getFolderCountLabel(selectedSectionPeriods.length)}. Итоговая ИД собирается именно по
              выбранному разделу.
            </p>
          </div>
          <div className="object-overview__focus-actions">
            <button
              className="compact-toggle"
              onClick={() => {
                onOpenSection(selectedSection.id);
              }}
              type="button"
            >
              Открыть раздел
            </button>
            <button
              className="action-button action-button--primary"
              onClick={onCreateFolder}
              type="button"
            >
              Создать папку
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

      <section className="object-overview__panel" aria-labelledby="overview-recent-documents-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Недавние документы</p>
          <h3 id="overview-recent-documents-title">Последние документы</h3>
        </div>
        {drafts.length === 0 ? (
          <p className="object-folders__empty-copy">
            Документы появятся здесь после создания первого раздела и папки.
          </p>
        ) : (
          <ul className="object-overview__recent-list object-overview__recent-list--wide">
            {drafts.map((draft) => {
              const period = getDemoObjectPeriodForDraftId(draft.id, periods);
              const section = getDemoDocumentationSectionForFolderId(period.id, sections);

              return (
                <li key={draft.id}>
                  <button
                    onClick={() => {
                      onOpenDraft(draft);
                    }}
                    type="button"
                  >
                    <span>
                      <strong>{getDocumentDisplayNumber(draft.actNumber)}</strong>
                      <small>
                        {section.name} / {period.name} / {aosrActType.title}
                      </small>
                    </span>
                    <span>
                      <small>Открыть</small>
                      <strong aria-hidden="true">→</strong>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}

interface ObjectFoldersPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly folderName: string;
  readonly isCreateFolderPanelOpen: boolean;
  readonly isCreateSectionPanelOpen: boolean;
  readonly sectionName: string;
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionPeriods: readonly DemoObjectPeriod[];
  readonly onChangeFolderName: (value: string) => void;
  readonly onChangeSectionName: (value: string) => void;
  readonly onCloseCreateFolderPanel: () => void;
  readonly onCloseCreateSectionPanel: () => void;
  readonly onCreateFolder: () => void;
  readonly onCreateSection: () => void;
  readonly onOpenCreateFolderPanel: () => void;
  readonly onOpenCreateSectionPanel: () => void;
  readonly onOpenPeriod: (periodId: DemoObjectPeriodId) => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
}

function ObjectFoldersPage({
  drafts,
  folderName,
  isCreateFolderPanelOpen,
  isCreateSectionPanelOpen,
  sectionName,
  sections,
  selectedSection,
  selectedSectionPeriods,
  onChangeFolderName,
  onChangeSectionName,
  onCloseCreateFolderPanel,
  onCloseCreateSectionPanel,
  onCreateFolder,
  onCreateSection,
  onOpenCreateFolderPanel,
  onOpenCreateSectionPanel,
  onOpenPeriod,
  onOpenSection,
}: ObjectFoldersPageProps): React.JSX.Element {
  return (
    <section className="object-folders" aria-labelledby="object-folders-title">
      <div className="object-folders__topline">
        <div className="object-folders__heading">
          <p className="section-kicker">Разделы исполнительной документации</p>
          <h2 id="object-folders-title">Разделы ИД</h2>
          <p>
            Сначала выберите или создайте раздел, затем работайте с папками внутри него. Итоговая ИД
            собирается по разделу.
          </p>
        </div>
        <div className="object-folder-create-panel__actions">
          <button className="compact-toggle" onClick={onOpenCreateSectionPanel} type="button">
            Создать раздел
          </button>
          <button
            className="action-button action-button--primary"
            disabled={selectedSection === undefined}
            onClick={onOpenCreateFolderPanel}
            type="button"
          >
            Создать папку
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
              Папка будет создана внутри раздела <strong>{selectedSection?.name}</strong>. Например:
              «Монтаж вентиляции», «Сентябрь 2026» или «Этап 1».
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
              Создать и открыть
            </button>
          </div>
        </form>
      ) : null}

      {sections.length === 0 ? (
        <section className="object-folders__empty" aria-label="Разделов ИД пока нет">
          <span aria-hidden="true">◧</span>
          <div>
            <h3>Разделов ИД пока нет</h3>
            <p>Создайте первый раздел, затем добавьте в него папки и документы.</p>
          </div>
        </section>
      ) : (
        <>
          <div className="object-folder-directory" aria-label="Все разделы ИД">
            {sections.map((section) => (
              <button
                className="object-folder-row"
                key={section.id}
                onClick={() => {
                  onOpenSection(section.id);
                }}
                type="button"
              >
                <span className="object-folder-row__icon" aria-hidden="true">
                  ◧
                </span>
                <span className="object-folder-row__main">
                  <strong>{section.name}</strong>
                  <small>
                    {section.folderIds.length} {getFolderCountLabel(section.folderIds.length)}
                  </small>
                </span>
                <span className="object-folder-row__action">
                  {selectedSection?.id === section.id ? 'Выбран' : 'Открыть'}
                </span>
              </button>
            ))}
          </div>

          <section className="object-overview__panel" aria-labelledby="selected-section-folders">
            <div className="object-overview__panel-heading">
              <p className="section-kicker">Папки выбранного раздела</p>
              <h3 id="selected-section-folders">{selectedSection?.name ?? 'Раздел не выбран'}</h3>
            </div>
            {selectedSectionPeriods.length === 0 ? (
              <p className="object-folders__empty-copy">
                В этом разделе пока нет папок. Создайте папку, чтобы добавить документы и
                промежуточную ИД.
              </p>
            ) : (
              <div className="object-folder-directory" aria-label="Папки выбранного раздела">
                {selectedSectionPeriods.map((period) => {
                  const periodDrafts = getDemoObjectPeriodDrafts(period, drafts);

                  return (
                    <button
                      className="object-folder-row"
                      key={period.id}
                      onClick={() => {
                        onOpenPeriod(period.id);
                      }}
                      type="button"
                    >
                      <span className="object-folder-row__icon" aria-hidden="true">
                        ▣
                      </span>
                      <span className="object-folder-row__main">
                        <strong>{period.name}</strong>
                        <small>Промежуточная исполнительная документация</small>
                      </span>
                      <span className="object-folder-row__count">
                        {periodDrafts.length} {getDocumentCountLabel(periodDrafts.length)}
                      </span>
                      <span className="object-folder-row__action">Открыть</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function getFolderCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'папок';
  }

  if (remainder10 === 1) {
    return 'папка';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'папки';
  }

  return 'папок';
}

function getDocumentCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'документов';
  }

  if (remainder10 === 1) {
    return 'документ';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'документа';
  }

  return 'документов';
}

interface CreateDocumentPanelProps {
  readonly documentNumber: string;
  readonly proposedAosrNumber: string;
  readonly selectedSectionName: string | undefined;
  readonly selectedPeriod: DemoObjectPeriod;
  readonly onChangeDocumentNumber: (value: string) => void;
  readonly onClose: () => void;
  readonly onCreateAosr: () => void;
}

function CreateDocumentPanel({
  documentNumber,
  proposedAosrNumber,
  selectedSectionName,
  selectedPeriod,
  onChangeDocumentNumber,
  onClose,
  onCreateAosr,
}: CreateDocumentPanelProps): React.JSX.Element {
  return (
    <section
      className="object-overview__create-panel"
      role="dialog"
      aria-labelledby="create-document-title"
    >
      <div className="object-overview__create-panel-header">
        <p className="section-kicker">Новый документ</p>
        <h3 id="create-document-title">Создать документ</h3>
        <p>
          Выберите тип документа. Документ будет создан в разделе{' '}
          <strong>{selectedSectionName ?? 'без названия'}</strong>, в рабочей папке{' '}
          <strong>{selectedPeriod.name}</strong>.
        </p>
      </div>
      <div className="object-overview__numbering-note">
        <h4>Предлагаемый номер: {proposedAosrNumber}</h4>
        <label className="object-overview__number-field">
          <span>Номер документа</span>
          <input
            aria-label="Номер документа"
            onChange={(event) => {
              onChangeDocumentNumber(event.currentTarget.value);
            }}
            type="text"
            value={documentNumber}
          />
        </label>
        <p>
          Ручной номер действует только для этого акта и не изменяет автоматическую
          последовательность.
        </p>
      </div>
      <ul className="document-type-card-list" aria-label="Доступные типы документов">
        {registeredDemoActTypes.map((actType) => (
          <li className="document-type-card document-type-card--available" key={actType.id}>
            <span className="document-type-card__icon" aria-hidden="true">
              {actType.code}
            </span>
            <span className="document-type-card__body">
              <strong>{actType.code}</strong>
              <small>
                {actType.code} — {actType.title}
              </small>
            </span>
            <button
              className="compact-toggle compact-toggle--accent"
              onClick={onCreateAosr}
              type="button"
            >
              Создать АОСР
            </button>
          </li>
        ))}
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
            ТГ
          </span>
          <span className="document-type-card__body">
            <strong>Техническая готовность</strong>
            <small>Будущий тип документа — скоро</small>
          </span>
          <button className="compact-toggle" disabled type="button">
            Скоро
          </button>
        </li>
      </ul>
      <button className="compact-toggle" onClick={onClose} type="button">
        Закрыть
      </button>
    </section>
  );
}

interface ObjectPeriodPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly documentNumber: string;
  readonly isCreateDocumentPanelOpen: boolean;
  readonly period: DemoObjectPeriod;
  readonly proposedAosrNumber: string;
  readonly sectionName: string | undefined;
  readonly onChangeDocumentNumber: (value: string) => void;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onOpenAosr: (draftId: string) => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenPeriodicPackage: () => void;
}

function ObjectPeriodPage({
  drafts,
  documentNumber,
  isCreateDocumentPanelOpen,
  period,
  proposedAosrNumber,
  sectionName,
  onChangeDocumentNumber,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onOpenAosr,
  onOpenCreateDocumentPanel,
  onOpenPeriodicPackage,
}: ObjectPeriodPageProps): React.JSX.Element {
  const periodRegistry = useMemo(() => buildPeriodRegistryModel(period, drafts), [drafts, period]);

  return (
    <section className="object-period-workspace" aria-labelledby="object-period-title">
      <div className="object-period-hero">
        <div className="object-period-hero__title">
          <span className="object-period-hero__icon" aria-hidden="true">
            ▣
          </span>
          <div>
            <p className="section-kicker">Рабочая папка ИД</p>
            <h2 id="object-period-title">{period.name}</h2>
            <p>
              Раздел: <strong>{sectionName ?? 'без названия'}</strong>. Документы папки определяют
              её реестр и состав промежуточной печати.
            </p>
          </div>
        </div>
        <button
          className="action-button action-button--primary"
          onClick={onOpenCreateDocumentPanel}
          type="button"
        >
          Создать документ
        </button>
      </div>

      {isCreateDocumentPanelOpen ? (
        <CreateDocumentPanel
          documentNumber={documentNumber}
          proposedAosrNumber={proposedAosrNumber}
          selectedSectionName={sectionName}
          selectedPeriod={period}
          onChangeDocumentNumber={onChangeDocumentNumber}
          onClose={onCloseCreateDocumentPanel}
          onCreateAosr={onCreateAosr}
        />
      ) : null}

      <div className="object-period-grid">
        <section
          className="object-period-panel object-period-panel--documents object-period-panel--primary"
          aria-labelledby="period-documents-title"
        >
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Состав папки</p>
            <h3 id="period-documents-title">Документы</h3>
          </div>
          {drafts.length === 0 ? (
            <div className="object-period-panel__empty">
              <strong>В этой папке пока нет документов</strong>
              <p>Создайте первый документ — он сразу появится в составе папки и её реестре.</p>
            </div>
          ) : (
            <ul className="object-overview__recent-list object-overview__recent-list--wide">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    onClick={() => {
                      onOpenAosr(draft.id);
                    }}
                    type="button"
                  >
                    <span>
                      <strong>{getDocumentDisplayNumber(draft.actNumber)}</strong>
                      <small>{aosrActType.title}</small>
                    </span>
                    <span>
                      <small>Дата документа</small>
                      <strong>{draft.actDate}</strong>
                    </span>
                    <span>
                      <small>Открыть</small>
                      <strong aria-hidden="true">→</strong>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="object-period-generated-views" aria-label="Сформированные представления">
          <section
            className="object-period-panel object-period-panel--registry object-period-panel--secondary"
            aria-labelledby="period-registry-title"
          >
            <div className="object-overview__panel-heading">
              <p className="section-kicker">Сформированный вид</p>
              <h3 id="period-registry-title">Реестр папки «{period.name}»</h3>
            </div>
            <DerivedRegistryTable registry={periodRegistry} />
          </section>

          <section
            className="object-period-panel object-period-placeholder object-period-panel--secondary"
            aria-labelledby="period-package-title"
          >
            <span className="object-period-placeholder__icon" aria-hidden="true">
              ◫
            </span>
            <div>
              <p className="section-kicker">Сформированный вид</p>
              <h3 id="period-package-title">Промежуточная ИД</h3>
              <p>Печатный комплект из документов этой папки.</p>
              <button className="compact-toggle" onClick={onOpenPeriodicPackage} type="button">
                Открыть состав печати
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
