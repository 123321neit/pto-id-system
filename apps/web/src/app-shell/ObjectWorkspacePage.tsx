import { useState } from 'react';

import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { RepresentativesOrganizationsPage } from './RepresentativesOrganizationsPage.js';
import type { MockObjectCard } from './mock-dashboard.js';

type ObjectWorkspaceSection =
  | 'aosr'
  | 'certificates'
  | 'documents'
  | 'representatives'
  | 'registry'
  | 'settings';

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly onBackToObjects: () => void;
}

interface ObjectWorkspacePlaceholderProps {
  readonly description: string;
  readonly items: readonly string[];
  readonly title: string;
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
            АОСР
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

        {activeSection === 'certificates' ? (
          <ObjectWorkspacePlaceholder
            title="Сертификаты"
            description="Библиотека сертификатов и паспортов качества объекта"
            items={[
              'Связь сертификатов с материалами и актами',
              'Контроль сроков и статуса документов качества',
              'Подготовка будущей выдачи в комплект ИД',
            ]}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'representatives' ? (
          <RepresentativesOrganizationsPage
            backLabel="Вернуться к АОСР"
            description="Организации, представители и основания полномочий для объекта и актов"
            onBackToObjects={openAosr}
          />
        ) : null}

        {activeSection === 'registry' ? (
          <ObjectWorkspacePlaceholder
            title="Реестр ИД"
            description="Сводный перечень исполнительной документации объекта"
            items={[
              'Автоматическая сборка строк из данных объекта',
              'Будущие presentation overrides без подмены источника',
              'Основа для выдачи реестра и комплекта ИД',
            ]}
          />
        ) : null}
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
  return (
    <header className="object-workspace-header">
      <div className="object-workspace-header__title">
        <p className="object-workspace-breadcrumbs">
          Объекты / {object.title} / {getSectionBreadcrumb(activeSection)}
        </p>
        <div className="object-workspace-header__heading">
          <h1 id="object-workspace-title">{object.title}</h1>
          <span className={`status-chip status-chip--${object.status}`}>{object.statusLabel}</span>
        </div>
        <p>{object.address}</p>
      </div>

      <dl className="object-workspace-metrics" aria-label="Показатели открытого объекта">
        <MetricItem label="АОСР" value={metrics.aosrCount} />
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

function ObjectWorkspacePlaceholder({
  description,
  items,
  title,
}: ObjectWorkspacePlaceholderProps): React.JSX.Element {
  return (
    <section className="object-placeholder" aria-labelledby="object-placeholder-title">
      <div className="object-placeholder__intro">
        <p className="section-kicker">Будущий раздел объекта</p>
        <h2 id="object-placeholder-title">{title}</h2>
        <strong>Раздел находится в разработке</strong>
        <p>{description}</p>
      </div>
      <ul className="object-placeholder__list" aria-label={`Будущие возможности: ${title}`}>
        {items.map((item) => (
          <li key={item}>
            <span aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function getSectionBreadcrumb(section: ObjectWorkspaceSection): string {
  switch (section) {
    case 'aosr':
    case 'settings':
      return 'Акты / АОСР';
    case 'certificates':
      return 'Сертификаты';
    case 'documents':
      return 'Документы объекта';
    case 'representatives':
      return 'Представители';
    case 'registry':
      return 'Реестр ИД';
  }
}
