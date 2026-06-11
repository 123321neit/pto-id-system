import { useMemo, useState } from 'react';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore, type DemoCertificate } from '../demo-store/demo-store.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage } from './ObjectFinalPackagePage.js';
import { ObjectRegistryPage } from './ObjectRegistryPage.js';
import { RepresentativesOrganizationsPage } from './RepresentativesOrganizationsPage.js';
import type { MockObjectCard } from './mock-dashboard.js';

const aosrActType = getDemoActTypeById('aosr');

type ObjectWorkspaceSection =
  | 'overview'
  | 'aosr'
  | 'documents'
  | 'representatives'
  | 'registry'
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
  const [isCreateDocumentPanelOpen, setCreateDocumentPanelOpen] = useState(false);
  const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const usedCertificateCount = useMemo(
    () => getUsedCertificateCount(demoAosrWorkspace.drafts, certificates),
    [certificates],
  );
  const metrics: ObjectWorkspaceMetrics = {
    aosrCount: demoAosrWorkspace.drafts.length,
    usedCertificateCount,
    objectDocumentCount: objectDocuments.length,
    representativeCount: representatives.length,
  };

  const openAosr = (): void => {
    setCreateDocumentPanelOpen(false);
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
            onClick={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('overview');
            }}
            type="button"
          >
            <span aria-hidden="true">⌂</span>
            Обзор
          </button>
          <button
            aria-current={activeSection === 'aosr' ? 'page' : undefined}
            onClick={openAosr}
            type="button"
          >
            <span aria-hidden="true">□</span>
            Акты
          </button>
          <button
            aria-current={activeSection === 'aosr' ? 'page' : undefined}
            className="object-workspace-nav__subitem"
            onClick={openAosr}
            type="button"
          >
            <span aria-hidden="true">↳</span>
            {aosrActType.code}
          </button>
          <button
            aria-current={activeSection === 'documents' ? 'page' : undefined}
            aria-label="Открыть документы объекта"
            onClick={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('documents');
            }}
            type="button"
          >
            <span aria-hidden="true">▤</span>
            Документы объекта
          </button>
          <button
            aria-current={activeSection === 'representatives' ? 'page' : undefined}
            onClick={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('representatives');
            }}
            type="button"
          >
            <span aria-hidden="true">△</span>
            Представители
          </button>
          <button
            aria-current={activeSection === 'registry' ? 'page' : undefined}
            aria-label="Открыть реестр ИД"
            onClick={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('registry');
            }}
            type="button"
          >
            <span aria-hidden="true">≡</span>
            Реестр ИД
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
            <span aria-hidden="true">▣</span>
            Итоговый комплект
          </button>
          <button
            aria-current={activeSection === 'settings' ? 'page' : undefined}
            aria-label="Открыть настройки объекта"
            onClick={openObjectSettings}
            type="button"
          >
            <span aria-hidden="true">○</span>
            Настройки объекта
          </button>
        </nav>
      </aside>

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} activeSection={activeSection} metrics={metrics} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            metrics={metrics}
            object={object}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={openAosr}
            onOpenAosr={openAosr}
            onOpenCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(true);
            }}
            onOpenDocuments={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('documents');
            }}
            onOpenFinalPackage={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('final-package');
            }}
            onOpenRegistry={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('registry');
            }}
          />
        ) : null}

        {isAosrVisible ? (
          <DemoAosrWorkspacePage
            isEmbeddedInObjectWorkspace
            settingsOpenRequest={settingsOpenRequest}
            onObjectSettingsClosed={() => {
              setActiveSection('aosr');
            }}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'representatives' ? (
          <RepresentativesOrganizationsPage
            backLabel="Вернуться к обзору"
            description="Организации, представители и основания полномочий для объекта и актов"
            onBackToObjects={() => {
              setActiveSection('overview');
            }}
          />
        ) : null}

        {activeSection === 'registry' ? <ObjectRegistryPage /> : null}

        {activeSection === 'final-package' ? <ObjectFinalPackagePage /> : null}
      </section>
    </main>
  );
}

interface ObjectWorkspaceHeaderProps {
  readonly activeSection: ObjectWorkspaceSection;
  readonly metrics: ObjectWorkspaceMetrics;
  readonly object: MockObjectCard;
}

