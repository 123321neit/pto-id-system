import type { DemoActTypeMetadata } from '../act-types/act-types.js';
import type { DemoAosrDraft } from './demo-aosr-workspace.js';

type DraftMoveDirection = 'down' | 'up';

interface DemoDocumentTreeProps {
  readonly actType: DemoActTypeMetadata;
  readonly drafts: readonly DemoAosrDraft[];
  readonly folderName?: string | undefined;
  readonly selectedDraftId: string;
  readonly onCreateAct?: (() => void) | undefined;
  readonly onDeleteDraft?: ((draftId: string) => void) | undefined;
  readonly onDuplicateDraft?: ((draftId: string) => void) | undefined;
  readonly onMoveDraft: (draftId: string, direction: DraftMoveDirection) => void;
  readonly onSelectDraft: (draftId: string) => void;
}

export function DemoDocumentTree({
  actType,
  drafts,
  folderName,
  selectedDraftId,
  onCreateAct,
  onDeleteDraft,
  onDuplicateDraft,
  onMoveDraft,
  onSelectDraft,
}: DemoDocumentTreeProps): React.JSX.Element {
  return (
    <section className="document-tree-panel" aria-labelledby="document-tree-title">
      <div className="panel-heading">
        <h2 id="document-tree-title">Акты в папке «{folderName ?? 'Рабочая папка'}»</h2>
        <p className="object-folder-panel__note">
          Меняйте порядок кнопками ↑ Вверх / ↓ Вниз. При автоматической нумерации порядок сразу
          пересчитывает номера.
        </p>
      </div>

      <div className="document-tree" aria-label={`Акты в папке ${folderName ?? 'Рабочая папка'}`}>
        <div className="act-tree-list" role="list" aria-label={`Акты ${actType.code}`}>
          {drafts.map((draft, draftIndex) => {
            const draftLabel = draft.actNumber.trim() === '' ? 'Без номера' : draft.actNumber;

            return (
              <div
                aria-label={`Акт ${draftLabel}`}
                className="act-tree-item"
                data-draft-id={draft.id}
                data-selected={draft.id === selectedDraftId ? 'true' : undefined}
                key={draft.id}
                role="listitem"
              >
                <div className="act-tree-item__order" aria-label={`Порядок акта ${draftLabel}`}>
                  <button
                    disabled={draftIndex === 0}
                    onClick={() => {
                      onMoveDraft(draft.id, 'up');
                    }}
                    type="button"
                  >
                    ↑ Вверх
                  </button>
                  <button
                    disabled={draftIndex === drafts.length - 1}
                    onClick={() => {
                      onMoveDraft(draft.id, 'down');
                    }}
                    type="button"
                  >
                    ↓ Вниз
                  </button>
                </div>
                <button
                  aria-pressed={draft.id === selectedDraftId}
                  className="act-tree-item__select"
                  onClick={() => {
                    onSelectDraft(draft.id);
                  }}
                  type="button"
                >
                  <span className="act-tree-item__number">{draftLabel}</span>
                  <span className="act-tree-item__type">
                    {actType.code} — {actType.title}
                  </span>
                  <span
                    className={
                      draft.workDescription.trim() === ''
                        ? 'act-tree-item__work act-tree-item__work--empty'
                        : 'act-tree-item__work'
                    }
                  >
                    {getDraftWorkDescriptionPreview(draft)}
                  </span>
                  {draft.actDate.trim() === '' ? null : (
                    <span className="act-tree-item__meta">
                      Дата: <small>{formatShortDate(draft.actDate)}</small>
                    </span>
                  )}
                </button>
                <div className="act-tree-item__actions">
                  {onDuplicateDraft === undefined ? null : (
                    <button
                      className="act-tree-item__duplicate"
                      onClick={() => {
                        onDuplicateDraft(draft.id);
                      }}
                      title={`Дублировать акт ${draftLabel}`}
                      type="button"
                    >
                      Дублировать
                    </button>
                  )}
                  {onDeleteDraft === undefined ? null : (
                    <button
                      aria-label="Удалить акт"
                      className="act-tree-item__delete"
                      onClick={() => {
                        onDeleteDraft(draft.id);
                      }}
                      title={`Удалить акт ${draftLabel}`}
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {onCreateAct === undefined ? null : (
          <button
            className="compact-toggle compact-toggle--accent"
            onClick={onCreateAct}
            type="button"
          >
            + Создать акт
          </button>
        )}
      </div>
    </section>
  );
}

function getDraftWorkDescriptionPreview(draft: DemoAosrDraft): string {
  const workDescription = draft.workDescription.trim();

  return workDescription === '' ? 'Работы не заполнены' : workDescription;
}

function TrashIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M7.5 3.25A2.25 2.25 0 0 1 9.75 1h.5a2.25 2.25 0 0 1 2.25 2.25h3.25a.75.75 0 0 1 0 1.5h-.83l-.7 10.49A3 3 0 0 1 11.23 18H8.77a3 3 0 0 1-2.99-2.76l-.7-10.49h-.83a.75.75 0 0 1 0-1.5H7.5Zm1.5 0h2A.75.75 0 0 0 10.25 2h-.5A.75.75 0 0 0 9 3.25Zm-2.42 1.5.69 10.39a1.5 1.5 0 0 0 1.5 1.36h2.46a1.5 1.5 0 0 0 1.5-1.36l.69-10.39H6.58Zm2.17 2.5a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75Zm3.25.75a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 0 1.5 0V8Z" />
    </svg>
  );
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}
