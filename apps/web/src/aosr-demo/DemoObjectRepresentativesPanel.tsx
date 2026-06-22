import { useState, type SyntheticEvent } from 'react';

import type { DemoAosrRepresentative, ObjectTemplate } from './demo-aosr-workspace.js';
import type { RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoRepresentativeForm } from './DemoRepresentativeForm.js';

interface DemoObjectRepresentativesPanelProps {
  readonly form: RepresentativeFormState;
  readonly globalRepresentatives: readonly DemoAosrRepresentative[];
  readonly isFormOpen: boolean;
  readonly objectRepresentatives: readonly DemoAosrRepresentative[];
  readonly representativeGroups: ObjectTemplate['representativeGroups'];
  readonly representativeSearch: string;
  readonly onChangeForm: (field: keyof RepresentativeFormState, value: string) => void;
  readonly onChangeSearch: (value: string) => void;
  readonly onSelectGlobalRepresentative: (representative: DemoAosrRepresentative) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onToggleForm: () => void;
  readonly onUpdateRepresentative: (
    groupId: string,
    memberId: string,
    signatoryId: string,
    field: 'authorityBasis' | 'details' | 'fullName' | 'nrsId' | 'organization' | 'position',
    value: string,
  ) => void;
  readonly onUpdateRepresentativeGroupTitle: (groupId: string, value: string) => void;
}

export function DemoObjectRepresentativesPanel({
  form,
  globalRepresentatives,
  isFormOpen,
  objectRepresentatives,
  representativeGroups,
  representativeSearch,
  onChangeForm,
  onChangeSearch,
  onSelectGlobalRepresentative,
  onSubmit,
  onToggleForm,
  onUpdateRepresentative,
  onUpdateRepresentativeGroupTitle,
}: DemoObjectRepresentativesPanelProps): React.JSX.Element {
  const filteredRepresentatives = filterRepresentatives(
    globalRepresentatives,
    representativeSearch,
  );
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  return (
    <section className="form-section" aria-labelledby="representative-library-title">
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="representative-library-title">Представители для актов</h3>
        </span>
        <button className="compact-toggle" onClick={onToggleForm} type="button">
          {isFormOpen ? 'Свернуть добавление' : 'Добавить представителя'}
        </button>
      </div>

      <div
        className="representative-template-groups"
        role="list"
        aria-label="Назначения представителей объекта"
      >
        {representativeGroups.map((group) => {
          const isEditing = editingGroupId === group.id;

          return (
            <section className="representative-template-group" key={group.id} role="listitem">
              <div className="representative-template-group__heading">
                <strong>{group.title}</strong>
                <button
                  aria-expanded={isEditing}
                  className="compact-toggle"
                  onClick={() => {
                    setEditingGroupId(isEditing ? null : group.id);
                  }}
                  type="button"
                >
                  {isEditing ? 'Готово' : 'Редактировать'}
                </button>
              </div>

              {isEditing ? (
                <label className="representative-template-group__title-field">
                  Название группы / роль
                  <input
                    onChange={(event) => {
                      onUpdateRepresentativeGroupTitle(group.id, event.currentTarget.value);
                    }}
                    value={group.title}
                  />
                </label>
              ) : null}

              <ol className="compact-card-list" aria-label={`Участники группы ${group.title}`}>
                {group.members.map((member) => {
                  const globalRepresentative = globalRepresentatives.find(
                    (candidate) => candidate.id === member.signatoryId,
                  );
                  const objectRepresentative = objectRepresentatives.find(
                    (candidate) =>
                      candidate.id === member.signatoryId ||
                      candidate.globalRepresentativeId === member.signatoryId,
                  );
                  const representative = globalRepresentative ?? objectRepresentative;
                  const subscript =
                    member.subscriptMode === 'custom'
                      ? (member.customSubscript ?? '')
                      : (globalRepresentative?.details ?? objectRepresentative?.details ?? '');

                  return (
                    <li className="compact-card-list__item" key={member.id}>
                      <span>
                        <strong>{representative?.fullName ?? 'Подписант не найден'}</strong>
                        <small>
                          {[representative?.position, representative?.organization]
                            .filter(Boolean)
                            .join(', ')}
                        </small>
                        <small>
                          {[representative?.authorityBasis, representative?.nrsId]
                            .filter(Boolean)
                            .join(', ')}
                        </small>
                        {subscript === '' ? null : (
                          <small className="template-subscript">({subscript})</small>
                        )}
                      </span>

                      {isEditing ? (
                        <div className="object-template-inline-edit">
                          <label>
                            ФИО
                            <input
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'fullName',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative?.fullName ?? ''}
                            />
                          </label>
                          <label>
                            Должность
                            <input
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'position',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative?.position ?? ''}
                            />
                          </label>
                          <label>
                            Организация
                            <input
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'organization',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative?.organization ?? ''}
                            />
                          </label>
                          <label>
                            Основание полномочий
                            <input
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'authorityBasis',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative?.authorityBasis ?? ''}
                            />
                          </label>
                          <label>
                            Номер НРС
                            <input
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'nrsId',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative?.nrsId ?? ''}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Подстрочный текст
                            <textarea
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  group.id,
                                  member.id,
                                  member.signatoryId,
                                  'details',
                                  event.currentTarget.value,
                                );
                              }}
                              rows={2}
                              value={subscript}
                            />
                          </label>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

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
              details: 'Подстрочный текст',
              fullName: 'ФИО представителя',
              nrsId: 'Номер НРС для объекта',
              organization: 'Организация на этом объекте',
              position: 'Должность на этом объекте',
              roleLabel: 'Роль на этом объекте',
            }}
            onChange={onChangeForm}
            onSubmit={onSubmit}
            submitLabel="Добавить представителя в шаблон"
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
