import { useState, type SyntheticEvent } from 'react';

import type { DemoAosrHeaderOrganization, DemoGlobalOrganization } from './demo-aosr-workspace.js';
import type { HeaderOrganizationFormState, MoveDirection } from './demo-aosr-ui.js';

interface DemoHeaderOrganizationsPanelProps {
  readonly form: HeaderOrganizationFormState;
  readonly globalOrganizations: readonly DemoGlobalOrganization[];
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly isFormOpen: boolean;
  readonly organizationSearch: string;
  readonly onChangeForm: (field: keyof HeaderOrganizationFormState, value: string) => void;
  readonly onChangeSearch: (value: string) => void;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onSelectGlobalOrganization: (organization: DemoGlobalOrganization) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onToggleForm: () => void;
  readonly onUpdateHeaderOrganization: (
    headerOrganization: DemoAosrHeaderOrganization,
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ) => void;
}

export function DemoHeaderOrganizationsPanel({
  form,
  globalOrganizations,
  headerOrganizations,
  isFormOpen,
  organizationSearch,
  onChangeForm,
  onChangeSearch,
  onMoveHeaderOrganization,
  onSelectGlobalOrganization,
  onSubmit,
  onToggleForm,
  onUpdateHeaderOrganization,
}: DemoHeaderOrganizationsPanelProps): React.JSX.Element {
  const filteredOrganizations = filterGlobalOrganizations(globalOrganizations, organizationSearch);
  const [editingOrganizationId, setEditingOrganizationId] = useState<string | null>(null);

  return (
    <section className="form-section" aria-labelledby="header-organizations-title">
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="header-organizations-title">Организации в шапке печатного акта</h3>
          <p className="helper-note">
            Выберите организацию из глобальной библиотеки или создайте новую. В шаблоне объекта
            хранится её роль, порядок и печатный текст для актов этого объекта.
          </p>
        </span>
        <button className="compact-toggle" onClick={onToggleForm} type="button">
          {isFormOpen ? 'Свернуть добавление' : 'Добавить блок шапки'}
        </button>
      </div>

      <ol className="compact-card-list" aria-label="Организации в шапке акта">
        {headerOrganizations.map((headerOrganization, index) => {
          const globalOrganization = globalOrganizations.find(
            ({ id }) => id === headerOrganization.globalOrganizationId,
          );
          const organizationName =
            globalOrganization?.organizationName ?? headerOrganization.organizationName;
          const details = globalOrganization?.details ?? headerOrganization.details;
          const caption = headerOrganization.caption ?? globalOrganization?.caption ?? '';
          const isEditing = editingOrganizationId === headerOrganization.id;

          return (
            <li className="compact-card-list__item" key={headerOrganization.id}>
              <span>
                <strong>{headerOrganization.label}</strong>
                <small>{organizationName}</small>
                <small>{details}</small>
                {caption === '' ? null : <small className="template-subscript">({caption})</small>}
              </span>
              <span className="inline-actions">
                <button
                  aria-expanded={isEditing}
                  className="compact-toggle"
                  onClick={() => {
                    setEditingOrganizationId(isEditing ? null : headerOrganization.id);
                  }}
                  type="button"
                >
                  {isEditing ? 'Готово' : 'Редактировать'}
                </button>
                <button
                  aria-label={`Переместить ${headerOrganization.label} вверх`}
                  disabled={index === 0}
                  onClick={() => {
                    onMoveHeaderOrganization(headerOrganization.id, 'up');
                  }}
                  type="button"
                >
                  Вверх
                </button>
                <button
                  aria-label={`Переместить ${headerOrganization.label} вниз`}
                  disabled={index === headerOrganizations.length - 1}
                  onClick={() => {
                    onMoveHeaderOrganization(headerOrganization.id, 'down');
                  }}
                  type="button"
                >
                  Вниз
                </button>
              </span>

              {isEditing ? (
                <div className="object-template-inline-edit">
                  <label>
                    Название блока
                    <input
                      onChange={(event) => {
                        onUpdateHeaderOrganization(
                          headerOrganization,
                          'label',
                          event.currentTarget.value,
                        );
                      }}
                      value={headerOrganization.label}
                    />
                  </label>
                  <label>
                    Организация
                    <input
                      onChange={(event) => {
                        onUpdateHeaderOrganization(
                          headerOrganization,
                          'organizationName',
                          event.currentTarget.value,
                        );
                      }}
                      value={organizationName}
                    />
                  </label>
                  <label className="act-form-grid__wide">
                    Реквизиты организации
                    <textarea
                      onChange={(event) => {
                        onUpdateHeaderOrganization(
                          headerOrganization,
                          'details',
                          event.currentTarget.value,
                        );
                      }}
                      rows={3}
                      value={details}
                    />
                  </label>
                  <label className="act-form-grid__wide">
                    Подстрочный текст
                    <textarea
                      onChange={(event) => {
                        onUpdateHeaderOrganization(
                          headerOrganization,
                          'caption',
                          event.currentTarget.value,
                        );
                      }}
                      rows={2}
                      value={caption}
                    />
                  </label>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {isFormOpen ? (
        <div className="library-panel">
          <div className="library-panel__intro">
            <strong>Глобальная библиотека → назначение в шаблоне</strong>
            <small>
              Выбор не копирует отдельную “организацию объекта”: linked-акты читают текущие данные
              через шаблон, а исторический снимок появится только при ручной версии или выпуске.
            </small>
          </div>

          <label className="search-field">
            Найти организацию в глобальной библиотеке
            <input
              onChange={(event) => {
                onChangeSearch(event.currentTarget.value);
              }}
              placeholder="Например: подрядчик, проектный институт, ИНН"
              value={organizationSearch}
            />
          </label>

          <div
            className="library-list library-list--compact"
            role="list"
            aria-label="Глобальная библиотека организаций"
          >
            {filteredOrganizations.map((organization) => (
              <div className="library-row" key={organization.id} role="listitem">
                <span>
                  <strong>{organization.organizationName}</strong>
                  <small>{organization.details}</small>
                </span>
                <button
                  onClick={() => {
                    onSelectGlobalOrganization(organization);
                  }}
                  type="button"
                >
                  Выбрать
                </button>
              </div>
            ))}
          </div>

          <form className="inline-form" onSubmit={onSubmit}>
            <label>
              Название блока
              <input
                onChange={(event) => {
                  onChangeForm('label', event.currentTarget.value);
                }}
                placeholder="Например: Генподрядчик"
                value={form.label}
              />
            </label>
            <label className="act-form-grid__wide">
              Организация / объектовый текст
              <textarea
                className="medium-field"
                onChange={(event) => {
                  onChangeForm('organizationName', event.currentTarget.value);
                }}
                rows={3}
                value={form.organizationName}
              />
            </label>
            <label className="act-form-grid__wide">
              Реквизиты / детали для этого объекта
              <textarea
                className="large-field"
                onChange={(event) => {
                  onChangeForm('details', event.currentTarget.value);
                }}
                rows={5}
                value={form.details}
              />
            </label>
            <label className="act-form-grid__wide">
              Подстрочный текст
              <textarea
                className="medium-field"
                onChange={(event) => {
                  onChangeForm('caption', event.currentTarget.value);
                }}
                rows={3}
                value={form.caption}
              />
            </label>
            <button type="submit">Добавить организацию в шаблон</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function filterGlobalOrganizations(
  organizations: readonly DemoGlobalOrganization[],
  search: string,
): readonly DemoGlobalOrganization[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

  if (normalizedSearch === '') {
    return organizations;
  }

  return organizations.filter((organization) =>
    [organization.organizationName, organization.details, organization.caption].some((value) =>
      value.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
    ),
  );
}
