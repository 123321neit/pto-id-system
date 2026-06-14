import { useEffect, useMemo, useState } from 'react';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
} from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore, type DemoCertificate } from '../demo-store/demo-store.js';
import { DerivedRegistryTable } from './DerivedRegistryTable.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage, ObjectPeriodicPackagePage } from './ObjectFinalPackagePage.js';
import { RepresentativesOrganizationsPage } from './RepresentativesOrganizationsPage.js';
import type { MockObjectCard } from './mock-dashboard.js';
import { getProposedDemoDocumentNumber } from './object-document-numbering.js';
import {
  buildIdPackageOverviewModel,
  type IdPackageOverviewModel,
  type PeriodicIdPackageModel,
} from './object-final-package-model.js';
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

type ObjectWorkspaceSection =
  | 'overview'
  | 'period'
  | 'periodic-package'
  | 'aosr'
  | 'documents'
  | 'representatives'
  | 'final-package'
  | 'settings';

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly onBackToObjects: () => void;
}

interface ObjectWorkspaceMetrics {
  readonly aosrCount: number;
  readonly usedCertificateCount: number;
  readonly objectDocumentCount: number;
  readonly representativeCount: number;
}

export function ObjectWorkspacePage({
  object,
  onBackToObjects,
}: ObjectWorkspacePageProps): React.JSX.Element {
  const { certificates, objectDocuments, representatives } = useDemoStore();
  const [activeSection, setActiveSection] = useState<ObjectWorkspaceSection>('overview');
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
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
  const usedCertificateCount = useMemo(
    () => getUsedCertificateCount(drafts, certificates),
    [certificates, drafts],
  );
  const packageOverview = useMemo(
    () => buildIdPackageOverviewModel(drafts, objectDocuments, certificates, periods),
    [certificates, drafts, objectDocuments, periods],
  );
  const proposedAosrNumber = useMemo(
    () =>
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts,
        periodId: selectedPeriodId,
        periods,
      }),
    [drafts, periods, selectedPeriodId],
  );
  const metrics: ObjectWorkspaceMetrics = {
    aosrCount: drafts.length,
    usedCertificateCount,
    objectDocumentCount: objectDocuments.length,
    representativeCount: representatives.length,
  };

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
    const draft = createEmptyDemoAosrDraft({
      actNumber: documentNumberInput,
      id: `aosr-draft-created-${String(createdAosrDraftCount)}`,
    });

    setDrafts((currentDrafts) => [...currentDrafts, draft]);
    setPeriods((currentPeriods) =>
      addDemoObjectPeriodDraft(currentPeriods, selectedPeriodId, draft.id),
    );
    setCreatedAosrDraftCount((currentCount) => currentCount + 1);
    setCreateDocumentPanelOpen(false);
    setSelectedDraftId(draft.id);
    setActiveSection('aosr');
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
            aria-label="Периоды"
            aria-current={
              activeSection === 'period' ||
              activeSection === 'periodic-package' ||
              activeSection === 'aosr'
                ? 'page'
                : undefined
            }
            onClick={() => {
              openPeriod(selectedPeriodId);
            }}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              ▦
            </span>
            <span className="object-workspace-nav__label">
              <strong>Периоды</strong>
              <small>Рабочие папки</small>
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
                <small>Документы / реестр / ИД</small>
              </span>
            </button>
          ))}
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
            aria-current={activeSection === 'representatives' ? 'page' : undefined}
            aria-label="Представители"
            onClick={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('representatives');
            }}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              △
            </span>
            <span className="object-workspace-nav__label">
              <strong>Представители</strong>
              <small>Глобальная база</small>
            </span>
          </button>
          <button
            aria-current={activeSection === 'final-package' ? 'page' : undefined}
            aria-label="Открыть итоговый комплект ИД"
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
              <strong>Итоговая ИД</strong>
              <small>Генерируемый вид</small>
            </span>
          </button>
          <button
            aria-current={activeSection === 'settings' ? 'page' : undefined}
            aria-label="Открыть настройки объекта"
            onClick={openObjectSettings}
            type="button"
          >
            <span className="object-workspace-nav__icon" aria-hidden="true">
              ○
            </span>
            <span className="object-workspace-nav__label">
              <strong>Настройки объекта</strong>
              <small>Общие данные</small>
            </span>
          </button>
        </nav>
      </aside>

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} activeSection={activeSection} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            drafts={drafts}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            metrics={metrics}
            object={object}
            packageOverview={packageOverview}
            periods={periods}
            documentNumber={documentNumberInput}
            proposedAosrNumber={proposedAosrNumber}
            selectedPeriod={selectedPeriod}
            onChangeDocumentNumber={setDocumentNumberInput}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={createAosrDraft}
            onOpenDraft={openDraft}
            onOpenPeriod={openPeriod}
            onOpenCreateDocumentPanel={openCreateDocumentPanel}
            onOpenDocuments={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('documents');
            }}
            onOpenFinalPackage={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('final-package');
            }}
          />
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
            onDraftsChange={setDrafts}
            periodName={selectedPeriod.name}
            settingsOpenRequest={settingsOpenRequest}
            visibleDraftIds={selectedPeriod.draftIds}
            onObjectSettingsClosed={() => {
              setActiveSection('aosr');
            }}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'representatives' ? (
          <RepresentativesOrganizationsPage
            backLabel="Вернуться к обзору"
            description="Глобальные организации и представители плюс объектовые назначения для актов"
            onBackToObjects={() => {
              setActiveSection('overview');
            }}
          />
        ) : null}

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
        <div className="object-workspace-header__heading">
          <h1 id="object-workspace-title">{object.title}</h1>
          <span className={`status-chip status-chip--${object.status}`}>{object.statusLabel}</span>
        </div>
        <p>{object.address}</p>
        <dl className="object-workspace-header__meta-list" aria-label="Метаданные объекта">
          <div>
            <dt>Открыт раздел</dt>
            <dd>{sectionBreadcrumb}</dd>
          </div>
          <div>
            <dt>Последнее изменение</dt>
            <dd>{object.updatedAtLabel}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

