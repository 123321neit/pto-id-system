import { type SyntheticEvent, useState } from 'react';

import {
  demoCertificateStatuses,
  getCertificateMaterialNames,
  type DemoCertificate,
  type DemoCertificateStatus,
  useDemoStore,
} from '../demo-store/demo-store.js';
import { CertificateMaterialsList } from './CertificateMaterialsList.js';

interface CertificateLibraryPageProps {
  readonly onBackToObjects: () => void;
}

interface CertificateFormState {
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly manufacturer: string;
  readonly material: string;
  readonly status: DemoCertificateStatus;
  readonly validUntil: string;
}

const emptyCertificateForm: CertificateFormState = {
  documentNumber: '',
  documentType: '',
  issuedAt: '',
  issuer: '',
  manufacturer: '',
  material: '',
  status: 'Действует',
  validUntil: '',
};

export function CertificateLibraryPage({
  onBackToObjects,
}: CertificateLibraryPageProps): React.JSX.Element {
  const { addCertificate: addCertificateToStore, certificates } = useDemoStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DemoCertificateStatus>('all');
  const [isFormOpen, setFormOpen] = useState(false);
  const [certificateForm, setCertificateForm] =
    useState<CertificateFormState>(emptyCertificateForm);

  const filteredCertificates = certificates.filter((certificate) =>
    matchesCertificate(certificate, search, statusFilter),
  );

  const addCertificate = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    addCertificateToStore({
      documentNumber: certificateForm.documentNumber.trim(),
      documentType: certificateForm.documentType.trim(),
      issuedAt: certificateForm.issuedAt.trim(),
      issuer: certificateForm.issuer.trim(),
      manufacturer: certificateForm.manufacturer.trim(),
      materialName: certificateForm.material.trim(),
      status: certificateForm.status,
      validUntil: certificateForm.validUntil.trim(),
    });

    setCertificateForm(emptyCertificateForm);
    setFormOpen(false);
  };

  return (
    <section className="dashboard-page certificate-page" aria-labelledby="certificate-page-title">
      <div className="dashboard-content certificate-content">
        <header className="dashboard-hero certificate-hero">
          <div>
            <p className="section-kicker">Макет раздела</p>
            <h1 id="certificate-page-title">Библиотека сертификатов</h1>
            <p>
              Сначала сохраните сертификаты и материалы. Потом добавляйте их в акты через поиск
              материалов.
            </p>
          </div>
          <button className="secondary-action" onClick={onBackToObjects} type="button">
            Вернуться к объектам
          </button>
        </header>

        <ol className="workflow-flow" aria-label="Порядок работы с сертификатами">
          <WorkflowStep index="1" title="Добавьте сертификат" />
          <WorkflowStep index="2" title="Откройте акт" />
          <WorkflowStep index="3" title="Найдите материал" />
          <WorkflowStep index="4" title="Сертификат появится в приложениях" />
        </ol>

        <aside className="demo-separation-note" aria-label="Демо-примечание">
          Библиотека сертификатов и поиск материалов в АОСР используют один frontend mock-store.
          Сертификат уже хранит список материалов, чтобы один документ качества мог относиться к
          нескольким позициям.
        </aside>

        <section className="certificate-library-panel" aria-labelledby="certificate-list-title">
          <div className="certificate-library-panel__header">
            <div>
              <p className="section-kicker">Список документов качества</p>
              <h2 id="certificate-list-title">Сертификаты и материалы</h2>
            </div>
            <button
              className="primary-action"
              onClick={() => {
                setFormOpen((isOpen) => !isOpen);
              }}
              type="button"
            >
              Добавить сертификат
            </button>
          </div>

          <div className="certificate-toolbar" aria-label="Поиск и фильтр сертификатов">
            <label className="dashboard-search certificate-search">
              Поиск по библиотеке
              <input
                aria-label="Поиск по библиотеке сертификатов"
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                placeholder="Материал, номер, тип, производитель или источник"
                value={search}
              />
            </label>

            <label className="status-filter">
              Статус
              <select
                aria-label="Фильтр по статусу сертификата"
                onChange={(event) => {
                  setStatusFilter(toStatusFilter(event.currentTarget.value));
                }}
                value={statusFilter}
              >
                <option value="all">Все статусы</option>
                {demoCertificateStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isFormOpen ? (
            <form className="certificate-form" onSubmit={addCertificate}>
              <label>
                Материал
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('material', event.currentTarget.value);
                  }}
                  value={certificateForm.material}
                />
              </label>
              <label>
                Тип документа
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('documentType', event.currentTarget.value);
                  }}
                  value={certificateForm.documentType}
                />
              </label>
              <label>
                Номер
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('documentNumber', event.currentTarget.value);
                  }}
                  value={certificateForm.documentNumber}
                />
              </label>
              <label>
                Дата выдачи
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('issuedAt', event.currentTarget.value);
                  }}
                  value={certificateForm.issuedAt}
                />
              </label>
              <label>
                Действует до
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('validUntil', event.currentTarget.value);
                  }}
                  value={certificateForm.validUntil}
                />
              </label>
              <label>
                Производитель
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('manufacturer', event.currentTarget.value);
                  }}
                  value={certificateForm.manufacturer}
                />
              </label>
              <label>
                Орган сертификации
                <input
                  required
                  onChange={(event) => {
                    updateCertificateForm('issuer', event.currentTarget.value);
                  }}
                  value={certificateForm.issuer}
                />
              </label>
              <label>
                Статус
                <select
                  aria-label="Статус нового сертификата"
                  onChange={(event) => {
                    updateCertificateForm('status', toCertificateStatus(event.currentTarget.value));
                  }}
                  value={certificateForm.status}
                >
                  {demoCertificateStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <p className="upload-placeholder">Загрузка PDF и сканов будет реализована позже.</p>
              <button className="primary-action" type="submit">
                Сохранить сертификат
              </button>
            </form>
          ) : null}

          <ul className="certificate-list" aria-label="Список сертификатов">
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((certificate) => (
                <li className="certificate-list__item" key={certificate.id}>
                  <div className="certificate-list__main">
                    <CertificateMaterialsList certificate={certificate} />
                    <span>
                      {certificate.documentType} / {certificate.documentNumber}
                    </span>
                  </div>
                  <dl className="certificate-meta">
                    <div>
                      <dt>Дата выдачи</dt>
                      <dd>{certificate.issuedAt}</dd>
                    </div>
                    <div>
                      <dt>Действует до</dt>
                      <dd>{certificate.validUntil}</dd>
                    </div>
                    <div>
                      <dt>Производитель</dt>
                      <dd>{certificate.manufacturer}</dd>
                    </div>
                    <div>
                      <dt>Орган / источник</dt>
                      <dd>{certificate.issuer}</dd>
                    </div>
                  </dl>
                  <span className={`certificate-status ${getStatusClass(certificate.status)}`}>
                    {certificate.status}
                  </span>
                </li>
              ))
            ) : (
              <li className="empty-state">Сертификаты по такому запросу не найдены.</li>
            )}
          </ul>
        </section>

        <section className="future-workflow" aria-labelledby="future-workflow-title">
          <div>
            <p className="section-kicker">Следующий шаг</p>
            <h2 id="future-workflow-title">Как это будет работать</h2>
          </div>
          <ul>
            <li>Сертификаты хранятся в глобальной библиотеке.</li>
            <li>Объект не хранит отдельную библиотеку сертификатов.</li>
            <li>Акт выбирает материалы и сертификаты через поиск.</li>
            <li>Инженер включает приложения чекбоксами.</li>
          </ul>
        </section>
      </div>
    </section>
  );

  function updateCertificateForm<TField extends keyof CertificateFormState>(
    field: TField,
    value: CertificateFormState[TField],
  ): void {
    setCertificateForm((currentForm) => ({ ...currentForm, [field]: value }));
  }
}

