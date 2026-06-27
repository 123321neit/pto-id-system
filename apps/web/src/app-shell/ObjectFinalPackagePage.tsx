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
  readonly sectionName?: string | undefined;
}

export function ObjectFinalPackagePage({
  drafts = demoAosrWorkspace.drafts,
  periods = demoObjectPeriods,
  sectionName,
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
          <h2 id="object-final-package-title">
            Печать итоговой ИД{sectionName === undefined ? '' : `: ${sectionName}`}
          </h2>
          <p>{finalIdPackageDescription}</p>
        </div>
      </header>

      <PeriodicPackageOverview packages={packageOverview.periodicPackages} />

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка итогового комплекта ИД"
      >
        <SummaryItem label="Документы из папок" value={finalPackage.summary.acts} />
        <SummaryItem label="Сертификаты без дублей" value={finalPackage.summary.certificates} />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={finalPackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={finalPackage.summary.total} />
      </dl>

      <div className="final-package-groups">
        {finalPackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>

      <section className="object-documents-panel final-package-download" aria-label="Скачивание">
        <div>
          <p className="section-kicker">Итоговый комплект</p>
          <h3>Печать итоговой ИД{sectionName === undefined ? '' : ' раздела'}</h3>
          <p>
            Документы папок выбранного раздела собираются без дублирования сертификатов и файлов.
          </p>
        </div>
        <button className="action-button" disabled type="button">
          Печать итоговой ИД{sectionName === undefined ? '' : ' раздела'}
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

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка промежуточной ИД"
      >
        <SummaryItem label="Документы папки" value={periodicPackage.summary.acts} />
        <SummaryItem label="Сертификаты без дублей" value={periodicPackage.summary.certificates} />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={periodicPackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={periodicPackage.summary.total} />
      </dl>

      <div className="final-package-groups">
        {periodicPackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>

      <section className="object-documents-panel final-package-download" aria-label="Формирование">
        <div>
          <p className="section-kicker">Промежуточный комплект</p>
          <h3>Печать промежуточной ИД</h3>
          <p>Комплект печатается из текущего состава папки.</p>
        </div>
        <button className="action-button" disabled type="button">
          Печать промежуточной ИД
        </button>
      </section>
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
          <p className="section-kicker">Папки ИД</p>
          <h3 id="periodic-package-title">Промежуточная ИД по папкам</h3>
        </div>
        <p>Состав промежуточной печати по каждой папке.</p>
      </div>

      <div className="periodic-package-list">
        {packages.map((idPackage) => (
          <article className="periodic-package-row" key={idPackage.id}>
            <div>
              <p className="section-tag">Папка</p>
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
