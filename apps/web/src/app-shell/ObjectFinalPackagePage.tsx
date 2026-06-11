import { useMemo } from 'react';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import {
  buildFinalPackageModel,
  buildIdPackageOverviewModel,
  finalIdPackageDescription,
  type FinalPackageGroup,
  type PeriodicIdPackageModel,
} from './object-final-package-model.js';

export function ObjectFinalPackagePage(): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const finalPackage = useMemo(
    () => buildFinalPackageModel(demoAosrWorkspace.drafts, objectDocuments, certificates),
    [certificates, objectDocuments],
  );
  const packageOverview = useMemo(
    () => buildIdPackageOverviewModel(demoAosrWorkspace.drafts, objectDocuments, certificates),
    [certificates, objectDocuments],
  );

  return (
    <section
      className="object-documents-workspace object-final-package-workspace"
      aria-labelledby="object-final-package-title"
    >
      <header className="object-documents-hero object-final-package-hero">
        <div>
          <p className="section-kicker">Итоговый комплект</p>
          <h2 id="object-final-package-title">{packageOverview.finalPackage.title}</h2>
          <p>{finalIdPackageDescription}</p>
        </div>
      </header>

      <FinalPackageFlowExplanation />

      <PeriodicPackageOverview packages={packageOverview.periodicPackages} />

      <dl className="object-documents-summary" aria-label="Сводка итогового комплекта ИД">
        <SummaryItem label="Акты" value={finalPackage.summary.acts} />
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
            <p className="section-kicker">Диагностика</p>
            <h3 id="final-package-readiness-title">Проверка комплекта</h3>
          </div>
          <strong className="readiness-card__status">{finalPackage.readiness.statusLabel}</strong>
        </div>

        <p className="readiness-card__helper">
          Пустые поля не блокируют печать: в печатной форме будут оставлены строки для заполнения от
          руки.
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
          <h3>Сборка комплекта</h3>
          <p>
            В демо режиме скачивание не выполняется. Позже здесь будет сборка PDF/DOCX/ZIP
            комплекта.
          </p>
        </div>
        <button className="action-button action-button--primary" disabled type="button">
          Скачать итоговую ИД
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
          Периодические комплекты готовятся за отдельные периоды работ, а итоговая ИД собирает
          документацию по объекту целиком.
        </p>
      </div>

      <div className="id-package-flow__track" aria-label="Периодическая ИД переходит в итоговую ИД">
        <span>Периодическая ИД</span>
        <strong aria-hidden="true">→</strong>
        <span>Итоговая ИД</span>
      </div>

      <ul className="id-package-flow__list">
        <li>все акты из периодов;</li>
        <li>все использованные сертификаты без дублей;</li>
        <li>все использованные чертежи и документы объекта без дублей;</li>
        <li>итоговый реестр.</li>
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
          <p className="section-kicker">Пакеты ИД</p>
          <h3 id="periodic-package-title">Периодическая ИД</h3>
        </div>
        <p>Первые mock-периоды для будущей структуры комплектов.</p>
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
              <SummaryItem label="Акты" value={idPackage.summary.acts} />
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
        </div>
      </div>

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
    </section>
  );
}
