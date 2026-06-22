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
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import {
  addDemoObjectPeriodDraft,
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
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [objectDefaults, setObjectDefaults] = useState<DemoAosrObjectDefaults>(
    demoAosrWorkspace.objectDefaults,
  );
  const [periods, setPeriods] = useState<DemoObjectPeriods>(demoObjectPeriods);
  const [selectedPeriodId, setSelectedPeriodId] = useState<DemoObjectPeriodId>('period-2026-09');
  const [selectedDraftId, setSelectedDraftId] = useState(demoAosrWorkspace.drafts[0]?.id ?? '');
  const [createdAosrDraftCount, setCreatedAosrDraftCount] = useState(1);
  const [isCreateDocumentPanelOpen, setCreateDocumentPanelOpen] = useState(false);
  const [documentNumberInput, setDocumentNumberInput] = useState('');
  const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const selectedPeriod = getDemoObjectPeriodById(selectedPeriodId, periods);
  const selectedPeriodDrafts = getDemoObjectPeriodDrafts(selectedPeriod, drafts);
  const proposedAosrNumberDetails = useMemo(
    () =>
      getProposedDemoDocumentNumberDetails({
        documentTypeId: 'aosr',
        drafts,
        periodId: selectedPeriodId,
        periods,
        setting: {
          documentTypeId: 'aosr',
          prefix: objectDefaults.objectTemplate.numberingPrefix,
          scope: objectDefaults.objectTemplate.numberingScope,
          suffix: objectDefaults.objectTemplate.numberingSuffix,
          template: '{prefix}{number}{suffix}',
        },
      }),
    [
      drafts,
      objectDefaults.objectTemplate.numberingPrefix,
      objectDefaults.objectTemplate.numberingScope,
      objectDefaults.objectTemplate.numberingSuffix,
      periods,
      selectedPeriodId,
    ],
  );
  const proposedAosrNumber = proposedAosrNumberDetails.renderedNumber;

  useEffect(() => {
    if (isCreateDocumentPanelOpen) {
      setDocumentNumberInput(proposedAosrNumber);
    }
  }, [isCreateDocumentPanelOpen, proposedAosrNumber]);

  const openCreateDocumentPanel = (): void => {
    setDocumentNumberInput(proposedAosrNumber);
    setCreateDocumentPanelOpen(true);
  };

  const openPeriod = (periodId: DemoObjectPeriodId): void => {
    setCreateDocumentPanelOpen(false);
    setSelectedPeriodId(periodId);
    const period = getDemoObjectPeriodById(periodId, periods);
    setSelectedDraftId(period.draftIds[0] ?? drafts[0]?.id ?? '');
    setActiveSection('period');
  };

  const openAosr = (periodId: DemoObjectPeriodId = selectedPeriodId, draftId?: string): void => {
    const period = getDemoObjectPeriodById(periodId, periods);

    setCreateDocumentPanelOpen(false);
    setSelectedPeriodId(periodId);
    setSelectedDraftId(draftId ?? period.draftIds[0] ?? drafts[0]?.id ?? '');
    setActiveSection('aosr');
  };

  const openDraft = (draft: DemoAosrDraft): void => {
    const period = getDemoObjectPeriodForDraftId(draft.id, periods);

    openAosr(period.id, draft.id);
  };

  const createAosrDraft = (): void => {
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
      objectDefaults,
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
    setCreateDocumentPanelOpen(false);
    setActiveSection('settings');
    setSettingsOpenRequest((currentRequest) => currentRequest + 1);
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
              aria-label="Папки ИД"
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
                setActiveSection('folders');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ▦
              </span>
              <span className="object-workspace-nav__label">
                <strong>Папки ИД</strong>
                <small>Все рабочие папки</small>
              </span>
            </button>
            {demoObjectPeriods.map((period) => (
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
                className="object-workspace-nav__subitem"
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
              aria-label="Печать итоговой ИД"
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setActiveSection('final-package');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ◫
              </span>
              <span className="object-workspace-nav__label">
                <strong>Печать итоговой ИД</strong>
                <small>По всем папкам</small>
              </span>
            </button>
            <button
              aria-current={activeSection === 'settings' ? 'page' : undefined}
              aria-label="Открыть шаблон объекта"
              onClick={openObjectSettings}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                ○
              </span>
              <span className="object-workspace-nav__label">
                <strong>Шаблон объекта</strong>
                <small>Live-данные документов</small>
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
            selectedPeriod={selectedPeriod}
            onOpenDraft={openDraft}
            onOpenPeriod={openPeriod}
          />
        ) : null}

        {activeSection === 'folders' ? (
          <ObjectFoldersPage drafts={drafts} periods={periods} onOpenPeriod={openPeriod} />
        ) : null}

        {activeSection === 'period' ? (
          <ObjectPeriodPage
            drafts={selectedPeriodDrafts}
            documentNumber={documentNumberInput}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            period={selectedPeriod}
            proposedAosrNumber={proposedAosrNumber}
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

        {activeSection === 'periodic-package' ? (
          <ObjectPeriodicPackagePage drafts={drafts} period={selectedPeriod} />
        ) : null}

        {isAosrVisible ? (
          <DemoAosrWorkspacePage
            drafts={drafts}
            initialSelectedDraftId={selectedDraftId}
            isEmbeddedInObjectWorkspace
            objectDefaults={objectDefaults}
            onDraftsChange={setDrafts}
            onObjectDefaultsChange={setObjectDefaults}
            periodName={selectedPeriod.name}
            settingsOpenRequest={settingsOpenRequest}
            visibleDraftIds={selectedPeriod.draftIds}
            onObjectSettingsClosed={() => {
              setActiveSection('aosr');
            }}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'final-package' ? (
          <ObjectFinalPackagePage drafts={drafts} periods={periods} />
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
      return 'Папки ИД';
    case 'period':
      return 'Папки ИД';
    case 'periodic-package':
      return 'Папки ИД / Промежуточная ИД';
    case 'aosr':
      return `Папки ИД / ${aosrActType.code}`;
    case 'settings':
      return 'Шаблон объекта';
    case 'documents':
      return 'Документы объекта';
    case 'final-package':
      return 'Печать итоговой ИД';
  }
}

interface ObjectOverviewProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly periods: readonly DemoObjectPeriod[];
  readonly selectedPeriod: DemoObjectPeriod;
  readonly onOpenDraft: (draft: DemoAosrDraft) => void;
  readonly onOpenPeriod: (periodId: DemoObjectPeriodId) => void;
}

function ObjectOverview({
  drafts,
  periods,
  selectedPeriod,
  onOpenDraft,
  onOpenPeriod,
}: ObjectOverviewProps): React.JSX.Element {
  return (
    <section className="object-overview" aria-labelledby="object-overview-title">
      <div className="object-overview__heading">
        <p className="section-kicker">Обзор</p>
        <h2 id="object-overview-title">Обзор объекта</h2>
      </div>

      <section className="object-overview__focus" aria-labelledby="overview-focus-title">
        <div className="object-overview__focus-main">
          <p className="section-kicker">Продолжить работу</p>
          <h3 id="overview-focus-title">{selectedPeriod.name}</h3>
          <p>Рабочая папка с документами и автоматически сформированным реестром.</p>
        </div>
        <div className="object-overview__focus-actions">
          <button
            className="compact-toggle"
            onClick={() => {
              onOpenPeriod(selectedPeriod.id);
            }}
            type="button"
          >
            Открыть папку
          </button>
        </div>
      </section>

      <section className="object-overview__panel" aria-labelledby="overview-recent-documents-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Недавние документы</p>
          <h3 id="overview-recent-documents-title">Последние документы</h3>
        </div>
        <ul className="object-overview__recent-list object-overview__recent-list--wide">
          {drafts.map((draft) => {
            const period = getDemoObjectPeriodForDraftId(draft.id, periods);

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
                      {period.name} / {aosrActType.title}
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
      </section>
    </section>
  );
}

interface ObjectFoldersPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly periods: readonly DemoObjectPeriod[];
  readonly onOpenPeriod: (periodId: DemoObjectPeriodId) => void;
}

function ObjectFoldersPage({
  drafts,
  periods,
  onOpenPeriod,
}: ObjectFoldersPageProps): React.JSX.Element {
  return (
    <section className="object-folders" aria-labelledby="object-folders-title">
      <div className="object-folders__heading">
        <p className="section-kicker">Промежуточная исполнительная документация</p>
        <h2 id="object-folders-title">Папки ИД</h2>
        <p>Все рабочие папки объекта. Внутри каждой находятся документы и её реестр.</p>
      </div>

      <div className="object-folder-directory" aria-label="Все папки ИД">
        {periods.map((period) => {
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
    </section>
  );
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
  readonly selectedPeriod: DemoObjectPeriod;
  readonly onChangeDocumentNumber: (value: string) => void;
  readonly onClose: () => void;
  readonly onCreateAosr: () => void;
}

function CreateDocumentPanel({
  documentNumber,
  proposedAosrNumber,
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
          Выберите тип документа. Документ будет создан в рабочей папке{' '}
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
            <p>Документы папки определяют её реестр и состав промежуточной печати.</p>
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
