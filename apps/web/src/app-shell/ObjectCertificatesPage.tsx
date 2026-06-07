import { useMemo, useState, type SyntheticEvent } from 'react';

import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getCertificateMaterialNames,
  type DemoCertificate,
  useDemoStore,
} from '../demo-store/demo-store.js';

type ObjectCertificateFilter = 'all' | 'certificates' | 'passports' | 'declarations' | 'other';
type CertificateDocumentCategory = 'certificate' | 'passport' | 'declaration' | 'other';

interface ObjectCertificateFilterOption {
  readonly category?: CertificateDocumentCategory;
  readonly id: ObjectCertificateFilter;
  readonly label: string;
}

interface ObjectCertificateFormState {
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly materialName: string;
}

interface ObjectCertificateSummary {
  readonly certificates: number;
  readonly declarations: number;
  readonly passports: number;
  readonly total: number;
}

const objectCertificateFilters: readonly ObjectCertificateFilterOption[] = [
  { id: 'all', label: 'Все' },
  { category: 'certificate', id: 'certificates', label: 'Сертификаты' },
  { category: 'passport', id: 'passports', label: 'Паспорта' },
  { category: 'declaration', id: 'declarations', label: 'Декларации' },
  { category: 'other', id: 'other', label: 'Прочее' },
];

const objectCertificateDocumentTypes: readonly string[] = [
  'Сертификат соответствия',
  'Паспорт качества',
  'Декларация о соответствии',
  'Прочий документ качества',
];

const emptyCertificateForm: ObjectCertificateFormState = {
  documentNumber: '',
  documentType: 'Сертификат соответствия',
  issuedAt: '',
  issuer: '',
  materialName: '',
};

