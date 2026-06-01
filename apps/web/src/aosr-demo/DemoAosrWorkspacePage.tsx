import { useState } from 'react';

import {
  buildDemoAosrPreviewLines,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
  type DemoAosrDraft,
  type DemoAosrDraftField,
} from './demo-aosr-workspace.js';

export function DemoAosrWorkspacePage(): React.JSX.Element {
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [selectedDraftId, setSelectedDraftId] = useState(demoAosrWorkspace.drafts[0]?.id ?? '');
  const selectedDraft = getSelectedDraft(drafts, selectedDraftId);

  const updateSelectedDraft = (field: DemoAosrDraftField, value: string): void => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === selectedDraft.id ? updateDemoAosrDraftField(draft, field, value) : draft,
      ),
    );
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
        <section className="draft-list-panel" aria-labelledby="draft-list-title">
          <div className="panel-heading">
            <p className="section-kicker">АОСР</p>
            <h2 id="draft-list-title">Черновики актов</h2>
          </div>
          <div className="draft-list" role="list">
            {drafts.map((draft) => (
              <button
                aria-pressed={draft.id === selectedDraft.id}
                className="draft-card"
                key={draft.id}
                onClick={() => {
                  setSelectedDraftId(draft.id);
                }}
                type="button"
              >
                <span className="draft-card__number">{draft.actNumber}</span>
                <span className="draft-card__object">{draft.objectName}</span>
                <span className={`draft-card__status draft-card__status--${draft.status}`}>
                  {draft.status === 'draft' ? 'Черновик' : 'На проверку'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="act-form-panel" aria-labelledby="act-form-title">
          <div className="panel-heading">
            <p className="section-kicker">Редактируемая демо-форма</p>
            <h2 id="act-form-title">Данные акта освидетельствования</h2>
          </div>
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
            <label>
              Период работ: с
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
              Период работ: по
              <input
                name="periodEnd"
                onChange={(event) => {
                  updateSelectedDraft('periodEnd', event.currentTarget.value);
                }}
                type="date"
                value={selectedDraft.periodEnd}
              />
            </label>
            <label>
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
            <label>
              Проектная документация
              <input
                name="documentReferences"
                onChange={(event) => {
                  updateSelectedDraft('documentReferences', event.currentTarget.value);
                }}
                value={selectedDraft.documentReferences}
              />
            </label>
            <label>
              Представитель подрядчика
              <input
                name="contractorRepresentative"
                onChange={(event) => {
                  updateSelectedDraft('contractorRepresentative', event.currentTarget.value);
                }}
                value={selectedDraft.contractorRepresentative}
              />
            </label>
            <label>
              Представитель заказчика / стройконтроля
              <input
                name="customerRepresentative"
                onChange={(event) => {
                  updateSelectedDraft('customerRepresentative', event.currentTarget.value);
                }}
                value={selectedDraft.customerRepresentative}
              />
            </label>
            <label className="act-form-grid__wide">
              Описание скрытых работ
              <textarea
                name="workDescription"
                onChange={(event) => {
                  updateSelectedDraft('workDescription', event.currentTarget.value);
                }}
                rows={5}
                value={selectedDraft.workDescription}
              />
            </label>
            <label className="act-form-grid__wide">
              Материалы / сертификаты
              <textarea
                name="materialsCertificates"
                onChange={(event) => {
                  updateSelectedDraft('materialsCertificates', event.currentTarget.value);
                }}
                rows={4}
                value={selectedDraft.materialsCertificates}
              />
            </label>
          </div>
        </section>

        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <p className="section-kicker">Концептуальный предпросмотр</p>
            <h2 id="preview-title">Как будет выглядеть АОСР</h2>
          </div>
          <article className="act-preview" aria-label="Концептуальный предпросмотр АОСР">
            <p className="act-preview__label">{demoAosrWorkspace.demoNotice}</p>
            <p className="act-preview__muted">
              Предпросмотр структуры, не официальный печатный шаблон
            </p>
            <h3>Акт освидетельствования скрытых работ</h3>
            <p className="act-preview__headline">
              {selectedDraft.actNumber} от {selectedDraft.actDate}
            </p>
            <dl>
              {buildDemoAosrPreviewLines(selectedDraft).map((line) => {
                const [term, value] = splitPreviewLine(line);

                return (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                );
              })}
            </dl>
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

function splitPreviewLine(line: string): readonly [string, string] {
  const separatorIndex = line.indexOf(':');

  if (separatorIndex === -1) {
    return [line, ''];
  }

  return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1).trim()];
}