interface MetricItemProps {
  readonly label: string;
  readonly value: number;
}

function MetricItem({ label, value }: MetricItemProps): React.JSX.Element {
  return (
    <div aria-label={`${label}: ${String(value)}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function getSectionBreadcrumb(section: ObjectWorkspaceSection): string {
  switch (section) {
    case 'overview':
      return 'Обзор';
    case 'period':
      return 'Периоды';
    case 'periodic-package':
      return 'Периоды / Периодическая ИД';
    case 'aosr':
      return `Периоды / ${aosrActType.code}`;
    case 'settings':
      return 'Настройки объекта';
    case 'documents':
      return 'Документы объекта';
    case 'representatives':
      return 'Представители';
    case 'final-package':
      return 'Итоговая ИД';
  }
}

interface ObjectOverviewProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly documentNumber: string;
  readonly isCreateDocumentPanelOpen: boolean;
  readonly metrics: ObjectWorkspaceMetrics;
  readonly object: MockObjectCard;
  readonly packageOverview: IdPackageOverviewModel;
  readonly periods: readonly DemoObjectPeriod[];
  readonly proposedAosrNumber: string;
  readonly selectedPeriod: DemoObjectPeriod;
  readonly onChangeDocumentNumber: (value: string) => void;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenDocuments: () => void;
  readonly onOpenDraft: (draft: DemoAosrDraft) => void;
  readonly onOpenFinalPackage: () => void;
  readonly onOpenPeriod: (periodId: DemoObjectPeriodId) => void;
}

function ObjectOverview({
  drafts,
  documentNumber,
  isCreateDocumentPanelOpen,
  metrics,
  object,
  packageOverview,
  periods,
  proposedAosrNumber,
  selectedPeriod,
  onChangeDocumentNumber,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onOpenCreateDocumentPanel,
  onOpenDocuments,
  onOpenDraft,
  onOpenFinalPackage,
  onOpenPeriod,
}: ObjectOverviewProps): React.JSX.Element {
  return (
    <section className="object-overview" aria-labelledby="object-overview-title">
      <div className="object-overview__intro">
        <div className="object-overview__intro-copy">
          <p className="section-kicker">Обзор</p>
          <h2 id="object-overview-title">Обзор объекта</h2>
          <strong>{object.title}</strong>
          <p>
            {object.address}. Рабочий центр для периодов, документов и итоговой исполнительной
            документации.
          </p>
        </div>
        <div className="object-overview__intro-actions">
          <button
            aria-label="Создать документ"
            className="action-button action-button--primary"
            onClick={onOpenCreateDocumentPanel}
            type="button"
          >
            + Создать документ
          </button>
          <button className="action-button" onClick={onOpenFinalPackage} type="button">
            Сформировать итоговую ИД
          </button>
        </div>
      </div>

      {isCreateDocumentPanelOpen ? (
        <CreateDocumentPanel
          documentNumber={documentNumber}
          proposedAosrNumber={proposedAosrNumber}
          selectedPeriod={selectedPeriod}
          onChangeDocumentNumber={onChangeDocumentNumber}
          onClose={onCloseCreateDocumentPanel}
          onCreateAosr={onCreateAosr}
        />
      ) : null}

      <dl className="object-overview__metrics" aria-label="Ключевые показатели объекта">
        <MetricItem label="Документы в периодах" value={metrics.aosrCount} />
        <MetricItem label="Использовано сертификатов" value={metrics.usedCertificateCount} />
        <MetricItem label="Документы объекта" value={metrics.objectDocumentCount} />
        <MetricItem label="Представители" value={metrics.representativeCount} />
      </dl>

      <OverviewPackageSection packageOverview={packageOverview} />

      <div className="object-overview__grid">
        <section className="object-overview__panel" aria-labelledby="overview-actions-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Быстрые действия</p>
            <h3 id="overview-actions-title">Работа по объекту</h3>
          </div>
          <div className="object-overview__actions">
            <button
              onClick={() => {
                onOpenPeriod(periods[0]?.id ?? 'period-2026-09');
              }}
              type="button"
            >
              <span aria-hidden="true">▦</span>
              <strong>Открыть период</strong>
              <small>{periods[0]?.name ?? 'Сентябрь 2026'}: рабочая папка периода</small>
            </button>
            <button onClick={onOpenDocuments} type="button">
              <span aria-hidden="true">▤</span>
              <strong>Документы объекта</strong>
              <small>Схемы, чертежи, протоколы и журналы</small>
            </button>
            <button onClick={onOpenFinalPackage} type="button">
              <span aria-hidden="true">▣</span>
              <strong>Итоговая ИД</strong>
              <small>Собирает документы всех периодов</small>
            </button>
          </div>
        </section>

        <section className="object-overview__panel" aria-labelledby="overview-periods-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Недавние периоды</p>
            <h3 id="overview-periods-title">Периоды работ</h3>
          </div>
          <ul className="object-overview__period-folders">
            {packageOverview.periodicPackages.map((idPackage) => (
              <li key={idPackage.id}>
                <button
                  onClick={() => {
                    const period = periods.find(
                      (candidate) => candidate.name === idPackage.periodName,
                    );

                    if (period !== undefined) {
                      onOpenPeriod(period.id);
                    }
                  }}
                  type="button"
                >
                  <span className="object-overview__folder-icon" aria-hidden="true">
                    ▣
                  </span>
                  <span className="object-overview__folder-main">
                    <strong>{idPackage.periodName}</strong>
                    <small>Рабочая папка периода</small>
                  </span>
                  <span className="object-overview__folder-meta">
                    <small>Документы</small>
                    <strong>{idPackage.summary.acts}</strong>
                  </span>
                  <span className="object-overview__folder-meta">
                    <small>Реестр</small>
                    <strong>{idPackage.summary.acts}</strong>
                  </span>
                  <span className="object-overview__folder-meta">
                    <small>ИД</small>
                    <strong>вид</strong>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="object-overview__panel" aria-labelledby="overview-recent-documents-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Недавние документы</p>
          <h3 id="overview-recent-documents-title">Документы в периодах</h3>
        </div>
        <ul className="object-overview__recent-list object-overview__recent-list--wide">
          {drafts.map((draft, index) => {
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
                    <strong>{draft.actNumber}</strong>
                    <small>
                      {period.name} / {aosrActType.title}
                    </small>
                  </span>
                  <span>
                    <small>Последнее изменение</small>
                    <strong>{draft.actDate}</strong>
                  </span>
                  <span>
                    <small>Версия документа</small>
                    <strong>{index + 1}.0</strong>
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
          Новый черновик будет создан в рабочей папке <strong>{selectedPeriod.name}</strong>.
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
        <p>Автонумерация — только подсказка. Номер можно изменить или оставить пустым.</p>
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
            <small>Другие типы документов появятся позже</small>
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
            <small>Будущий тип документа после отдельной ратификации формы</small>
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
            <p className="section-kicker">Рабочая папка периода</p>
            <h2 id="object-period-title">{period.name}</h2>
            <p>Документы, реестр периода и генерируемая ИД в одном рабочем контуре.</p>
          </div>
        </div>
        <button
          className="action-button action-button--primary"
          onClick={onOpenCreateDocumentPanel}
          type="button"
        >
          Создать АОСР
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
          className="object-period-panel object-period-panel--documents"
          aria-labelledby="period-documents-title"
        >
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Рабочий блок</p>
            <h3 id="period-documents-title">Документы</h3>
          </div>
          <ul className="object-overview__recent-list object-overview__recent-list--wide">
            {drafts.map((draft, index) => (
              <li key={draft.id}>
                <button
                  onClick={() => {
                    onOpenAosr(draft.id);
                  }}
                  type="button"
                >
                  <span>
                    <strong>{draft.actNumber}</strong>
                    <small>{aosrActType.title}</small>
                  </span>
                  <span>
                    <small>Дата документа</small>
                    <strong>{draft.actDate}</strong>
                  </span>
                  <span>
                    <small>Версия документа</small>
                    <strong>{index + 1}.0</strong>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="object-period-panel object-period-panel--registry"
          aria-labelledby="period-registry-title"
        >
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Реестр периода</p>
            <h3 id="period-registry-title">{periodRegistry.title}</h3>
          </div>
          <p className="derived-registry-context">{periodRegistry.description}</p>
          <DerivedRegistryTable registry={periodRegistry} />
        </section>

        <section
          className="object-period-panel object-period-placeholder"
          aria-labelledby="period-package-title"
        >
          <span className="object-period-placeholder__icon" aria-hidden="true">
            ◫
          </span>
          <div>
            <p className="section-kicker">Периодическая ИД</p>
            <h3 id="period-package-title">{period.periodicIdTitle}</h3>
            <p>
              Генерируемое представление по текущим документам и реестру периода. Повторное
              формирование покажет обновленный состав без закрытия периода и без архива.
            </p>
            <button
              className="compact-toggle compact-toggle--accent"
              onClick={onOpenPeriodicPackage}
              type="button"
            >
              Сформировать периодическую ИД
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

interface OverviewPackageSectionProps {
  readonly packageOverview: IdPackageOverviewModel;
}

function OverviewPackageSection({
  packageOverview,
}: OverviewPackageSectionProps): React.JSX.Element {
  return (
    <section className="object-overview__package-section" aria-labelledby="overview-package-title">
      <div className="object-overview__package-heading">
        <div>
          <p className="section-kicker">Генерируемые представления</p>
          <h3 id="overview-package-title">Периодическая ИД и итоговая ИД</h3>
        </div>
        <div className="id-package-flow__track id-package-flow__track--compact">
          <span>Периодическая ИД</span>
          <strong aria-hidden="true">→</strong>
          <span>Итоговая ИД</span>
        </div>
      </div>

      <div className="object-overview__package-grid">
        <section aria-labelledby="overview-periodic-package-title">
          <p className="section-kicker">Периоды</p>
          <h4 id="overview-periodic-package-title">Периодическая ИД</h4>
          <div className="periodic-package-list periodic-package-list--compact">
            {packageOverview.periodicPackages.map((idPackage) => (
              <OverviewPeriodicPackageRow idPackage={idPackage} key={idPackage.id} />
            ))}
          </div>
        </section>

        <section
          className="object-overview__final-package-note"
          aria-labelledby="overview-final-package-title"
        >
          <p className="section-kicker">Финал объекта</p>
          <h4 id="overview-final-package-title">{packageOverview.finalPackage.title}</h4>
          <p>{packageOverview.finalPackage.description}</p>
          <ul>
            <li>все документы из периодов;</li>
            <li>сертификаты из документов без дублей;</li>
            <li>чертежи и документы объекта без дублей;</li>
            <li>производный итоговый реестр.</li>
          </ul>
        </section>
      </div>
    </section>
  );
}

interface OverviewPeriodicPackageRowProps {
  readonly idPackage: PeriodicIdPackageModel;
}

function OverviewPeriodicPackageRow({
  idPackage,
}: OverviewPeriodicPackageRowProps): React.JSX.Element {
  return (
    <article className="periodic-package-row periodic-package-row--compact">
      <div>
        <h5>{idPackage.periodName}</h5>
        <p>{idPackage.note}</p>
      </div>
      <dl aria-label={`Состав пакета ${idPackage.periodName}`}>
        <MetricItem label="Документы периода" value={idPackage.summary.acts} />
        <MetricItem label="Сертификаты" value={idPackage.summary.usedCertificates} />
        <MetricItem label="Документы объекта" value={idPackage.summary.objectDocuments} />
      </dl>
    </article>
  );
}

function getUsedCertificateCount(
  drafts: readonly DemoAosrDraft[],
  certificates: readonly DemoCertificate[],
): number {
  const certificateByMaterialId = new Map<string, string>();

  for (const certificate of certificates) {
    for (const material of certificate.materials) {
      certificateByMaterialId.set(material.id, certificate.id);
    }
  }

  const usedCertificateIds = new Set<string>();

  for (const draft of drafts) {
    for (const materialCertificateId of draft.materialCertificateIds) {
      const certificateId = certificateByMaterialId.get(materialCertificateId);

      if (certificateId !== undefined) {
        usedCertificateIds.add(certificateId);
      }
    }
  }

  return usedCertificateIds.size;
}
