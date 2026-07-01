import { useLayoutEffect, useRef, type PointerEvent } from 'react';

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
  readonly onReorderDrafts: (targetDraftId: string, placement: DraftDropPlacement) => void;
  readonly onSelectDraft: (draftId: string) => void;
}

type DraftDropPlacement = 'after' | 'before';

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
  const draftListRef = useRef<HTMLDivElement | null>(null);
  const previousDraftRectsRef = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    animateDraftListReorder(draftListRef.current, previousDraftRectsRef);
  }, [drafts]);

  const reorderByPointerPosition = (event: PointerEvent<HTMLElement>): void => {
    if (draggedDraftId === null) {
      return;
    }

    const targetDraft = getPointerTargetDraft(event.currentTarget, event.clientX, event.clientY);

    if (targetDraft !== null && targetDraft.draftId !== draggedDraftId) {
      onReorderDrafts(targetDraft.draftId, targetDraft.placement);
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
          Перетаскивайте акты за ручку. При автоматической нумерации порядок сразу пересчитывает
          номера.
        </p>
      </div>

      <div className="document-tree" aria-label={`Акты в папке ${folderName ?? 'Рабочая папка'}`}>
        <div
          ref={draftListRef}
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
                  <GripIcon />
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

function getPointerTargetDraft(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): { readonly draftId: string; readonly placement: DraftDropPlacement } | null {
  const targetElement = element.ownerDocument.elementFromPoint(clientX, clientY);
  const targetDraft = targetElement?.closest<HTMLElement>('[data-draft-id]');
  const draftId = targetDraft?.dataset['draftId'];

  if (targetDraft === null || targetDraft === undefined || draftId === undefined) {
    return null;
  }

  const targetRect = targetDraft.getBoundingClientRect();
  const placement = clientY > targetRect.top + targetRect.height / 2 ? 'after' : 'before';

  return { draftId, placement };
}

function animateDraftListReorder(
  listElement: HTMLElement | null,
  previousRects: { current: Map<string, DOMRect> },
): void {
  if (listElement === null || !('animate' in HTMLElement.prototype)) {
    return;
  }

  const draftElements = Array.from(listElement.querySelectorAll<HTMLElement>('[data-draft-id]'));
  const nextRects = new Map<string, DOMRect>();

  draftElements.forEach((draftElement) => {
    const draftId = draftElement.dataset['draftId'];

    if (draftId === undefined) {
      return;
    }

    const nextRect = draftElement.getBoundingClientRect();
    const previousRect = previousRects.current.get(draftId);

    nextRects.set(draftId, nextRect);

    if (previousRect === undefined) {
      return;
    }

    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
      return;
    }

    draftElement.animate(
      [
        { transform: `translate(${String(deltaX)}px, ${String(deltaY)}px)` },
        { transform: 'translate(0, 0)' },
      ],
      {
        duration: 260,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    );
  });

  previousRects.current = nextRects;
}

function GripIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M7 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
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
