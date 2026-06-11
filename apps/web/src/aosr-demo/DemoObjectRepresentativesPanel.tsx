import type { SyntheticEvent } from 'react';

import type { DemoAosrRepresentative } from './demo-aosr-workspace.js';
import type { RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoRepresentativeForm } from './DemoRepresentativeForm.js';

interface DemoObjectRepresentativesPanelProps {
  readonly form: RepresentativeFormState;
  readonly globalRepresentatives: readonly DemoAosrRepresentative[];
  readonly isFormOpen: boolean;
  readonly isLibraryOpen: boolean;
  readonly objectRepresentatives: readonly DemoAosrRepresentative[];
  readonly representativeSearch: string;
  readonly onChangeForm: (field: keyof RepresentativeFormState, value: string) => void;
  readonly onChangeSearch: (value: string) => void;
  readonly onSelectGlobalRepresentative: (representative: DemoAosrRepresentative) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onToggleForm: () => void;
  readonly onToggleLibrary: () => void;
}

export function DemoObjectRepresentativesPanel({
  form,
  globalRepresentatives,
  isFormOpen,
  isLibraryOpen,
  objectRepresentatives,
  representativeSearch,
  onChangeForm,
  onChangeSearch,
  onSelectGlobalRepresentative,
  onSubmit,
  onToggleForm,
  onToggleLibrary,
}: DemoObjectRepresentativesPanelProps): React.JSX.Element {
  const filteredRepresentatives = filterRepresentatives(
    globalRepresentatives,
    representativeSearch,
  );

  return (
    <section className="form-section" aria-labelledby="representative-library-title">
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="representative-library-title">Назначения представителей на объект</h3>
          <p className="helper-note">
            Глобальный представитель получает объектовые роль, должность, организацию и основание, а
            затем выбирается в актах.
          </p>
        </span>
        <span className="inline-actions">
          <button className="compact-toggle" onClick={onToggleLibrary} type="button">
            {isLibraryOpen ? 'Скрыть назначения' : 'Назначения объекта'}
          </button>
          <button className="compact-toggle" onClick={onToggleForm} type="button">
            {isFormOpen ? 'Свернуть добавление' : 'Добавить назначение'}
          </button>
        </span>
      </div>

      <div className="compact-summary-list" aria-label="Кратко о назначениях представителей">
        <span>{objectRepresentatives.length} назначений на объекте</span>
        <span>доступны для текущих актов</span>
      </div>

      {isLibraryOpen ? (
        <div className="library-panel">
          <div
            className="library-list library-list--compact"
            role="list"
            aria-label="Назначения представителей объекта"
          >
            {objectRepresentatives.map((representative) => (
              <div className="library-row" key={representative.id} role="listitem">
                <span>
                  <strong>{representative.fullName}</strong>
                  <small>
                    {representative.roleLabel} / {representative.position}
                  </small>
                  <small>{representative.organization}</small>
                  <small>{representative.authorityBasis}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="library-panel">
          <label className="search-field">
            Найти представителя в глобальной библиотеке
            <input
              onChange={(event) => {
                onChangeSearch(event.currentTarget.value);
              }}
              placeholder="ФИО, роль или организация"
              value={representativeSearch}
            />
          </label>

          <div
            className="library-list library-list--compact"
            role="list"
            aria-label="Глобальная библиотека представителей"
          >
            {filteredRepresentatives.map((representative) => (
              <div className="library-row" key={representative.id} role="listitem">
                <span>
                  <strong>{representative.fullName}</strong>
                  <small>
                    {representative.roleLabel} / {representative.position}
                  </small>
                  <small>{representative.organization}</small>
                </span>
                <button
                  onClick={() => {
                    onSelectGlobalRepresentative(representative);
                  }}
                  type="button"
                >
                  Выбрать
                </button>
              </div>
            ))}
          </div>

          <DemoRepresentativeForm
            form={form}
            labels={{
              authorityBasis: 'Основание полномочий для объекта',
              details: 'Дополнительные сведения для объекта',
              fullName: 'ФИО представителя',
              nrsId: 'Номер НРС для объекта',
              organization: 'Организация на этом объекте',
              position: 'Должность на этом объекте',
              roleLabel: 'Роль на этом объекте',
            }}
            onChange={onChangeForm}
            onSubmit={onSubmit}
            submitLabel="Сохранить назначение представителя"
          />
        </div>
      ) : null}
    </section>
  );
}

function filterRepresentatives(
  representatives: readonly DemoAosrRepresentative[],
  search: string,
): readonly DemoAosrRepresentative[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

  if (normalizedSearch === '') {
    return representatives;
  }

  return representatives.filter((representative) =>
    [
      representative.fullName,
      representative.roleLabel,
      representative.position,
      representative.organization,
      representative.authorityBasis,
      representative.nrsId ?? '',
      representative.details ?? '',
    ].some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch)),
  );
}