export function ObjectCertificatesPage(): React.JSX.Element {
  const { addCertificate, certificates } = useDemoStore();
  const [activeFilter, setActiveFilter] = useState<ObjectCertificateFilter>('all');
  const [certificateForm, setCertificateForm] =
    useState<ObjectCertificateFormState>(emptyCertificateForm);
  const usageByCertificateId = useMemo(
    () => getObjectCertificateUsageCounts(certificates, demoAosrWorkspace.drafts),
    [certificates],
  );
  const summary = getObjectCertificateSummary(certificates);
  const filteredCertificates = filterObjectCertificates(certificates, activeFilter);
  const isCertificateFormReady =
    certificateForm.materialName.trim() !== '' &&
    certificateForm.documentNumber.trim() !== '' &&
    certificateForm.documentType.trim() !== '' &&
    certificateForm.issuer.trim() !== '' &&
    certificateForm.issuedAt.trim() !== '';

  const updateCertificateForm = (field: keyof ObjectCertificateFormState, value: string): void => {
    setCertificateForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const addObjectCertificate = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!isCertificateFormReady) {
      return;
    }

    addCertificate({
      documentNumber: certificateForm.documentNumber.trim(),
      documentType: certificateForm.documentType.trim(),
      issuedAt: certificateForm.issuedAt.trim(),
      issuer: certificateForm.issuer.trim(),
      manufacturer: 'Не указан в демо-форме объекта',
      materialName: certificateForm.materialName.trim(),
      status: 'Требует проверки',
      validUntil: 'Не задано',
    });
    setCertificateForm(emptyCertificateForm);
  };

  return (
    <section
      className="object-documents-workspace object-certificates-workspace"
      aria-labelledby="object-certificates-title"
    >
      <header className="object-documents-hero object-certificates-hero">
        <div>
          <p className="section-kicker">Реестр документов качества объекта</p>
          <h2 id="object-certificates-title">Сертификаты объекта</h2>
          <p>
            Сертификаты, паспорта качества, декларации и другие документы на материалы и
            оборудование объекта.
          </p>
        </div>
      </header>

      <dl className="object-documents-summary" aria-label="Сводка сертификатов объекта">
        <SummaryItem label="Всего документов качества" value={summary.total} />
        <SummaryItem label="Сертификаты" value={summary.certificates} />
        <SummaryItem label="Паспорта" value={summary.passports} />
        <SummaryItem label="Декларации" value={summary.declarations} />
      </dl>

      <section className="object-documents-panel" aria-labelledby="object-certificates-list-title">
        <div className="object-documents-panel__header">
          <div>
            <p className="section-kicker">Список</p>
            <h3 id="object-certificates-list-title">Документы качества</h3>
          </div>
          <div className="object-documents-filters" aria-label="Фильтры сертификатов объекта">
            {objectCertificateFilters.map((filter) => (
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
          <table className="object-documents-table object-certificates-table">
            <thead>
              <tr>
                <th scope="col">Материал / оборудование</th>
                <th scope="col">Документ</th>
                <th scope="col">Номер</th>
                <th scope="col">Кем выдан</th>
                <th scope="col">Используется в актах</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((certificate) => {
                  const usageCount = usageByCertificateId.get(certificate.id) ?? 0;

                  return (
                    <tr key={certificate.id}>
                      <td>
                        <strong>{getCertificateMaterialNames(certificate).join('; ')}</strong>
                      </td>
                      <td>
                        <strong>{certificate.documentType}</strong>
                        <small>от {certificate.issuedAt}</small>
                      </td>
                      <td>{certificate.documentNumber}</td>
                      <td>{certificate.issuer}</td>
                      <td>Используется в {usageCount} актах</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="empty-state" colSpan={5}>
                    Документы качества по выбранному фильтру не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="object-documents-panel" aria-labelledby="object-certificates-form-title">
        <div className="object-documents-panel__header">
          <div>
            <p className="section-kicker">Новый документ качества</p>
            <h3 id="object-certificates-form-title">Добавление в демо-реестр</h3>
          </div>
        </div>

        <form
          className="object-document-form object-certificate-form"
          onSubmit={addObjectCertificate}
        >
          <label>
            Материал / оборудование
            <input
              onChange={(event) => {
                updateCertificateForm('materialName', event.currentTarget.value);
              }}
              value={certificateForm.materialName}
            />
          </label>
          <label>
            Тип документа
            <select
              onChange={(event) => {
                updateCertificateForm('documentType', event.currentTarget.value);
              }}
              value={certificateForm.documentType}
            >
              {objectCertificateDocumentTypes.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {documentType}
                </option>
              ))}
            </select>
          </label>
          <label>
            Номер документа
            <input
              onChange={(event) => {
                updateCertificateForm('documentNumber', event.currentTarget.value);
              }}
              value={certificateForm.documentNumber}
            />
          </label>
          <label>
            Кем выдан
            <input
              onChange={(event) => {
                updateCertificateForm('issuer', event.currentTarget.value);
              }}
              value={certificateForm.issuer}
            />
          </label>
          <label>
            Дата
            <input
              onChange={(event) => {
                updateCertificateForm('issuedAt', event.currentTarget.value);
              }}
              type="date"
              value={certificateForm.issuedAt}
            />
          </label>
          <button
            className="action-button action-button--primary"
            disabled={!isCertificateFormReady}
            type="submit"
          >
            Добавить сертификат / паспорт
          </button>
        </form>
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

function getObjectCertificateSummary(
  certificates: readonly DemoCertificate[],
): ObjectCertificateSummary {
  return {
    certificates: countCertificatesByCategory(certificates, 'certificate'),
    declarations: countCertificatesByCategory(certificates, 'declaration'),
    passports: countCertificatesByCategory(certificates, 'passport'),
    total: certificates.length,
  };
}

function countCertificatesByCategory(
  certificates: readonly DemoCertificate[],
  category: CertificateDocumentCategory,
): number {
  return certificates.filter(
    (certificate) => getCertificateDocumentCategory(certificate) === category,
  ).length;
}

function filterObjectCertificates(
  certificates: readonly DemoCertificate[],
  activeFilter: ObjectCertificateFilter,
): readonly DemoCertificate[] {
  const filter = objectCertificateFilters.find((option) => option.id === activeFilter);

  if (filter?.category === undefined) {
    return certificates;
  }

  return certificates.filter(
    (certificate) => getCertificateDocumentCategory(certificate) === filter.category,
  );
}

function getCertificateDocumentCategory(certificate: DemoCertificate): CertificateDocumentCategory {
  const documentType = certificate.documentType.toLocaleLowerCase('ru-RU');

  if (documentType.includes('сертификат')) {
    return 'certificate';
  }

  if (documentType.includes('паспорт')) {
    return 'passport';
  }

  if (documentType.includes('деклара')) {
    return 'declaration';
  }

  return 'other';
}

function getObjectCertificateUsageCounts(
  certificates: readonly DemoCertificate[],
  drafts: readonly DemoAosrDraft[],
): ReadonlyMap<string, number> {
  const certificateIdByMaterialId = new Map<string, string>();
  const usageByCertificateId = new Map<string, number>();

  for (const certificate of certificates) {
    for (const material of certificate.materials) {
      certificateIdByMaterialId.set(material.id, certificate.id);
    }
  }

  for (const draft of drafts) {
    const usedCertificateIds = new Set<string>();

    for (const materialCertificateId of draft.materialCertificateIds) {
      const certificateId = certificateIdByMaterialId.get(materialCertificateId);

      if (certificateId !== undefined) {
        usedCertificateIds.add(certificateId);
      }
    }

    for (const certificateId of usedCertificateIds) {
      usageByCertificateId.set(certificateId, (usageByCertificateId.get(certificateId) ?? 0) + 1);
    }
  }

  return usageByCertificateId;
}
