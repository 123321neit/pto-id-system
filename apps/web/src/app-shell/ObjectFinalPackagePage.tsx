import { useMemo } from 'react';

import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import { DerivedRegistryTable } from './DerivedRegistryTable.js';
import {
  buildFinalPackageModel,
  buildIdPackageOverviewModel,
  buildPeriodicPackageModel,
  finalIdPackageDescription,
  periodicIdPackageDescription,
  type FinalPackageGroup,
  type PeriodicIdPackageModel,
} from './object-final-package-model.js';
import {
  demoObjectPeriods,
  type DemoObjectPeriod,
  type DemoObjectPeriods,
} from './object-periods.js';

interface ObjectFinalPackagePageProps {
  readonly drafts?: readonly DemoAosrDraft[];
  readonly periods?: DemoObjectPeriods;
}

export function ObjectFinalPackagePage({
  drafts = demoAosrWorkspace.drafts,
  periods = demoObjectPeriods,
}: ObjectFinalPackagePageProps = {}): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const finalPackage = useMemo(
    () => buildFinalPackageModel(drafts, objectDocuments, certificates, periods),
    [certificates, drafts, objectDocuments, periods],
  );
  const packageOverview = useMemo(
    () => buildIdPackageOverviewModel(drafts, objectDocuments, certificates, periods),
    [certificates, drafts, objectDocuments, periods],
  );

  return (
    <section
      className="object-documents-workspace object-final-package-workspace"
      aria-labelledby="object-final-package-title"
    >
      <header className="object-documents-hero object-final-package-hero">
        <div>
          <p className="section-kicker">Генерируемое представление</p>
          <h2 id="object-final-package-title">{packageOverview.finalPackage.title}</h2>
          <p>{finalIdPackageDescription}</p>
        </div>
      </header>

      <FinalPackageFlowExplanation />

      <PeriodicPackageOverview packages={packageOverview.periodicPackages} />

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка итогового комплекта ИД"
      >
        <SummaryItem label="Документы из периодов" value={finalPackage.summary.acts} />
        <SummaryItem label="Сертификаты без дублей" value={finalPackage.summary.certificates} />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={finalPackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={finalPackage.summary.total} />
      </dl>

      <section
        className={`readiness-card readiness-card--${finalPackage.readiness.status}`}
        aria-labelledby="final-package-readiness-title"
      >
        <div className="readiness-card__header">
          <div>
            <p className="section-kicker">Подсказки</p>
            <h3 id="final-package-readiness-title">Подсказки по комплекту</h3>
          </div>
          <strong className="readiness-card__status">{finalPackage.readiness.statusLabel}</strong>
        </div>

        <p className="readiness-card__helper">
          Формируется из текущих данных. Не сохраняется и не блокирует работу.
        </p>

        {finalPackage.readiness.issues.length > 0 ? (
          <div className="readiness-card__issues">
            <p>Пустые разделы:</p>
            <ul>
              {finalPackage.readiness.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="readiness-card__empty">Пробелов по демо-проверкам нет.</p>
        )}
      </section>

      <div className="final-package-groups">
        {finalPackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>

      <section className="object-documents-panel final-package-download" aria-label="Скачивание">
        <div>
          <p className="section-kicker">Демо действие</p>
          <h3>Сформировать итоговую ИД</h3>
          <p>Демо показывает состав комплекта без генерации файлов и сохранения архива.</p>
        </div>
        <button className="action-button" disabled type="button">
          Сформировать итоговую ИД
        </button>
      </section>
    </section>
  );
}

interface ObjectPeriodicPackagePageProps {
  readonly drafts?: readonly DemoAosrDraft[];
  readonly period: DemoObjectPeriod;
}

export function ObjectPeriodicPackagePage({
  drafts = demoAosrWorkspace.drafts,
  period,
}: ObjectPeriodicPackagePageProps): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const periodicPackage = useMemo(
    () => buildPeriodicPackageModel(period, drafts, objectDocuments, certificates),
    [certificates, drafts, objectDocuments, period],
  );

  return (
    <section
      className="object-documents-workspace object-final-package-workspace"
      aria-labelledby="object-periodic-package-title"
    >
      <header className="object-documents-hero object-final-package-hero">
        <div>
          <p className="section-kicker">Генерируемое представление</p>
          <h2 id="object-periodic-package-title">{period.periodicIdTitle}</h2>
          <p>{periodicIdPackageDescription}</p>
        </div>
      </header>

      <PeriodicPackageFlowExplanation periodName={period.name} />

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка периодической ИД"
      >
        <SummaryItem label="Документы периода" value={periodicPackage.summary.acts} />
        <SummaryItem label="Сертификаты без дублей" value={periodicPackage.summary.certificates} />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={periodicPackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={periodicPackage.summary.total} />
      </dl>

      <section
        className={`readiness-card readiness-card--${periodicPackage.readiness.status}`}
        aria-labelledby="periodic-package-readiness-title"
      >
        <div className="readiness-card__header">
          <div>
            <p className="section-kicker">Подсказки</p>
            <h3 id="periodic-package-readiness-title">Подсказки по периодической ИД</h3>
          </div>
          <strong className="readiness-card__status">
            {periodicPackage.readiness.statusLabel}
          </strong>
        </div>

        <p className="readiness-card__helper">
          Формируется из текущих данных. Не сохраняется и не закрывает период.
        </p>

        {periodicPackage.readiness.issues.length > 0 ? (
          <div className="readiness-card__issues">
            <p>Пустые разделы:</p>
            <ul>
              {periodicPackage.readiness.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="readiness-card__empty">Пробелов по демо-проверкам нет.</p>
        )}
      </section>

      <div className="final-package-groups">
        {periodicPackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>

      <section className="object-documents-panel final-package-download" aria-label="Формирование">
        <div>
          <p className="section-kicker">Демо действие</p>
          <h3>Сформировать периодическую ИД</h3>
          <p>Демо показывает состав периода без генерации файлов и закрытия периода.</p>
        </div>
        <button className="action-button" disabled type="button">
          Сформировать периодическую ИД
        </button>
      </section>
    </section>
  );
}

function FinalPackageFlowExplanation(): React.JSX.Element {
  return (
    <section
      className="id-package-flow id-package-flow--compact"
      aria-labelledby="final-package-flow-title"
    >
      <div>
        <p className="section-kicker">Статус</p>
        <h3 id="final-package-flow-title">Формируется из текущих данных</h3>
        <p>Состав пересобирается из периодов, реестров и приложений без отдельного сохранения.</p>
      </div>
    </section>
  );
}

interface PeriodicPackageFlowExplanationProps {
  readonly periodName: string;
}

function PeriodicPackageFlowExplanation({
  periodName,
}: PeriodicPackageFlowExplanationProps): React.JSX.Element {
  return (
    <section
      className="id-package-flow id-package-flow--compact"
      aria-labelledby="periodic-package-flow-title"
    >
      <div>
        <p className="section-kicker">Статус</p>
        <h3 id="periodic-package-flow-title">Формируется из текущих данных</h3>
        <p>{periodName} остается рабочей папкой. Повторный просмотр покажет текущий состав.</p>
      </div>
    </section>
  );
}

interface PeriodicPackageOverviewProps {
  readonly packages: readonly PeriodicIdPackageModel[];
}

function PeriodicPackageOverview({ packages }: PeriodicPackageOverviewProps): React.JSX.Element {
  return (
    <section className="periodic-package-overview" aria-labelledby="periodic-package-title">
      <div className="periodic-package-overview__heading">
        <div>
          <p className="section-kicker">Периоды</p>
          <h3 id="periodic-package-title">Периодическая ИД</h3>
        </div>
        <p>Генерируемые представления по периодам, без закрытия периода и без сохранения пакета.</p>
      </div>

      <div className="periodic-package-list">
        {packages.map((idPackage) => (
          <article className="periodic-package-row" key={idPackage.id}>
            <div>
              <p className="section-tag">Период</p>
              <h4>{idPackage.periodName}</h4>
              <p>{idPackage.title}</p>
            </div>
            <dl aria-label={`Состав пакета ${idPackage.periodName}`}>
              <SummaryItem label="Документы" value={idPackage.summary.acts} />
              <SummaryItem
                label="Использовано сертификатов"
                value={idPackage.summary.usedCertificates}
              />
              <SummaryItem label="Документы объекта" value={idPackage.summary.objectDocuments} />
            </dl>
            <p className="periodic-package-row__note">{idPackage.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

interface SummaryItemProps {
  readonly label: string;
  readonly value: number;
}

function SummaryItem({ label, value }: SummaryItemProps): React.JSX.Element {
  return (
    <div aria-label={`${label}: ${String(value)}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

interface FinalPackageGroupSectionProps {
  readonly group: FinalPackageGroup;
}

function FinalPackageGroupSection({ group }: FinalPackageGroupSectionProps): React.JSX.Element {
  const headingId = `final-package-group-${group.id}`;

  return (
    <section className="object-documents-panel" aria-labelledby={headingId}>
      <div className="object-documents-panel__header">
        <div>
          <p className="section-kicker">Группа</p>
          <h3 id={headingId}>{group.title}</h3>
          {group.registry !== undefined ? (
            <p className="derived-registry-context">{group.registry.description}</p>
          ) : null}
        </div>
      </div>

      {group.registry !== undefined ? (
        <DerivedRegistryTable registry={group.registry} />
      ) : (
        <div className="object-documents-table-wrap">
          <table className="object-documents-table final-package-table">
            <thead>
              <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Номер</th>
                <th scope="col">Дата</th>
                <th scope="col">Детали</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.number}</td>
                  <td>{item.date}</td>
                  <td>{item.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
