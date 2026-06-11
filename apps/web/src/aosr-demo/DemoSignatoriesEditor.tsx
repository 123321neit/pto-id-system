import type { SyntheticEvent } from 'react';

import type { DemoAosrRepresentative } from './demo-aosr-workspace.js';
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoRepresentativeForm } from './DemoRepresentativeForm.js';

interface DemoSignatoriesEditorProps {
  readonly actRepresentativeSearch: string;
  readonly draggedRepresentativeId: string | null;
  readonly isManualRepresentativeFormOpen: boolean;
  readonly manualRepresentativeForm: RepresentativeFormState;
  readonly objectRepresentatives: readonly DemoAosrRepresentative[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly shouldAddManualRepresentativeToLibrary: boolean;
  readonly onAddManualRepresentative: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onAddRepresentativeToAct: (representative: DemoAosrRepresentative) => void;
  readonly onChangeActRepresentativeSearch: (value: string) => void;
  readonly onChangeManualRepresentativeForm: (
    field: keyof RepresentativeFormState,
    value: string,
  ) => void;
  readonly onChangeShouldAddManualRepresentativeToLibrary: (value: boolean) => void;
  readonly onDragRepresentativeEnd: () => void;
  readonly onDragRepresentativeStart: (representativeId: string) => void;
  readonly onMoveSelectedSignatory: (representativeId: string, direction: MoveDirection) => void;
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleManualRepresentativeForm: () => void;
}

export function DemoSignatoriesEditor({
  actRepresentativeSearch,
  draggedRepresentativeId,
  isManualRepresentativeFormOpen,
  manualRepresentativeForm,
  objectRepresentatives,
  selectedSignatories,
  shouldAddManualRepresentativeToLibrary,
  onAddManualRepresentative,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeManualRepresentativeForm,
  onChangeShouldAddManualRepresentativeToLibrary,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
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
        </span>
        <button
          className="compact-toggle compact-toggle--accent"
          onClick={onToggleManualRepresentativeForm}
          type="button"
        >
          Добавить подписанта
        </button>
      </div>

      <label className="search-field">
        Добавить подписанта из назначений объекта
        <input
          onChange={(event) => {
            onChangeActRepresentativeSearch(event.currentTarget.value);
          }}
          placeholder="ФИО, роль или организация из назначения"
          value={actRepresentativeSearch}
        />
      </label>
      <p className="helper-note">
        Акт выбирает назначение объекта и сохраняет печатный снимок подписанта.
      </p>

      {actRepresentativeSearch.trim() !== '' ? (
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
                  {isInCurrentAct ? 'В акте' : 'Добавить подписанта'}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {isManualRepresentativeFormOpen ? (
        <DemoRepresentativeForm
          afterFields={
            <label className="checkbox-row checkbox-row--inline">
              <input
                checked={shouldAddManualRepresentativeToLibrary}
                onChange={(event) => {
                  onChangeShouldAddManualRepresentativeToLibrary(event.currentTarget.checked);
                }}
                type="checkbox"
              />
              <span>
                <strong>Также оставить назначение в настройках объекта</strong>
              </span>
            </label>
          }
          form={manualRepresentativeForm}
          labels={{
            authorityBasis: 'Основание полномочий для снимка акта',
            details: 'Детали для снимка акта',
            fullName: 'ФИО для снимка акта',
            nrsId: 'Номер НРС для снимка акта',
            organization: 'Организация для снимка акта',
            position: 'Должность для снимка акта',
            roleLabel: 'Роль для снимка акта',
          }}
          onChange={onChangeManualRepresentativeForm}
          onSubmit={onAddManualRepresentative}
          submitLabel="Добавить подписанта в акт"
        />
      ) : null}

      <ol className="signatory-order-list" aria-label="Порядок подписантов">
        {selectedSignatories.map((representative, index) => (
          <li
            className="signatory-order-item"
            data-dragging={draggedRepresentativeId === representative.id ? 'true' : undefined}
            draggable
            key={representative.id}
            onDragEnd={onDragRepresentativeEnd}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDragStart={() => {
              onDragRepresentativeStart(representative.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onReorderSelectedSignatory(representative.id);
            }}
          >
            <span className="signatory-order-item__drag" aria-hidden="true">
              ::
            </span>
            <span className="signatory-order-item__position">{index + 1}</span>
            <span>
              <strong>{representative.roleLabel}</strong>
              <small>
                {representative.fullName} / {representative.organization}
              </small>
            </span>
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
