import { type SyntheticEvent, useState } from 'react';

interface RepresentativesOrganizationsPageProps {
  readonly onBackToObjects: () => void;
}

interface MockManagementOrganization {
  readonly id: string;
  readonly name: string;
  readonly details: string;
  readonly usageNote: string;
}

interface MockManagementRepresentative {
  readonly id: string;
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly nrsDetails?: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

interface OrganizationFormState {
  readonly details: string;
  readonly name: string;
  readonly usageNote: string;
}

interface RepresentativeFormState {
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly nrsDetails: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

const initialOrganizations: readonly MockManagementOrganization[] = [
  {
    details:
      'ИНН 6670000000; ОГРН 1026600000000; 620000, г. Екатеринбург, ул. Демонстрационная, 10.',
    id: 'management-organization-customer',
    name: 'ГАУЗ СО "Демо-заказчик"',
    usageNote: 'Используется как заказчик в объекте "Реконструкция поликлиники".',
  },
  {
    details: 'ИНН 6670490954; ОГРН 1206600007877; СРО АСРО "Гильдия строителей".',
    id: 'management-organization-contractor',
    name: 'ООО "ПТО Монтаж"',
    usageNote: 'Подрядчик в текущих АОСР и шапке объекта.',
  },
  {
    details: 'ИНН 6678044711; ОГРН 1146678008509; СРО проектировщиков N П-140-27022010.',
    id: 'management-organization-designer',
    name: 'АО "Проектный институт"',
    usageNote: 'Проектная организация и авторский надзор.',
  },
  {
    details: 'ИНН 6671000001; ОГРН 1096600000001; договор генподряда N ГП-1.',
    id: 'management-organization-general-contractor',
    name: 'ООО "Демо-генподряд"',
    usageNote: 'Может быть добавлен в объект отдельным пользовательским блоком.',
  },
];

const initialRepresentatives: readonly MockManagementRepresentative[] = [
  {
    authorityBasis: 'Приказ N 12-П от 10.05.2026',
    fullName: 'Иванов И.И.',
    id: 'management-representative-contractor',
    organization: 'ООО "ПТО Монтаж"',
    position: 'Производитель работ',
    roleLabel: 'Представитель подрядчика',
  },
  {
    authorityBasis: 'Договор строительного контроля N СК-7',
    fullName: 'Петров П.П.',
    id: 'management-representative-control',
    nrsDetails: 'НРС С-66-212868',
    organization: 'ООО "СтройКонтроль"',
    position: 'Ведущий инженер строительного контроля',
    roleLabel: 'Стройконтроль',
  },
  {
    authorityBasis: 'Доверенность N З-44 от 01.05.2026',
    fullName: 'Кузнецова А.А.',
    id: 'management-representative-customer',
    organization: 'ГАУЗ СО "Демо-заказчик"',
    position: 'Руководитель проекта',
    roleLabel: 'Представитель заказчика',
  },
  {
    authorityBasis: 'Приказ N ЛК-9 от 12.05.2026',
    fullName: 'Лебедев Л.Л.',
    id: 'management-representative-laboratory',
    organization: 'ООО "Лаборатория контроля"',
    position: 'Инженер лаборатории',
    roleLabel: 'Представитель лаборатории',
  },
];

const emptyOrganizationForm: OrganizationFormState = {
  details: '',
  name: '',
  usageNote: '',
};

const emptyRepresentativeForm: RepresentativeFormState = {
  authorityBasis: '',
  fullName: '',
  nrsDetails: '',
  organization: '',
  position: '',
  roleLabel: '',
};

export function RepresentativesOrganizationsPage({
  onBackToObjects,
}: RepresentativesOrganizationsPageProps): React.JSX.Element {
  const [organizations, setOrganizations] =
    useState<readonly MockManagementOrganization[]>(initialOrganizations);
  const [representatives, setRepresentatives] =
    useState<readonly MockManagementRepresentative[]>(initialRepresentatives);
  const [librarySearch, setLibrarySearch] = useState('');
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [representativeSearch, setRepresentativeSearch] = useState('');
  const [isOrganizationFormOpen, setOrganizationFormOpen] = useState(false);
  const [isRepresentativeFormOpen, setRepresentativeFormOpen] = useState(false);
  const [organizationForm, setOrganizationForm] =
    useState<OrganizationFormState>(emptyOrganizationForm);
  const [representativeForm, setRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);
  const [createdOrganizationCount, setCreatedOrganizationCount] = useState(1);
  const [createdRepresentativeCount, setCreatedRepresentativeCount] = useState(1);

  const filteredOrganizations = organizations.filter((organization) =>
    matchesSearch(
      [organization.name, organization.details, organization.usageNote],
      librarySearch,
      organizationSearch,
    ),
  );
  const filteredRepresentatives = representatives.filter((representative) =>
    matchesSearch(
      [
        representative.fullName,
        representative.roleLabel,
        representative.position,
        representative.organization,
        representative.authorityBasis,
        representative.nrsDetails ?? '',
      ],
      librarySearch,
      representativeSearch,
    ),
  );

  const addOrganization = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const organization: MockManagementOrganization = {
      details: organizationForm.details.trim(),
      id: `management-organization-created-${String(createdOrganizationCount)}`,
      name: organizationForm.name.trim(),
      usageNote: organizationForm.usageNote.trim(),
    };

    setOrganizations((currentOrganizations) => [...currentOrganizations, organization]);
    setCreatedOrganizationCount((currentCount) => currentCount + 1);
    setOrganizationForm(emptyOrganizationForm);
    setOrganizationFormOpen(false);
  };

