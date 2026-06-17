import type { DragEvent, SyntheticEvent } from 'react';

import type { DemoAosrRepresentative } from './demo-aosr-workspace.js';
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoRepresentativeForm } from './DemoRepresentativeForm.js';

interface DemoSignatoriesEditorProps {
  readonly actRepresentativeSearch: string;
  readonly draggedRepresentativeId: string | null;
  readonly dropTargetRepresentativeId: string | null;
  readonly isManualRepresentativeFormOpen: boolean;
  readonly isTemplateEditable: boolean;
  readonly manualRepresentativeForm: RepresentativeFormState;
  readonly objectRepresentatives: readonly DemoAosrRepresentative[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly sourceLabel: string;
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
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleManualRepresentativeForm: () => void;
}

export function DemoSignatoriesEditor({
  actRepresentativeSearch,
  draggedRepresentativeId,
  dropTargetRepresentativeId,
  isManualRepresentativeFormOpen,
  isTemplateEditable,
  manualRepresentativeForm,
  objectRepresentatives,
  selectedSignatories,
  sourceLabel,
  onAddManualRepresentative,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeManualRepresentativeForm,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
  onDragRepresentativeTarget,
  onMoveSelectedSignatory,
  onRemoveRepresentativeFromAct,
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
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="commission-data-title">Подписанты текущего акта</h3>
          <span className="source-chip">{sourceLabel}</span>
        </span>
        {isTemplateEditable ? (
          <button
            className="compact-toggle compact-toggle--accent"
            onClick={onToggleManualRepresentativeForm}
            type="button"
          >
            Создать представителя и назначение
          </button>
        ) : null}
      </div>

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
          <p className="helper-note">Ручная версия хранит собственный снимок подписантов.</p>
        </>
      ) : (
        <p className="helper-note">Состав подписантов берётся из шаблона объекта.</p>
      )}

      {isTemplateEditable && actRepresentativeSearch.trim() !== '' ? (
        <div
          className="library-list library-list--compact"
          role="list"
          aria-label="Назначения представителей для текущего акта"
        >
          {filteredRepresentatives.map((representative) => {
            const isInCurrentAct = selectedSignatories.some(({ id }) => id === representative.id);

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
              В production это создаст глобального представителя, назначение на объект и снимок для
              акта.
            </p>
          }
          form={manualRepresentativeForm}
          labels={{
            authorityBasis: 'Основание полномочий в назначении объекта',
            details: 'Детали назначения для печатного снимка',
            fullName: 'ФИО глобального представителя',
            nrsId: 'Номер НРС для назначения',
            organization: 'Организация в назначении объекта',
            position: 'Должность в назначении объекта',
            roleLabel: 'Роль назначения на объекте',
          }}
          onChange={onChangeManualRepresentativeForm}
          onSubmit={onAddManualRepresentative}
          submitLabel="Создать и добавить в акт"
        />
      ) : null}

      <ol className="signatory-order-list" aria-label="Порядок подписантов">
        {selectedSignatories.map((representative, index) => (
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
            <span>
              <strong>{representative.roleLabel}</strong>
              <small>
                {representative.fullName} / {representative.organization}
              </small>
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
        ))}
      </ol>
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
