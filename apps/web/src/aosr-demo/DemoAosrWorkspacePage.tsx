import { useState } from 'react';

import {
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

          <div className="form-sections">
            <section className="form-section" aria-labelledby="general-act-data-title">
              <h3 id="general-act-data-title">Общие данные акта</h3>
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
              </div>
            </section>

            <section className="form-section" aria-labelledby="work-place-data-title">
              <h3 id="work-place-data-title">Данные объекта и места работ</h3>
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

            <section className="form-section" aria-labelledby="hidden-works-data-title">
              <h3 id="hidden-works-data-title">Выполненные скрытые работы</h3>
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
            </section>

            <section className="form-section" aria-labelledby="project-docs-data-title">
              <h3 id="project-docs-data-title">Проектная документация</h3>
              <label className="act-form-grid__wide">
                Рабочие чертежи / листы
                <textarea
                  name="documentReferences"
                  onChange={(event) => {
                    updateSelectedDraft('documentReferences', event.currentTarget.value);
                  }}
                  rows={3}
                  value={selectedDraft.documentReferences}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="materials-data-title">
              <h3 id="materials-data-title">Материалы и сертификаты</h3>
              <label className="act-form-grid__wide">
                Материалы / сертификаты простым текстом
                <textarea
                  name="materialsCertificates"
                  onChange={(event) => {
                    updateSelectedDraft('materialsCertificates', event.currentTarget.value);
                  }}
                  rows={4}
                  value={selectedDraft.materialsCertificates}
                />
              </label>
            </section>

            <section className="form-section" aria-labelledby="signatories-data-title">
              <h3 id="signatories-data-title">Представители / подписанты</h3>
              <div className="act-form-grid">
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
              </div>
            </section>
          </div>
        </section>

        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <p className="section-kicker">Демо-предпросмотр</p>
            <h2 id="preview-title">Лист акта</h2>
          </div>
          <article className="act-page" aria-label="Демо-предпросмотр печатной формы АОСР">
            <div className="act-page__sheet">
              <p className="act-page__demo-label">{demoAosrWorkspace.demoNotice}</p>
              <p className="act-page__placeholder">
                Позже здесь будет реальный PDF/печатная форма акта
              </p>

              <header className="act-page__header">
                <p>Демонстрационная печатная форма</p>
                <h3>Акт освидетельствования скрытых работ</h3>
                <p>
                  {selectedDraft.actNumber} от {selectedDraft.actDate}
                </p>
              </header>

              <section className="act-page__section" aria-label="Общие сведения акта">
                <h4>1. Общие сведения</h4>
                <dl>
                  <div>
                    <dt>Проект</dt>
                    <dd>{demoAosrWorkspace.projectName}</dd>
                  </div>
                  <div>
                    <dt>Период выполнения работ</dt>
                    <dd>
                      с {selectedDraft.periodStart} по {selectedDraft.periodEnd}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="act-page__section" aria-label="Место выполнения работ">
                <h4>2. Место выполнения работ</h4>
                <dl>
                  <div>
                    <dt>Объект / участок</dt>
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

              <section className="act-page__section" aria-label="Выполненные скрытые работы">
                <h4>3. Выполненные скрытые работы</h4>
                <p>{selectedDraft.workDescription}</p>
              </section>

              <section className="act-page__section" aria-label="Проектная документация">
                <h4>4. Проектная документация</h4>
                <p>{selectedDraft.documentReferences}</p>
              </section>

              <section className="act-page__section" aria-label="Материалы и сертификаты">
                <h4>5. Материалы и сертификаты</h4>
                <p>{selectedDraft.materialsCertificates}</p>
              </section>

              <section className="act-page__section" aria-label="Представители и подписанты">
                <h4>6. Представители / подписанты</h4>
                <dl>
                  <div>
                    <dt>Подрядчик</dt>
                    <dd>{selectedDraft.contractorRepresentative}</dd>
                  </div>
                  <div>
                    <dt>Заказчик / стройконтроль</dt>
                    <dd>{selectedDraft.customerRepresentative}</dd>
                  </div>
                </dl>
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