  const addRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nrsDetails = representativeForm.nrsDetails.trim();
    const representative: MockManagementRepresentative = {
      authorityBasis: representativeForm.authorityBasis.trim(),
      fullName: representativeForm.fullName.trim(),
      id: `management-representative-created-${String(createdRepresentativeCount)}`,
      organization: representativeForm.organization.trim(),
      position: representativeForm.position.trim(),
      roleLabel: representativeForm.roleLabel.trim(),
      ...(nrsDetails === '' ? {} : { nrsDetails }),
    };

    setRepresentatives((currentRepresentatives) => [...currentRepresentatives, representative]);
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);
    setRepresentativeForm(emptyRepresentativeForm);
    setRepresentativeFormOpen(false);
  };

  return (
    <section className="dashboard-page management-page" aria-labelledby="management-page-title">
      <div className="dashboard-content management-content">
        <header className="dashboard-hero management-hero">
          <div>
            <p className="section-kicker">Макет раздела</p>
            <h1 id="management-page-title">Представители и организации</h1>
            <p>
              Сначала сохраните организации и представителей, потом добавляйте их в объект и акты
              через поиск.
            </p>
          </div>
          <button className="secondary-action" onClick={onBackToObjects} type="button">
            Вернуться к объектам
          </button>
        </header>

        <label className="dashboard-search management-search">
          Поиск по организациям и представителям
          <input
            aria-label="Поиск по организациям и представителям"
            onChange={(event) => {
              setLibrarySearch(event.currentTarget.value);
            }}
            placeholder="ФИО, организация, роль, ИНН или основание"
            value={librarySearch}
          />
        </label>

        <div className="management-grid">
          <section className="management-card" aria-labelledby="organizations-section-title">
            <div className="management-card__header">
              <div>
                <p className="section-kicker">Глобальная библиотека</p>
                <h2 id="organizations-section-title">Организации</h2>
              </div>
              <button
                className="primary-action"
                onClick={() => {
                  setOrganizationFormOpen((isOpen) => !isOpen);
                }}
                type="button"
              >
                Добавить организацию
              </button>
            </div>

            <label className="search-field">
              Фильтр организаций
              <input
                aria-label="Фильтр организаций"
                onChange={(event) => {
                  setOrganizationSearch(event.currentTarget.value);
                }}
                placeholder="Название, ИНН, ОГРН или объект"
                value={organizationSearch}
              />
            </label>

            {isOrganizationFormOpen ? (
              <form className="management-form" onSubmit={addOrganization}>
                <label>
                  Название организации
                  <input
                    required
                    onChange={(event) => {
                      updateOrganizationForm('name', event.currentTarget.value);
                    }}
                    value={organizationForm.name}
                  />
                </label>
                <label>
                  ИНН / ОГРН / реквизиты
                  <textarea
                    required
                    onChange={(event) => {
                      updateOrganizationForm('details', event.currentTarget.value);
                    }}
                    value={organizationForm.details}
                  />
                </label>
                <label>
                  Где используется
                  <textarea
                    required
                    onChange={(event) => {
                      updateOrganizationForm('usageNote', event.currentTarget.value);
                    }}
                    value={organizationForm.usageNote}
                  />
                </label>
                <button className="primary-action" type="submit">
                  Сохранить организацию
                </button>
              </form>
            ) : null}

            <ul className="management-list" aria-label="Глобальная библиотека организаций">
              {filteredOrganizations.length > 0 ? (
                filteredOrganizations.map((organization) => (
                  <li className="management-list__item" key={organization.id}>
                    <strong>{organization.name}</strong>
                    <span>{organization.details}</span>
                    <small>{organization.usageNote}</small>
                  </li>
                ))
              ) : (
                <li className="empty-state">Организации по такому запросу не найдены.</li>
              )}
            </ul>

            <ConceptNote title="Организации в объекте">
              В объект можно добавить организацию из глобальной библиотеки, а затем изменить
              объектовые реквизиты, название блока, договор или СРО. Эти детали становятся отдельной
              привязкой/снимком объекта и не переписывают глобальную карточку.
            </ConceptNote>
          </section>

          <section className="management-card" aria-labelledby="representatives-section-title">
            <div className="management-card__header">
              <div>
                <p className="section-kicker">Глобальная библиотека</p>
                <h2 id="representatives-section-title">Представители</h2>
              </div>
              <button
                className="primary-action"
                onClick={() => {
                  setRepresentativeFormOpen((isOpen) => !isOpen);
                }}
                type="button"
              >
                Добавить представителя
              </button>
            </div>

            <label className="search-field">
              Фильтр представителей
              <input
                aria-label="Фильтр представителей"
                onChange={(event) => {
                  setRepresentativeSearch(event.currentTarget.value);
                }}
                placeholder="ФИО, роль, организация или основание"
                value={representativeSearch}
              />
            </label>

            {isRepresentativeFormOpen ? (
              <form
                className="management-form management-form--representative"
                onSubmit={addRepresentative}
              >
                <label>
                  ФИО представителя
                  <input
                    required
                    onChange={(event) => {
                      updateRepresentativeForm('fullName', event.currentTarget.value);
                    }}
                    value={representativeForm.fullName}
                  />
                </label>
                <label>
                  Роль / подпись
                  <input
                    required
                    onChange={(event) => {
                      updateRepresentativeForm('roleLabel', event.currentTarget.value);
                    }}
                    value={representativeForm.roleLabel}
                  />
                </label>
                <label>
                  Должность
                  <input
                    required
                    onChange={(event) => {
                      updateRepresentativeForm('position', event.currentTarget.value);
                    }}
                    value={representativeForm.position}
                  />
                </label>
                <label>
                  Организация представителя
                  <input
                    required
                    onChange={(event) => {
                      updateRepresentativeForm('organization', event.currentTarget.value);
                    }}
                    value={representativeForm.organization}
                  />
                </label>
                <label>
                  Основание полномочий
                  <textarea
                    required
                    onChange={(event) => {
                      updateRepresentativeForm('authorityBasis', event.currentTarget.value);
                    }}
                    value={representativeForm.authorityBasis}
                  />
                </label>
                <label>
                  НРС / детали
                  <input
                    onChange={(event) => {
                      updateRepresentativeForm('nrsDetails', event.currentTarget.value);
                    }}
                    value={representativeForm.nrsDetails}
                  />
                </label>
                <button className="primary-action" type="submit">
                  Сохранить представителя
                </button>
              </form>
            ) : null}

            <ul className="management-list" aria-label="Глобальная библиотека представителей">
              {filteredRepresentatives.length > 0 ? (
                filteredRepresentatives.map((representative) => (
                  <li className="management-list__item" key={representative.id}>
                    <strong>{representative.fullName}</strong>
                    <span>
                      {representative.roleLabel} / {representative.position}
                    </span>
                    <span>{representative.organization}</span>
                    <small>{representative.authorityBasis}</small>
                    {representative.nrsDetails === undefined ? null : (
                      <small>{representative.nrsDetails}</small>
                    )}
                  </li>
                ))
              ) : (
                <li className="empty-state">Представители по такому запросу не найдены.</li>
              )}
            </ul>

            <ConceptNote title="Представители в объекте">
              Представителя можно переиспользовать из библиотеки. В объекте отдельно редактируются
              роль, порядок подписи и основание полномочий. Если человек нужен только для одного
              акта, его можно добавить временно внутри этого акта без сохранения в объектовую базу.
            </ConceptNote>
          </section>
        </div>
      </div>
    </section>
  );

  function updateOrganizationForm(field: keyof OrganizationFormState, value: string): void {
    setOrganizationForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updateRepresentativeForm(field: keyof RepresentativeFormState, value: string): void {
    setRepresentativeForm((currentForm) => ({ ...currentForm, [field]: value }));
  }
}

interface ConceptNoteProps {
  readonly children: string;
  readonly title: string;
}

function ConceptNote({ children, title }: ConceptNoteProps): React.JSX.Element {
  return (
    <aside className="concept-note">
      <h3>{title}</h3>
      <p>{children}</p>
    </aside>
  );
}

function matchesSearch(values: readonly string[], ...searches: readonly string[]): boolean {
  return searches.every((search) => {
    const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

    if (normalizedSearch === '') {
      return true;
    }

    return values.some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch));
  });
}