interface WorkflowStepProps {
  readonly index: string;
  readonly title: string;
}

function WorkflowStep({ index, title }: WorkflowStepProps): React.JSX.Element {
  return (
    <li className="workflow-step">
      <span className="workflow-step__index">{index}</span>
      <span>{title}</span>
    </li>
  );
}

function matchesCertificate(
  certificate: DemoCertificate,
  search: string,
  statusFilter: 'all' | DemoCertificateStatus,
): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');
  const matchesSearch =
    normalizedSearch === '' ||
    [
      ...getCertificateMaterialNames(certificate),
      certificate.documentNumber,
      certificate.documentType,
      certificate.manufacturer,
      certificate.issuer,
    ].some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch));

  const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function toStatusFilter(value: string): 'all' | DemoCertificateStatus {
  if (value === 'all') {
    return value;
  }

  return toCertificateStatus(value);
}

function toCertificateStatus(value: string): DemoCertificateStatus {
  if (demoCertificateStatuses.includes(value as DemoCertificateStatus)) {
    return value as DemoCertificateStatus;
  }

  return 'Действует';
}

function getStatusClass(status: DemoCertificateStatus): string {
  switch (status) {
    case 'Действует':
      return 'certificate-status--valid';
    case 'Истекает':
      return 'certificate-status--expiring';
    case 'Требует проверки':
      return 'certificate-status--review';
  }
}
