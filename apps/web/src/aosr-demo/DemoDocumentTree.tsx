import type { DemoActTypeMetadata } from '../act-types/act-types.js';
import type { DemoAosrDraft } from './demo-aosr-workspace.js';

interface DemoDocumentTreeProps {
  readonly actType: DemoActTypeMetadata;
  readonly drafts: readonly DemoAosrDraft[];
  readonly draggedDraftId: string | null;
  readonly folderName?: string | undefined;
  readonly selectedDraftId: string;
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
  onDragEnd,
  onDragStart,
  onReorderDrafts,
  onSelectDraft,
}: DemoDocumentTreeProps): React.JSX.Element {
  return (
    <section className="document-tree-panel" aria-labelledby="document-tree-title">
      <div className="panel-heading">
        <p className="section-kicker">Папка ИД</p>
        <h2 id="document-tree-title">Документы папки</h2>
      </div>

      <div className="document-tree" aria-label="Навигация документов папки">
        <div className="tree-folder">
          <span className="tree-folder__icon" aria-hidden="true">
            ▣
          </span>
          <span>
            <strong>{folderName ?? 'Рабочая папка'}</strong>
            <small>документы и реестр</small>
          </span>
        </div>

        <div className="tree-folder tree-folder--nested">
          <span className="tree-folder__icon" aria-hidden="true">
            ▤
          </span>
          <span>
            <strong>Документы</strong>
            <small>{actType.code} / документы папки</small>
          </span>
        </div>

        <div className="act-tree-list" role="list" aria-label={`Порядок актов ${actType.code}`}>
          {drafts.map((draft, index) => (
            <button
              aria-pressed={draft.id === selectedDraftId}
              className="act-tree-item"
              data-dragging={draggedDraftId === draft.id ? 'true' : undefined}
              draggable
              key={draft.id}
              onClick={() => {
                onSelectDraft(draft.id);
              }}
              onDragEnd={onDragEnd}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDragStart={() => {
                onDragStart(draft.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                onReorderDrafts(draft.id);
              }}
              type="button"
            >
              <span className="act-tree-item__drag" aria-hidden="true">
                ::
              </span>
              <span className="act-tree-item__index">{index + 1}</span>
              <span className="act-tree-item__number">
                {draft.actNumber.trim() === '' ? 'Без номера' : draft.actNumber}
              </span>
              <span className="act-tree-item__meta">
                <small>{draft.templateMode === 'manual' ? 'Ручная версия' : 'По шаблону'}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
