import type { PointerEvent } from 'react';

import type { DemoActTypeMetadata } from '../act-types/act-types.js';
import type { DemoAosrDraft } from './demo-aosr-workspace.js';

interface DemoDocumentTreeProps {
  readonly actType: DemoActTypeMetadata;
  readonly drafts: readonly DemoAosrDraft[];
  readonly draggedDraftId: string | null;
  readonly folderName?: string | undefined;
  readonly selectedDraftId: string;
  readonly onCreateAct?: (() => void) | undefined;
  readonly onDeleteDraft?: ((draftId: string) => void) | undefined;
  readonly onDragEnd: () => void;
  readonly onDragStart: (draftId: string) => void;
  readonly onReorderDrafts: (targetDraftId: string) => void;
  readonly onSelectDraft: (draftId: string) => void;
}

export function DemoDocumentTree({
  actType,
  drafts,
  draggedDraftId,
  folderName,
  selectedDraftId,
  onCreateAct,
  onDeleteDraft,
  onDragEnd,
  onDragStart,
  onReorderDrafts,
  onSelectDraft,
}: DemoDocumentTreeProps): React.JSX.Element {
  const reorderByPointerPosition = (event: PointerEvent<HTMLElement>): void => {
    if (draggedDraftId === null) {
      return;
    }

    const targetDraftId = getPointerTargetDraftId(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (targetDraftId !== null && targetDraftId !== draggedDraftId) {
      onReorderDrafts(targetDraftId);
    }
  };

  const finishPointerReorder = (): void => {
    onDragEnd();
  };

  return (
    <section className="document-tree-panel" aria-labelledby="document-tree-title">
      <div className="panel-heading">
        <h2 id="document-tree-title">Акты в папке «{folderName ?? 'Рабочая папка'}»</h2>
        <p className="object-folder-panel__note">
          Перетаскивайте акты за ручку ⋮⋮. При автоматической нумерации порядок сразу пересчитывает
          номера.
        </p>
      </div>

      <div className="document-tree" aria-label={`Акты в папке ${folderName ?? 'Рабочая папка'}`}>
        <div
          className="act-tree-list"
          role="list"
          aria-label={`Акты ${actType.code}`}
          onPointerCancel={finishPointerReorder}
          onPointerMove={reorderByPointerPosition}
          onPointerUp={finishPointerReorder}
        >
          {drafts.map((draft) => {
            const draftLabel = draft.actNumber.trim() === '' ? 'Без номера' : draft.actNumber;

            return (
              <div
                aria-label={`Акт ${draftLabel}`}
                className="act-tree-item"
                data-draft-id={draft.id}
                data-dragging={draggedDraftId === draft.id ? 'true' : undefined}
                data-selected={draft.id === selectedDraftId ? 'true' : undefined}
                key={draft.id}
                onPointerEnter={() => {
                  if (draggedDraftId !== null && draggedDraftId !== draft.id) {
                    onReorderDrafts(draft.id);
                  }
                }}
                role="listitem"
              >
                <button
                  aria-pressed={draft.id === selectedDraftId}
                  className="act-tree-item__select"
                  onClick={() => {
                    onSelectDraft(draft.id);
                  }}
                  type="button"
                >
                  <span className="act-tree-item__number">{draftLabel}</span>
                  <span className="act-tree-item__meta">
                    <small>{formatShortDate(draft.actDate)}</small>
                  </span>
                </button>
                {onDeleteDraft === undefined ? null : (
                  <button
                    className="act-tree-item__delete"
                    onClick={() => {
                      onDeleteDraft(draft.id);
                    }}
                    type="button"
                  >
                    Удалить акт
                  </button>
                )}
                <button
                  aria-label="Перетащить акт"
                  className="act-tree-item__drag"
                  onPointerDown={(event) => {
                    if (event.button !== 0) {
                      return;
                    }

                    event.preventDefault();
                    onDragStart(draft.id);

                    if (typeof event.currentTarget.setPointerCapture === 'function') {
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }
                  }}
                  title={`Перетащить акт ${draftLabel}`}
                  type="button"
                >
                  ⋮⋮
                </button>
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

function getPointerTargetDraftId(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): string | null {
  const targetElement = element.ownerDocument.elementFromPoint(clientX, clientY);
  const targetDraft = targetElement?.closest<HTMLElement>('[data-draft-id]');

  return targetDraft?.dataset['draftId'] ?? null;
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}
