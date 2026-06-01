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
        <dl className="workspace-summary" aria-label="Workspace summary">
          <div>
            <dt>Drafts</dt>
            <dd>{drafts.length}</dd>
          </div>
          <div>
            <dt>Selected</dt>
            <dd>{selectedDraft.actNumber}</dd>
          </div>
        </dl>
      </section>

      <div className="workspace-grid">
        <section className="draft-list-panel" aria-labelledby="draft-list-title">
          <div className="panel-heading">
            <p className="section-kicker">AOSR</p>
            <h2 id="draft-list-title">Draft queue</h2>
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
                  {draft.status === 'draft' ? 'Draft' : 'Needs review'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="act-form-panel" aria-labelledby="act-form-title">
          <div className="panel-heading">
            <p className="section-kicker">Editable mock form</p>
            <h2 id="act-form-title">Basic act data</h2>
          </div>
          <div className="act-form-grid">
            <label>
              Act number
              <input
                name="actNumber"
                onChange={(event) => {
                  updateSelectedDraft('actNumber', event.currentTarget.value);
                }}
                value={selectedDraft.actNumber}
              />
            </label>
            <label>
              Act date
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
              Object / area
              <input
                name="objectName"
                onChange={(event) => {
                  updateSelectedDraft('objectName', event.currentTarget.value);
                }}
                value={selectedDraft.objectName}
              />
            </label>
            <label>
              Contractor
              <input
                name="contractorName"
                onChange={(event) => {
                  updateSelectedDraft('contractorName', event.currentTarget.value);
                }}
                value={selectedDraft.contractorName}
              />
            </label>
            <label>
              Inspector
              <input
                name="inspectorName"
                onChange={(event) => {
                  updateSelectedDraft('inspectorName', event.currentTarget.value);
                }}
                value={selectedDraft.inspectorName}
              />
            </label>
            <label>
              Design references
              <input
                name="documentReferences"
                onChange={(event) => {
                  updateSelectedDraft('documentReferences', event.currentTarget.value);
                }}
                value={selectedDraft.documentReferences}
              />
            </label>
            <label className="act-form-grid__wide">
              Work description
              <textarea
                name="workDescription"
                onChange={(event) => {
                  updateSelectedDraft('workDescription', event.currentTarget.value);
                }}
                rows={5}
                value={selectedDraft.workDescription}
              />
            </label>
          </div>
        </section>

        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <p className="section-kicker">Concept preview</p>
            <h2 id="preview-title">AOSR act view</h2>
          </div>
          <article className="act-preview" aria-label="AOSR conceptual preview">
            <p className="act-preview__label">{demoAosrWorkspace.demoNotice}</p>
            <h3>Act of hidden works inspection</h3>
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
    throw new Error('Demo AOSR workspace requires at least one draft.');
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
