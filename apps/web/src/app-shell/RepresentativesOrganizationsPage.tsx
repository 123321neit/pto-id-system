import { type SyntheticEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { type DemoRepresentative, useDemoStore } from '../demo-store/demo-store.js';

interface RepresentativesOrganizationsPageProps {
  readonly backLabel?: string;
  readonly description?: string;
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
  backLabel = 'Вернуться к объектам',
  description = 'Глобальные библиотеки организаций и представителей. Из поиска создавайте или выбирайте карточку, затем назначайте ее объекту и акту.',
}: RepresentativesOrganizationsPageProps): React.JSX.Element {
  const {
    addOrganization: addOrganizationToStore,
    addRepresentative: addRepresentativeToStore,
    organizations,
    representatives,
  } = useDemoStore();
  const [librarySearch, setLibrarySearch] = useState('');
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [representativeSearch, setRepresentativeSearch] = useState('');
  const [isOrganizationFormOpen, setOrganizationFormOpen] = useState(false);
  const [isRepresentativeFormOpen, setRepresentativeFormOpen] = useState(false);
  const [organizationForm, setOrganizationForm] =
    useState<OrganizationFormState>(emptyOrganizationForm);
  const [representativeForm, setRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);

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

    addOrganizationToStore({
      details: organizationForm.details.trim(),
      name: organizationForm.name.trim(),
      usageNote: organizationForm.usageNote.trim(),
    });

    setOrganizationForm(emptyOrganizationForm);
    setOrganizationFormOpen(false);
  };

  const addRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    addRepresentativeToStore({
      authorityBasis: representativeForm.authorityBasis.trim(),
      fullName: representativeForm.fullName.trim(),
      nrsDetails: representativeForm.nrsDetails.trim(),
      organization: representativeForm.organization.trim(),
      position: representativeForm.position.trim(),
      roleLabel: representativeForm.roleLabel.trim(),
    });

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
            <p>{description}</p>
          </div>
          <Link className="secondary-action" to="/objects">
            {backLabel}
          </Link>
        </header>

        <ol
          className="workflow-flow workflow-flow--secondary"
          aria-label="Порядок работы с подписантами"
        >
          <WorkflowStep index="1" title="Добавьте организацию" />
          <WorkflowStep index="2" title="Добавьте представителя" />
          <WorkflowStep index="3" title="Назначьте на объект" />
          <WorkflowStep index="4" title="Выберите в акт" />
        </ol>

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
                    onChange={(event) => {
                      updateOrganizationForm('name', event.currentTarget.value);
                    }}
                    value={organizationForm.name}
                  />
                </label>
                <label>
                  ИНН / ОГРН / реквизиты
                  <textarea
                    onChange={(event) => {
                      updateOrganizationForm('details', event.currentTarget.value);
                    }}
                    value={organizationForm.details}
                  />
                </label>
                <label>
                  Где используется
                  <textarea
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
                    onChange={(event) => {
                      updateRepresentativeForm('fullName', event.currentTarget.value);
                    }}
                    value={representativeForm.fullName}
                  />
                </label>
                <label>
                  Базовая роль / подпись
                  <input
                    onChange={(event) => {
                      updateRepresentativeForm('roleLabel', event.currentTarget.value);
                    }}
                    value={representativeForm.roleLabel}
                  />
                </label>
                <label>
                  Базовая должность
                  <input
                    onChange={(event) => {
                      updateRepresentativeForm('position', event.currentTarget.value);
                    }}
                    value={representativeForm.position}
                  />
                </label>
                <label>
                  Базовая организация
                  <input
                    onChange={(event) => {
                      updateRepresentativeForm('organization', event.currentTarget.value);
                    }}
                    value={representativeForm.organization}
                  />
                </label>
                <label>
                  Основание полномочий
                  <textarea
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
                      <small>{formatNrsDetails(representative)}</small>
                    )}
                  </li>
                ))
              ) : (
                <li className="empty-state">Представители по такому запросу не найдены.</li>
              )}
            </ul>

            <ConceptNote title="Представители в объекте">
              Представителя переиспользуют из глобальной библиотеки. На объекте отдельно
              редактируются роль, должность, порядок подписи, организация и основание полномочий.
              Акт выбирает назначение и хранит печатный снимок.
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

function matchesSearch(values: readonly string[], ...searches: readonly string[]): boolean {
  return searches.every((search) => {
    const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

    if (normalizedSearch === '') {
      return true;
    }

    return values.some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch));
  });
}

function formatNrsDetails(representative: DemoRepresentative): string {
  const nrsDetails = representative.nrsDetails ?? '';

  return nrsDetails.startsWith('НРС ') ? nrsDetails : `НРС ${nrsDetails}`;
}
