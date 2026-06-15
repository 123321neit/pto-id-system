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
          Финальный реестр строится из документов всех периодов. Он не сохраняется как отдельная
          сущность, не блокируется и не архивируется. Пустые поля не блокируют печатные формы.
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
          <p>
            В демо режиме это только просмотр генерируемого представления. Реальная генерация
            PDF/DOCX/ZIP и историческое хранение ZIP находятся вне текущего frontend-мока.
          </p>
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
          Реестр периода и периодическая ИД строятся из текущих документов выбранного периода. Они
          не сохраняются как сущности, не блокируются и не закрывают период. Пустые поля остаются
          допустимыми для ручного заполнения в будущих печатных формах.
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
          <p>
            Повторное формирование всегда берет текущие документы периода. В этом frontend-моке нет
            backend-логики, генерации ZIP, сохранения пакета, закрытия периода или архивных записей.
          </p>
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
    <section className="id-package-flow" aria-labelledby="final-package-flow-title">
      <div>
        <p className="section-kicker">Логика комплекта</p>
        <h3 id="final-package-flow-title">Периодическая ИД → Итоговая ИД</h3>
        <p>
          Периодическая и итоговая ИД не хранятся как бизнес-сущности. Это генерируемые
          представления, которые каждый раз собираются из текущих документов и производных реестров.
        </p>
      </div>

      <div className="id-package-flow__track" aria-label="Периодическая ИД переходит в итоговую ИД">
        <span>Периодическая ИД</span>
        <strong aria-hidden="true">→</strong>
        <span>Итоговая ИД</span>
      </div>

      <ul className="id-package-flow__list">
        <li>все документы из периодов;</li>
        <li>финальный реестр из документов всех периодов;</li>
        <li>все использованные сертификаты без дублей;</li>
        <li>все использованные чертежи и документы объекта без дублей;</li>
      </ul>
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
    <section className="id-package-flow" aria-labelledby="periodic-package-flow-title">
      <div>
        <p className="section-kicker">Логика представления</p>
        <h3 id="periodic-package-flow-title">Документы периода → Периодическая ИД</h3>
        <p>
          {periodName} остается рабочей папкой. Периодическая ИД формируется из ее текущих
          документов, производного реестра периода и связанных приложений.
        </p>
      </div>

      <div
        className="id-package-flow__track"
        aria-label="Документы периода формируют периодическую ИД"
      >
        <span>Документы периода</span>
        <strong aria-hidden="true">→</strong>
        <span>Периодическая ИД</span>
      </div>

      <ul className="id-package-flow__list">
        <li>документы выбранного периода;</li>
        <li>реестр периода из текущих документов;</li>
        <li>использованные сертификаты без дублей;</li>
        <li>использованные документы объекта без дублей.</li>
      </ul>
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
