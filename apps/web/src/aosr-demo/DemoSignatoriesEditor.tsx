import type { DragEvent, SyntheticEvent } from 'react';

import type { DemoAosrRepresentative } from './demo-aosr-workspace.js';
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoRepresentativeForm } from './DemoRepresentativeForm.js';

interface DemoSignatoriesEditorProps {
  readonly actRepresentativeSearch: string;
  readonly differentSourceLabel: string;
  readonly draggedRepresentativeId: string | null;
  readonly dropTargetRepresentativeId: string | null;
  readonly isManualRepresentativeFormOpen: boolean;
  readonly isTemplateEditable: boolean;
  readonly linkedSignatories: readonly DemoAosrRepresentative[];
  readonly manualRepresentativeForm: RepresentativeFormState;
  readonly objectRepresentatives: readonly DemoAosrRepresentative[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly sourceLabel: string;
  readonly templateScopeNominative: string;
  readonly onAddManualRepresentative: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onAddRepresentativeToAct: (representative: DemoAosrRepresentative) => void;
  readonly onChangeActRepresentativeSearch: (value: string) => void;
  readonly onChangeManualRepresentativeForm: (
    field: keyof RepresentativeFormState,
    value: string,
  ) => void;
  readonly onDragRepresentativeEnd: () => void;
  readonly onDragRepresentativeStart: (representativeId: string) => void;
  readonly onDragRepresentativeTarget: (representativeId: string) => void;
  readonly onMoveSelectedSignatory: (representativeId: string, direction: MoveDirection) => void;
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onUpdateRepresentative: (
    representativeId: string,
    field:
      | 'authorityBasis'
      | 'details'
      | 'fullName'
      | 'introDisplayText'
      | 'nrsId'
      | 'organization'
      | 'position'
      | 'roleLabel'
      | 'signatureName'
      | 'signatureText',
    value: string,
  ) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleManualRepresentativeForm: () => void;
}

export function DemoSignatoriesEditor({
  actRepresentativeSearch,
  differentSourceLabel,
  draggedRepresentativeId,
  dropTargetRepresentativeId,
  isManualRepresentativeFormOpen,
  isTemplateEditable,
  linkedSignatories,
  manualRepresentativeForm,
  objectRepresentatives,
  selectedSignatories,
  sourceLabel,
  templateScopeNominative,
  onAddManualRepresentative,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeManualRepresentativeForm,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
  onDragRepresentativeTarget,
  onMoveSelectedSignatory,
  onRemoveRepresentativeFromAct,
  onUpdateRepresentative,
  onReorderSelectedSignatory,
  onToggleManualRepresentativeForm,
}: DemoSignatoriesEditorProps): React.JSX.Element {
  const filteredRepresentatives = filterObjectRepresentatives(
    objectRepresentatives,
    actRepresentativeSearch,
  );

  return (
    <section
      className="form-section act-editor-card act-editor-card--featured"
      aria-labelledby="commission-data-title"
    >
      <details className="template-data-disclosure" open={isTemplateEditable ? true : undefined}>
        <summary>
          <span>
            <strong id="commission-data-title">Подписанты текущего акта</strong>
            <small>Подписантов в печатном порядке: {selectedSignatories.length}</small>
          </span>
          {isTemplateEditable ? <span className="source-chip">{sourceLabel}</span> : null}
        </summary>

        <div className="template-data-disclosure__body">
          {isTemplateEditable ? (
            <div className="template-data-disclosure__intro">
              <button
                className="compact-toggle compact-toggle--accent"
                onClick={onToggleManualRepresentativeForm}
                type="button"
              >
                Создать представителя и назначение
              </button>
            </div>
          ) : null}

          {isTemplateEditable ? (
            <>
              <label className="search-field">
                Добавить назначение представителя в акт
                <input
                  onChange={(event) => {
                    onChangeActRepresentativeSearch(event.currentTarget.value);
                  }}
                  placeholder="ФИО, роль или организация из назначения"
                  value={actRepresentativeSearch}
                />
              </label>
            </>
          ) : null}

          {isTemplateEditable && actRepresentativeSearch.trim() !== '' ? (
            <div
              className="library-list library-list--compact"
              role="list"
              aria-label="Назначения представителей для текущего акта"
            >
              {filteredRepresentatives.map((representative) => {
                const isInCurrentAct = selectedSignatories.some(
                  ({ id }) => id === representative.id,
                );

                return (
                  <div className="library-row" key={representative.id} role="listitem">
                    <span>
                      <strong>{representative.fullName}</strong>
                      <small>
                        {representative.roleLabel} / {representative.organization}
                      </small>
                      <small>{representative.authorityBasis}</small>
                    </span>
                    <button
                      disabled={isInCurrentAct}
                      onClick={() => {
                        onAddRepresentativeToAct(representative);
                      }}
                      type="button"
                    >
                      {isInCurrentAct ? 'В акте' : 'Добавить назначение'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {isTemplateEditable && isManualRepresentativeFormOpen ? (
            <DemoRepresentativeForm
              afterFields={
                <p className="helper-note act-form-grid__wide">
                  Ручная версия изменит только снимок этого акта. {templateScopeNominative} и
                  библиотека не изменятся.
                </p>
              }
              form={manualRepresentativeForm}
              labels={{
                authorityBasis: 'Основание полномочий в ручной версии',
                details: 'Подстрочный текст для ручной версии',
                fullName: 'ФИО представителя',
                nrsId: 'Номер НРС для ручной версии',
                organization: 'Организация в ручной версии',
                position: 'Должность в ручной версии',
                roleLabel: 'Группа / роль в ручной версии',
              }}
              onChange={onChangeManualRepresentativeForm}
              onSubmit={onAddManualRepresentative}
              submitLabel="Создать и добавить в акт"
            />
          ) : null}

          <ol className="signatory-order-list" aria-label="Порядок подписантов">
            {selectedSignatories.map((representative, index) => {
              const linkedRepresentative = linkedSignatories.find(
                ({ id }) => id === representative.id,
              );
              const isDifferent =
                isTemplateEditable &&
                (linkedRepresentative?.roleLabel !== representative.roleLabel ||
                  linkedRepresentative.fullName !== representative.fullName ||
                  linkedRepresentative.position !== representative.position ||
                  linkedRepresentative.organization !== representative.organization ||
                  linkedRepresentative.authorityBasis !== representative.authorityBasis ||
                  (linkedRepresentative.nrsId ?? '') !== (representative.nrsId ?? '') ||
                  (linkedRepresentative.details ?? '') !== (representative.details ?? '') ||
                  (linkedRepresentative.introDisplayText ?? '') !==
                    (representative.introDisplayText ?? '') ||
                  (linkedRepresentative.signatureText ?? '') !==
                    (representative.signatureText ?? '') ||
                  (linkedRepresentative.signatureName ?? '') !==
                    (representative.signatureName ?? ''));
              const subtitle = [representative.position, representative.organization]
                .map((value) => value.trim())
                .filter(Boolean)
                .join(', ');
              const details = [
                representative.authorityBasis,
                representative.nrsId === undefined ? '' : `НРС ${representative.nrsId}`,
              ]
                .map((value) => value.trim())
                .filter(Boolean)
                .join(', ');

              return (
                <li
                  className="signatory-order-item"
                  data-dragging={draggedRepresentativeId === representative.id ? 'true' : undefined}
                  data-drop-target={
                    dropTargetRepresentativeId === representative.id &&
                    draggedRepresentativeId !== representative.id
                      ? 'true'
                      : undefined
                  }
                  key={representative.id}
                  onDragEnter={(event) => {
                    if (!isTemplateEditable) {
                      return;
                    }
                    event.preventDefault();
                    onDragRepresentativeTarget(representative.id);
                  }}
                  onDragOver={(event) => {
                    if (!isTemplateEditable) {
                      return;
                    }
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    if (!isTemplateEditable) {
                      return;
                    }
                    event.preventDefault();
                    onReorderSelectedSignatory(representative.id);
                  }}
                >
                  <span className="signatory-order-item__lead">
                    {isTemplateEditable ? (
                      <button
                        aria-label={`Перетащить ${representative.fullName}`}
                        className="signatory-order-item__drag"
                        draggable
                        onDragEnd={onDragRepresentativeEnd}
                        onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                          event.dataTransfer.effectAllowed = 'move';
                          onDragRepresentativeStart(representative.id);
                        }}
                        type="button"
                      >
                        <span aria-hidden="true">↕</span>
                      </button>
                    ) : null}
                    <span className="signatory-order-item__position">{index + 1}</span>
                  </span>
                  <span className="signatory-order-item__body">
                    <strong className="signatory-order-item__title">
                      {representative.roleLabel}
                      <span className="signatory-order-item__name">
                        {' — '}
                        {representative.fullName}
                      </span>
                    </strong>
                    {subtitle === '' ? null : (
                      <small className="signatory-order-item__subtitle">{subtitle}</small>
                    )}
                    {details === '' ? null : (
                      <small className="signatory-order-item__details">{details}</small>
                    )}
                    {isDifferent ? (
                      <small className="source-chip">{differentSourceLabel}</small>
                    ) : null}
                    {isTemplateEditable ? (
                      <details className="manual-snapshot-editor">
                        <summary>Изменить подписанта</summary>
                        <div className="act-form-grid">
                          <label>
                            Группа
                            <input
                              aria-label={`Группа подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'roleLabel',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.roleLabel}
                            />
                          </label>
                          <label>
                            ФИО
                            <input
                              aria-label={`ФИО подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'fullName',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.fullName}
                            />
                          </label>
                          <label>
                            Должность
                            <input
                              aria-label={`Должность подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'position',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.position}
                            />
                          </label>
                          <label>
                            Организация
                            <input
                              aria-label={`Организация подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'organization',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.organization}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Основание полномочий
                            <input
                              aria-label={`Основание полномочий подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'authorityBasis',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.authorityBasis}
                            />
                          </label>
                          <label>
                            НРС
                            <input
                              aria-label={`НРС подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'nrsId',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.nrsId ?? ''}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Подстрочное пояснение
                            <textarea
                              aria-label={`Подстрочное пояснение подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'details',
                                  event.currentTarget.value,
                                );
                              }}
                              rows={2}
                              value={representative.details ?? ''}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Строка представителя в верхней части
                            <textarea
                              aria-label={`Верхняя печатная строка подписанта ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'introDisplayText',
                                  event.currentTarget.value,
                                );
                              }}
                              rows={3}
                              value={representative.introDisplayText ?? ''}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Левая часть подписи
                            <input
                              aria-label={`Левая часть подписи ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'signatureText',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.signatureText ?? ''}
                            />
                          </label>
                          <label>
                            Имя в подписи
                            <input
                              aria-label={`Имя в подписи ${representative.fullName}`}
                              onChange={(event) => {
                                onUpdateRepresentative(
                                  representative.id,
                                  'signatureName',
                                  event.currentTarget.value,
                                );
                              }}
                              value={representative.signatureName ?? ''}
                            />
                          </label>
                        </div>
                      </details>
                    ) : null}
                  </span>
                  {isTemplateEditable ? (
                    <span className="signatory-order-item__actions">
                      <button
                        aria-label={`Переместить ${representative.fullName} вверх`}
                        disabled={index === 0}
                        onClick={() => {
                          onMoveSelectedSignatory(representative.id, 'up');
                        }}
                        type="button"
                      >
                        Вверх
                      </button>
                      <button
                        aria-label={`Переместить ${representative.fullName} вниз`}
                        disabled={index === selectedSignatories.length - 1}
                        onClick={() => {
                          onMoveSelectedSignatory(representative.id, 'down');
                        }}
                        type="button"
                      >
                        Вниз
                      </button>
                      <button
                        aria-label={`Убрать ${representative.fullName} из акта`}
                        onClick={() => {
                          onRemoveRepresentativeFromAct(representative.id);
                        }}
                        type="button"
                      >
                        Убрать
                      </button>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </details>
    </section>
  );
}

function filterObjectRepresentatives(
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
