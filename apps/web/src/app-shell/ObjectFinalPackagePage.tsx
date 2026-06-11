import { useMemo } from 'react';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import { buildFinalPackageModel, type FinalPackageGroup } from './object-final-package-model.js';

export function ObjectFinalPackagePage(): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const finalPackage = useMemo(
    () => buildFinalPackageModel(demoAosrWorkspace.drafts, objectDocuments, certificates),
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
          <h2 id="object-final-package-title">Итоговый комплект ИД</h2>
          <p>Финальный комплект исполнительной документации по объекту.</p>
        </div>
      </header>

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
