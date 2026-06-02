import type { SyntheticEvent } from 'react';

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
}: DemoHeaderOrganizationsPanelProps): React.JSX.Element {
  const filteredOrganizations = filterGlobalOrganizations(globalOrganizations, organizationSearch);

  return (
    <section className="form-section" aria-labelledby="header-organizations-title">
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="header-organizations-title">Организации объекта / шапка акта</h3>
          <p className="helper-note">
            Метки блоков задаются на объекте: заказчик, подрядчик, техзаказчик, генподрядчик или
            любой другой вариант.
          </p>
        </span>
        <button className="compact-toggle" onClick={onToggleForm} type="button">
          {isFormOpen ? 'Свернуть добавление' : 'Добавить блок шапки'}
        </button>
      </div>

      <ol className="compact-card-list" aria-label="Организации в шапке акта">
        {headerOrganizations.map((headerOrganization, index) => (
          <li className="compact-card-list__item" key={headerOrganization.id}>
            <span>
              <strong>{headerOrganization.label}</strong>
              <small>{headerOrganization.organizationName}</small>
              <small>{headerOrganization.details}</small>
            </span>
            <span className="inline-actions">
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
          </li>
        ))}
      </ol>

      {isFormOpen ? (
        <div className="library-panel">
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
                required
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
                required
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
                required
                rows={5}
                value={form.details}
              />
            </label>
            <label className="act-form-grid__wide">
              Подпись-подсказка
              <textarea
                className="medium-field"
                onChange={(event) => {
                  onChangeForm('caption', event.currentTarget.value);
                }}
                rows={3}
                value={form.caption}
              />
            </label>
            <button type="submit">Сохранить организацию в шапке</button>
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