function ObjectWorkspaceHeader({
  activeSection,
  metrics,
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
          <div>
            <dt>Документов в объекте</dt>
            <dd>{object.documentsCount}</dd>
          </div>
        </dl>
      </div>

      <dl className="object-workspace-metrics" aria-label="Показатели открытого объекта">
        <MetricItem label={aosrActType.code} value={metrics.aosrCount} />
        <MetricItem label="Использовано сертификатов" value={metrics.usedCertificateCount} />
        <MetricItem label="Документы" value={metrics.objectDocumentCount} />
        <MetricItem label="Представители" value={metrics.representativeCount} />
      </dl>
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
    case 'aosr':
    case 'settings':
      return `Акты / ${aosrActType.code}`;
    case 'documents':
      return 'Документы объекта';
    case 'representatives':
      return 'Представители';
    case 'registry':
      return 'Реестр ИД';
    case 'final-package':
      return 'Итоговый комплект';
  }
}

interface ObjectOverviewProps {
  readonly isCreateDocumentPanelOpen: boolean;
  readonly metrics: ObjectWorkspaceMetrics;
  readonly object: MockObjectCard;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onOpenAosr: () => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenDocuments: () => void;
  readonly onOpenFinalPackage: () => void;
  readonly onOpenRegistry: () => void;
}

function ObjectOverview({
  isCreateDocumentPanelOpen,
  metrics,
  object,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onOpenAosr,
  onOpenCreateDocumentPanel,
  onOpenDocuments,
  onOpenFinalPackage,
  onOpenRegistry,
}: ObjectOverviewProps): React.JSX.Element {
  return (
    <section className="object-overview" aria-labelledby="object-overview-title">
      <div className="object-overview__intro">
        <div>
          <p className="section-kicker">Обзор</p>
          <h2 id="object-overview-title">Обзор объекта</h2>
          <strong>{object.title}</strong>
          <p>{object.address}</p>
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
        <section
          className="object-overview__create-panel"
          role="dialog"
          aria-labelledby="create-document-title"
        >
          <div>
            <p className="section-kicker">Новый документ</p>
            <h3 id="create-document-title">Создать документ</h3>
            <p>
              В следующих версиях номер будет предложен автоматически, с возможностью ручного
              изменения.
            </p>
          </div>
          <ul aria-label="Доступные типы актов">
            {registeredDemoActTypes.map((actType) => (
              <li key={actType.id}>
                <span>
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
                  Создать {actType.code}
                </button>
              </li>
            ))}
          </ul>
          <button className="compact-toggle" onClick={onCloseCreateDocumentPanel} type="button">
            Закрыть
          </button>
        </section>
      ) : null}

      <dl className="object-overview__metrics" aria-label="Ключевые показатели объекта">
        <MetricItem label="Акты" value={metrics.aosrCount} />
        <MetricItem label="Использовано сертификатов" value={metrics.usedCertificateCount} />
        <MetricItem label="Документы объекта" value={metrics.objectDocumentCount} />
        <MetricItem label="Представители" value={metrics.representativeCount} />
      </dl>

      <div className="object-overview__grid">
        <section className="object-overview__panel" aria-labelledby="overview-actions-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Быстрые действия</p>
            <h3 id="overview-actions-title">Работа по объекту</h3>
          </div>
          <div className="object-overview__actions">
            <button onClick={onOpenCreateDocumentPanel} type="button">
              <span aria-hidden="true">＋</span>
              <strong>Создать документ</strong>
              <small>Выбор типа акта из зарегистрированной метадаты</small>
            </button>
            <button onClick={onOpenAosr} type="button">
              <span aria-hidden="true">□</span>
              <strong>Открыть {aosrActType.code}</strong>
              <small>{aosrActType.title}</small>
            </button>
            <button onClick={onOpenDocuments} type="button">
              <span aria-hidden="true">▤</span>
              <strong>Документы объекта</strong>
              <small>Схемы, чертежи, протоколы и журналы</small>
            </button>
            <button onClick={onOpenRegistry} type="button">
              <span aria-hidden="true">≡</span>
              <strong>Реестр ИД</strong>
              <small>Производный перечень документов</small>
            </button>
            <button onClick={onOpenFinalPackage} type="button">
              <span aria-hidden="true">▣</span>
              <strong>Итоговый комплект</strong>
              <small>Комплект из актов, документов и использованных сертификатов</small>
            </button>
          </div>
        </section>

        <section className="object-overview__panel" aria-labelledby="overview-recent-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Недавние документы</p>
            <h3 id="overview-recent-title">Акты и документы</h3>
          </div>
          <ul className="object-overview__recent-list">
            {demoAosrWorkspace.drafts.map((draft, index) => (
              <li key={draft.id}>
                <button onClick={onOpenAosr} type="button">
                  <span>
                    <strong>{draft.actNumber}</strong>
                    <small>{aosrActType.title}</small>
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
            ))}
          </ul>
        </section>
      </div>
    </section>
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
