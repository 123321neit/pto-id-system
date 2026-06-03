import { type SyntheticEvent, useState } from 'react';

interface CertificateLibraryPageProps {
  readonly onBackToObjects: () => void;
}

type CertificateStatus = 'Действует' | 'Истекает' | 'Требует проверки';

interface MockCertificate {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly manufacturer: string;
  readonly material: string;
  readonly status: CertificateStatus;
  readonly validUntil: string;
}

interface CertificateFormState {
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly manufacturer: string;
  readonly material: string;
  readonly status: CertificateStatus;
  readonly validUntil: string;
}

const certificateStatuses: readonly CertificateStatus[] = [
  'Действует',
  'Истекает',
  'Требует проверки',
];

const initialCertificates: readonly MockCertificate[] = [
  {
    documentNumber: 'СТ-ОВ-2026-017',
    documentType: 'Сертификат соответствия',
    id: 'library-certificate-ducts',
    issuedAt: '12.05.2026',
    issuer: 'ООО "Эксперт-С"',
    manufacturer: 'ООО "ВентПрофиль"',
    material: 'Воздуховоды оцинкованные 0,7 мм',
    status: 'Действует',
    validUntil: '11.05.2029',
  },
  {
    documentNumber: 'ДС-ИЗ-2026-04',
    documentType: 'Декларация о соответствии',
    id: 'library-certificate-insulation',
    issuedAt: '20.05.2026',
    issuer: 'Реестр деклараций ЕАЭС',
    manufacturer: 'АО "ТеплоМат"',
    material: 'Теплоизоляционные маты ИЗ-50',
    status: 'Действует',
    validUntil: '19.05.2027',
  },
  {
    documentNumber: 'ПП-ОГН-22',
    documentType: 'Паспорт партии',
    id: 'library-certificate-firestop',
    issuedAt: '21.05.2026',
    issuer: 'Лаборатория входного контроля',
    manufacturer: 'ООО "ОгнеСтоп"',
    material: 'Противопожарный состав для проходок',
    status: 'Истекает',
    validUntil: '31.12.2026',
  },
  {
    documentNumber: 'ПС-КМ-48',
    documentType: 'Паспорт качества',
    id: 'library-certificate-fasteners',
    issuedAt: '18.05.2026',
    issuer: 'Заводская служба качества',
    manufacturer: 'ООО "Крепеж Комплект"',
    material: 'Крепежные элементы КМ-12',
    status: 'Требует проверки',
    validUntil: 'Проверить по партии',
  },
];

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
  const [certificates, setCertificates] = useState<readonly MockCertificate[]>(initialCertificates);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CertificateStatus>('all');
  const [isFormOpen, setFormOpen] = useState(false);
  const [certificateForm, setCertificateForm] =
    useState<CertificateFormState>(emptyCertificateForm);
  const [createdCertificateCount, setCreatedCertificateCount] = useState(1);

  const filteredCertificates = certificates.filter((certificate) =>
    matchesCertificate(certificate, search, statusFilter),
  );

  const addCertificate = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const certificate: MockCertificate = {
      documentNumber: certificateForm.documentNumber.trim(),
      documentType: certificateForm.documentType.trim(),
      id: `library-certificate-created-${String(createdCertificateCount)}`,
      issuedAt: certificateForm.issuedAt.trim(),
      issuer: certificateForm.issuer.trim(),
      manufacturer: certificateForm.manufacturer.trim(),
      material: certificateForm.material.trim(),
      status: certificateForm.status,
      validUntil: certificateForm.validUntil.trim(),
    };

    setCertificates((currentCertificates) => [certificate, ...currentCertificates]);
    setCreatedCertificateCount((currentCount) => currentCount + 1);
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
          <WorkflowStep index="4" title="Сертификат попадет в акт автоматически" />
        </ol>

        <aside className="demo-separation-note" aria-label="Демо-примечание">
          Сейчас библиотека сертификатов и редактор акта используют отдельные mock-данные. На
          следующем этапе они будут объединены.
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
                {certificateStatuses.map((status) => (
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
                  {certificateStatuses.map((status) => (
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
                    <strong>{certificate.material}</strong>
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
            <li>Сертификаты хранятся в библиотеке.</li>
            <li>Объект использует сертификаты из библиотеки.</li>
            <li>Акт выбирает материалы через поиск.</li>
            <li>Приложения формируются автоматически.</li>
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
  certificate: MockCertificate,
  search: string,
  statusFilter: 'all' | CertificateStatus,
): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');
  const matchesSearch =
    normalizedSearch === '' ||
    [
      certificate.material,
      certificate.documentNumber,
      certificate.documentType,
      certificate.manufacturer,
      certificate.issuer,
    ].some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch));

  const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function toStatusFilter(value: string): 'all' | CertificateStatus {
  if (value === 'all') {
    return value;
  }

  return toCertificateStatus(value);
}

function toCertificateStatus(value: string): CertificateStatus {
  if (certificateStatuses.includes(value as CertificateStatus)) {
    return value as CertificateStatus;
  }

  return 'Действует';
}

function getStatusClass(status: CertificateStatus): string {
  switch (status) {
    case 'Действует':
      return 'certificate-status--valid';
    case 'Истекает':
      return 'certificate-status--expiring';
    case 'Требует проверки':
      return 'certificate-status--review';
  }
}
