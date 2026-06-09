import { useState } from 'react';

import { getDemoActTypeById } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import { ObjectCertificatesPage } from './ObjectCertificatesPage.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage } from './ObjectFinalPackagePage.js';
import { ObjectRegistryPage } from './ObjectRegistryPage.js';
import { RepresentativesOrganizationsPage } from './RepresentativesOrganizationsPage.js';
import type { MockObjectCard } from './mock-dashboard.js';

const aosrActType = getDemoActTypeById('aosr');

type ObjectWorkspaceSection =
  | 'aosr'
  | 'certificates'
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
  readonly certificateCount: number;
  readonly objectDocumentCount: number;
  readonly representativeCount: number;
}

export function ObjectWorkspacePage({
  object,
  onBackToObjects,
}: ObjectWorkspacePageProps): React.JSX.Element {
  const { certificates, objectDocuments, representatives } = useDemoStore();
  const [activeSection, setActiveSection] = useState<ObjectWorkspaceSection>('aosr');
  const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const metrics: ObjectWorkspaceMetrics = {
    aosrCount: demoAosrWorkspace.drafts.length,
    certificateCount: certificates.length,
    objectDocumentCount: objectDocuments.length,
    representativeCount: representatives.length,
  };

  const openAosr = (): void => {
    setActiveSection('aosr');
  };

  const openObjectSettings = (): void => {
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
            aria-current={activeSection === 'certificates' ? 'page' : undefined}
            aria-label="Открыть сертификаты объекта"
            onClick={() => {
              setActiveSection('certificates');
            }}
            type="button"
          >
            <span aria-hidden="true">◇</span>
            Сертификаты
          </button>
          <button
            aria-current={activeSection === 'documents' ? 'page' : undefined}
            aria-label="Открыть документы объекта"
            onClick={() => {
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

        <div hidden={!isAosrVisible}>
          <DemoAosrWorkspacePage
            isEmbeddedInObjectWorkspace
            settingsOpenRequest={settingsOpenRequest}
            onObjectSettingsClosed={() => {
              setActiveSection('aosr');
            }}
          />
        </div>

        {activeSection === 'certificates' ? <ObjectCertificatesPage /> : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'representatives' ? (
          <RepresentativesOrganizationsPage
            backLabel="Вернуться к АОСР"
            description="Организации, представители и основания полномочий для объекта и актов"
            onBackToObjects={openAosr}
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
        <MetricItem label="Сертификаты" value={metrics.certificateCount} />
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
    case 'aosr':
    case 'settings':
      return `Акты / ${aosrActType.code}`;
    case 'certificates':
      return 'Сертификаты';
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
