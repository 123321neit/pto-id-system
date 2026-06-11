import { useMemo, useState } from 'react';

import { getDemoActTypeById } from '../act-types/act-types.js';
import { demoAosrWorkspace, type DemoObjectDocument } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getCertificateMaterialNames,
  type DemoCertificate,
  useDemoStore,
} from '../demo-store/demo-store.js';

type RegistryFilter = 'all' | 'aosr' | 'documents' | 'certificates';

interface RegistryFilterOption {
  readonly id: RegistryFilter;
  readonly label: string;
  readonly section?: string;
}

interface RegistryRow {
  readonly id: string;
  readonly date: string;
  readonly name: string;
  readonly number: string;
  readonly section: string;
  readonly details: string;
}

interface RegistrySummary {
  readonly aosr: number;
  readonly certificates: number;
  readonly documents: number;
  readonly total: number;
}

const aosrActType = getDemoActTypeById('aosr');

const registryFilters: readonly RegistryFilterOption[] = [
  { id: 'all', label: 'Все' },
  { id: 'aosr', label: aosrActType.code, section: aosrActType.registrySectionName },
  { id: 'documents', label: 'Документы объекта', section: 'Документы объекта' },
  { id: 'certificates', label: 'Сертификаты', section: 'Сертификаты' },
];

export function ObjectRegistryPage(): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const [activeFilter, setActiveFilter] = useState<RegistryFilter>('all');
  const registryRows = useMemo(
    () => buildRegistryRows(objectDocuments, certificates),
    [certificates, objectDocuments],
  );
  const summary = getRegistrySummary(registryRows);
  const filteredRows = filterRegistryRows(registryRows, activeFilter);

  return (
    <section
      className="object-documents-workspace object-registry-workspace"
      aria-labelledby="object-registry-title"
    >
      <header className="object-documents-hero object-registry-hero">
        <div>
          <p className="section-kicker">Реестр ИД</p>
          <h2 id="object-registry-title">Реестр исполнительной документации</h2>
          <p>Сводный перечень документов исполнительной документации объекта.</p>
        </div>
      </header>

      <dl className="object-documents-summary" aria-label="Сводка реестра ИД">
        <SummaryItem label="Всего документов" value={summary.total} />
        <SummaryItem label="АОСР" value={summary.aosr} />
        <SummaryItem label="Документы объекта" value={summary.documents} />
        <SummaryItem label="Сертификаты" value={summary.certificates} />
      </dl>

      <section className="object-documents-panel" aria-labelledby="object-registry-list-title">
        <div className="object-documents-panel__header">
          <div>
            <p className="section-kicker">Список</p>
            <h3 id="object-registry-list-title">Документы ИД</h3>
          </div>
          <div className="object-documents-filters" aria-label="Фильтры реестра ИД">
            {registryFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter.id}
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                }}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="object-documents-table-wrap">
          <table className="object-documents-table object-registry-table">
            <thead>
              <tr>
                <th scope="col">Раздел</th>
                <th scope="col">Наименование</th>
                <th scope="col">Номер</th>
                <th scope="col">Дата</th>
                <th scope="col">Сведения</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.section}</td>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.number}</td>
                  <td>{row.date}</td>
                  <td>{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="object-registry-note">
        В следующих версиях реестр будет автоматически включать исполнительные схемы, журналы,
        протоколы, результаты испытаний и другие документы ИД.
      </p>
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

function buildRegistryRows(
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
): readonly RegistryRow[] {
  return [
    ...demoAosrWorkspace.drafts.map((draft, index) => ({
      date: draft.actDate,
      id: `aosr-${draft.id}`,
      name: `${aosrActType.title}. ${draft.workDescription}`,
      number: draft.actNumber,
      section: aosrActType.registrySectionName,
      details: `Версия документа: ${String(index + 1)}.0; последнее изменение: ${draft.actDate}`,
    })),
    ...objectDocuments.map((document) => ({
      date: document.documentDate,
      id: `object-document-${document.id}`,
      name: document.title,
      number: document.reference,
      section: 'Документы объекта',
      details: `Тип документа: ${document.type}`,
    })),
    ...certificates.map((certificate) => ({
      date: certificate.issuedAt,
      id: `certificate-${certificate.id}`,
      name: `${certificate.documentType}. ${getCertificateMaterialNames(certificate).join('; ')}`,
      number: certificate.documentNumber,
      section: 'Сертификаты',
      details: `Состояние документа качества: ${certificate.status}`,
    })),
  ];
}

function getRegistrySummary(rows: readonly RegistryRow[]): RegistrySummary {
  return {
    aosr: countRowsBySection(rows, aosrActType.registrySectionName),
    certificates: countRowsBySection(rows, 'Сертификаты'),
    documents: countRowsBySection(rows, 'Документы объекта'),
    total: rows.length,
  };
}

function countRowsBySection(rows: readonly RegistryRow[], section: string): number {
  return rows.filter((row) => row.section === section).length;
}

function filterRegistryRows(
  rows: readonly RegistryRow[],
  activeFilter: RegistryFilter,
): readonly RegistryRow[] {
  const filter = registryFilters.find((option) => option.id === activeFilter);

  if (filter?.section === undefined) {
    return rows;
  }

  return rows.filter((row) => row.section === filter.section);
}
