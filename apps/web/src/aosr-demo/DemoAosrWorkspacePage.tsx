import { useState } from 'react';

import {
  demoAosrWorkspace,
  updateDemoAosrDraftField,
  type DemoAosrDraft,
  type DemoAosrDraftField,
} from './demo-aosr-workspace.js';

type MoveDirection = 'up' | 'down';

export function DemoAosrWorkspacePage(): React.JSX.Element {
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [selectedDraftId, setSelectedDraftId] = useState(demoAosrWorkspace.drafts[0]?.id ?? '');
  const [draggedDraftId, setDraggedDraftId] = useState<string | null>(null);
  const selectedDraft = getSelectedDraft(drafts, selectedDraftId);

  const updateSelectedDraft = (field: DemoAosrDraftField, value: string): void => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === selectedDraft.id ? updateDemoAosrDraftField(draft, field, value) : draft,
      ),
    );
  };

  const moveSelectedSignatory = (signatoryId: string, direction: MoveDirection): void => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === selectedDraft.id
          ? {
              ...draft,
              signatories: moveItem(draft.signatories, signatoryId, direction),
            }
          : draft,
      ),
    );
  };

  const reorderDrafts = (targetDraftId: string): void => {
    if (draggedDraftId === null || draggedDraftId === targetDraftId) {
      return;
    }

    setDrafts((currentDrafts) => moveItemBefore(currentDrafts, draggedDraftId, targetDraftId));
    setDraggedDraftId(null);
  };

  return (
    <main className="demo-shell">
      <section className="workspace-header" aria-labelledby="workspace-title">
        <div>
          <p className="demo-pill">{demoAosrWorkspace.demoNotice}</p>
          <h1 id="workspace-title">{demoAosrWorkspace.projectName}</h1>
          <p className="workspace-header__meta">
            {demoAosrWorkspace.name} / {demoAosrWorkspace.projectCode} /{' '}
            {demoAosrWorkspace.ownerName}
          </p>
        </div>
        <dl className="workspace-summary" aria-label="Сводка рабочей области">
          <div>
            <dt>Черновики</dt>
            <dd>{drafts.length}</dd>
          </div>
          <div>
            <dt>Выбран акт</dt>
            <dd>{selectedDraft.actNumber}</dd>
          </div>
        </dl>
      </section>

      <div className="workspace-grid">
        <section className="document-tree-panel" aria-labelledby="document-tree-title">
          <div className="panel-heading">
            <p className="section-kicker">Документы</p>
            <h2 id="document-tree-title">Дерево проекта</h2>
          </div>

          <div className="document-tree" aria-label="Дерево документов">
            <div className="tree-folder">
              <span className="tree-folder__chevron" aria-hidden="true">
                /
              </span>
              <span>
                <strong>АОСР</strong>
                <small>{drafts.length} черновика</small>
              </span>
            </div>

            <div className="act-tree-list" role="list" aria-label="Порядок актов АОСР">
              {drafts.map((draft, index) => (
                <button
                  aria-pressed={draft.id === selectedDraft.id}
                  className="act-tree-item"
                  draggable
                  key={draft.id}
                  onClick={() => {
                    setSelectedDraftId(draft.id);
                  }}
                  onDragEnd={() => {
                    setDraggedDraftId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDragStart={() => {
                    setDraggedDraftId(draft.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    reorderDrafts(draft.id);
                  }}
                  type="button"
                >
                  <span className="act-tree-item__drag" aria-hidden="true">
                    ::
                  </span>
                  <span className="act-tree-item__index">{index + 1}</span>
                  <span className="act-tree-item__number">{draft.actNumber}</span>
                  <span className={`act-tree-item__status act-tree-item__status--${draft.status}`}>
                    {draft.status === 'draft' ? 'Черновик' : 'На проверку'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="act-form-panel" aria-labelledby="act-form-title">
          <div className="panel-heading">
            <p className="section-kicker">Редактируемая демо-форма</p>
            <h2 id="act-form-title">Поля акта в порядке печатной формы</h2>
          </div>

          <div className="form-sections">
            <section className="form-section" aria-labelledby="act-header-data-title">
              <h3 id="act-header-data-title">Шапка акта</h3>
              <div className="act-form-grid">
                <label>
                  Номер акта
                  <input
                    name="actNumber"
                    onChange={(event) => {
                      updateSelectedDraft('actNumber', event.currentTarget.value);
                    }}
                    value={selectedDraft.actNumber}
                  />
                </label>
                <label>
                  Место составления
                  <input
                    name="actPlace"
                    onChange={(event) => {
                      updateSelectedDraft('actPlace', event.currentTarget.value);
                    }}
                    value={selectedDraft.actPlace}
                  />
                </label>
                <label>
                  Дата акта
                  <input
                    name="actDate"
                    onChange={(event) => {
                      updateSelectedDraft('actDate', event.currentTarget.value);
                    }}
                    type="date"
                    value={selectedDraft.actDate}
                  />
                </label>
              </div>
            </section>

            <section className="form-section" aria-labelledby="object-project-data-title">
              <h3 id="object-project-data-title">Объект / проект</h3>
              <div className="act-form-grid">
                <label className="act-form-grid__wide">
                  Объект / участок
                  <input
                    name="objectName"
                    onChange={(event) => {
                      updateSelectedDraft('objectName', event.currentTarget.value);
                    }}
                    value={selectedDraft.objectName}
                  />
                </label>
                <label>
                  Оси
                  <input
                    name="axes"
                    onChange={(event) => {
                      updateSelectedDraft('axes', event.currentTarget.value);
                    }}
                    value={selectedDraft.axes}
                  />
                </label>
                <label>
                  Отметка или диапазон отметок
                  <input
                    name="elevationRange"
                    onChange={(event) => {
                      updateSelectedDraft('elevationRange', event.currentTarget.value);
                    }}
                    value={selectedDraft.elevationRange}
                  />
                </label>
              </div>
            </section>

            <section className="form-section" aria-labelledby="commission-data-title">
              <h3 id="commission-data-title">Комиссия / подписанты</h3>
              <ol className="signatory-order-list" aria-label="Порядок подписантов">
                {selectedDraft.signatories.map((signatory, index) => (
                  <li className="signatory-order-item" key={signatory.id}>
                    <span className="signatory-order-item__position">{index + 1}</span>
                    <span>
                      <strong>{signatory.role}</strong>
                      <small>{signatory.name}</small>
                    </span>
                    <span className="signatory-order-item__actions">
                      <button
                        aria-label={`Поднять ${signatory.name}`}
                        disabled={index === 0}
                        onClick={() => {
                          moveSelectedSignatory(signatory.id, 'up');
                        }}
                        type="button"
                      >
                        Вверх
                      </button>
                      <button
                        aria-label={`Опустить ${signatory.name}`}
                        disabled={index === selectedDraft.signatories.length - 1}
                        onClick={() => {
                          moveSelectedSignatory(signatory.id, 'down');
                        }}
                        type="button"
                      >
                        Вниз
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="form-section" aria-labelledby="hidden-works-data-title">
              <h3 id="hidden-works-data-title">Предъявленные скрытые работы</h3>
              <label className="act-form-grid__wide">
                Описание скрытых работ
                <textarea
                  className="large-field"
                  name="workDescription"
                  onChange={(event) => {
                    updateSelectedDraft('workDescription', event.currentTarget.value);
                  }}
                  rows={8}
                  value={selectedDraft.workDescription}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="project-docs-data-title">
              <h3 id="project-docs-data-title">Проектная документация</h3>
              <label className="act-form-grid__wide">
                Рабочие чертежи / листы
                <textarea
                  className="large-field"
                  name="documentReferences"
                  onChange={(event) => {
                    updateSelectedDraft('documentReferences', event.currentTarget.value);
                  }}
                  rows={7}
                  value={selectedDraft.documentReferences}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="materials-data-title">
              <h3 id="materials-data-title">Материалы и сертификаты</h3>
              <label className="act-form-grid__wide">
                Материалы / сертификаты простым текстом
                <textarea
                  className="large-field"
                  name="materialsCertificates"
                  onChange={(event) => {
                    updateSelectedDraft('materialsCertificates', event.currentTarget.value);
                  }}
                  rows={7}
                  value={selectedDraft.materialsCertificates}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="attachments-data-title">
              <h3 id="attachments-data-title">Приложения</h3>
              <label className="act-form-grid__wide">
                Приложения / исполнительные схемы простым текстом
                <textarea
                  className="large-field"
                  name="attachments"
                  onChange={(event) => {
                    updateSelectedDraft('attachments', event.currentTarget.value);
                  }}
                  rows={6}
                  value={selectedDraft.attachments}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="period-data-title">
              <h3 id="period-data-title">Период выполнения работ</h3>
              <div className="act-form-grid">
                <label>
                  Работы выполнялись с
                  <input
                    name="periodStart"
                    onChange={(event) => {
                      updateSelectedDraft('periodStart', event.currentTarget.value);
                    }}
                    type="date"
                    value={selectedDraft.periodStart}
                  />
                </label>
                <label>
                  Работы выполнялись по
                  <input
                    name="periodEnd"
                    onChange={(event) => {
                      updateSelectedDraft('periodEnd', event.currentTarget.value);
                    }}
                    type="date"
                    value={selectedDraft.periodEnd}
                  />
                </label>
              </div>
            </section>

            <section className="form-section" aria-labelledby="decision-data-title">
              <h3 id="decision-data-title">Решение комиссии</h3>
              <label className="act-form-grid__wide">
                Последующие работы разрешены
                <textarea
                  className="large-field"
                  name="subsequentWorksPermitted"
                  onChange={(event) => {
                    updateSelectedDraft('subsequentWorksPermitted', event.currentTarget.value);
                  }}
                  rows={6}
                  value={selectedDraft.subsequentWorksPermitted}
                />
              </label>
            </section>
          </div>
        </section>

        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <p className="section-kicker">HTML-макет печатной формы</p>
            <h2 id="preview-title">Предпросмотр АОСР</h2>
          </div>
          <article className="act-page" aria-label="Демо-предпросмотр печатной формы АОСР">
            <div className="act-page__sheet">
              <p className="act-page__demo-label">{demoAosrWorkspace.demoNotice}</p>
              <p className="act-page__placeholder">
                Позже здесь будет реальный PDF/печатная форма акта
              </p>

              <header className="act-page__official-header">
                <p>Унифицированная демонстрационная HTML-форма</p>
                <h3>Акт освидетельствования скрытых работ</h3>
                <div className="act-page__header-row">
                  <span>{selectedDraft.actPlace}</span>
                  <strong>{selectedDraft.actNumber}</strong>
                  <span>{selectedDraft.actDate}</span>
                </div>
              </header>

              <section className="act-page__official-section" aria-label="Объект и проект">
                <h4>1. Объект капитального строительства</h4>
                <p>{demoAosrWorkspace.projectName}</p>
                <dl className="act-page__compact-grid">
                  <div>
                    <dt>Участок работ</dt>
                    <dd>{selectedDraft.objectName}</dd>
                  </div>
                  <div>
                    <dt>Оси</dt>
                    <dd>{selectedDraft.axes}</dd>
                  </div>
                  <div>
                    <dt>Отметка</dt>
                    <dd>{selectedDraft.elevationRange}</dd>
                  </div>
                </dl>
              </section>

              <section className="act-page__official-section" aria-label="Комиссия">
                <h4>2. Комиссия, составившая акт</h4>
                <ol className="act-page__ordered-list">
                  {selectedDraft.signatories.map((signatory) => (
                    <li key={signatory.id}>
                      <span>{signatory.role}</span>
                      <strong>{signatory.name}</strong>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="act-page__official-section" aria-label="Скрытые работы">
                <h4>3. К освидетельствованию предъявлены следующие скрытые работы</h4>
                <p>{selectedDraft.workDescription}</p>
              </section>

              <section className="act-page__official-section" aria-label="Проектная документация">
                <h4>4. Работы выполнены по проектной документации</h4>
                <p>{selectedDraft.documentReferences}</p>
              </section>

              <section className="act-page__official-section" aria-label="Материалы и сертификаты">
                <h4>5. Примененные материалы, изделия, сертификаты и паспорта</h4>
                <p>{selectedDraft.materialsCertificates}</p>
              </section>

              <section className="act-page__official-section" aria-label="Приложения">
                <h4>6. Приложения к акту</h4>
                <p>{selectedDraft.attachments}</p>
              </section>

              <section className="act-page__official-section" aria-label="Период работ">
                <h4>7. Даты выполнения работ</h4>
                <p>
                  Работы выполнены в период с {selectedDraft.periodStart} по{' '}
                  {selectedDraft.periodEnd}.
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Решение комиссии">
                <h4>8. Решение комиссии</h4>
                <p>{selectedDraft.subsequentWorksPermitted}</p>
              </section>

              <section className="act-page__official-section" aria-label="Подписи">
                <h4>9. Подписи представителей</h4>
                <div className="act-page__signature-table">
                  {selectedDraft.signatories.map((signatory) => (
                    <div key={signatory.id}>
                      <span>{signatory.role}</span>
                      <strong>{signatory.name}</strong>
                      <span className="act-page__signature-line">подпись</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function getSelectedDraft(
  drafts: readonly DemoAosrDraft[],
  selectedDraftId: string,
): DemoAosrDraft {
  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0];

  if (!selectedDraft) {
    throw new Error('Для демо-рабочей области АОСР нужен хотя бы один черновик.');
  }

  return selectedDraft;
}

function moveItem<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  itemId: string,
  direction: MoveDirection,
): readonly TItem[] {
  const currentIndex = items.findIndex((item) => item.id === itemId);

  if (currentIndex < 0) {
    return items;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const currentItem = nextItems[currentIndex];
  const targetItem = nextItems[targetIndex];

  if (currentItem === undefined || targetItem === undefined) {
    return items;
  }

  nextItems[currentIndex] = targetItem;
  nextItems[targetIndex] = currentItem;

  return nextItems;
}

function moveItemBefore<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  itemId: string,
  targetItemId: string,
): readonly TItem[] {
  const itemIndex = items.findIndex((item) => item.id === itemId);
  const targetIndex = items.findIndex((item) => item.id === targetItemId);

  if (itemIndex < 0 || targetIndex < 0 || itemIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(itemIndex, 1);

  if (item === undefined) {
    return items;
  }

  const adjustedTargetIndex = itemIndex < targetIndex ? targetIndex - 1 : targetIndex;
  nextItems.splice(adjustedTargetIndex, 0, item);

  return nextItems;
}
