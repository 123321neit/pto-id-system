import { useState } from 'react';

import {
  addMaterialCertificateToDraft,
  addRepresentativeToDraft,
  demoAosrWorkspace,
  getDraftApplications,
  getDraftMaterialCertificates,
  getDraftRepresentatives,
  moveRepresentativeInDraft,
  removeMaterialCertificateFromDraft,
  removeRepresentativeFromDraft,
  reorderDraftRepresentatives,
  toggleDerivedAttachmentInDraft,
  updateDemoAosrDraftField,
  updateDemoObjectDefaultsField,
  type DemoAosrDraft,
  type DemoAosrDraftField,
  type DemoAosrObjectDefaults,
  type DemoAosrObjectDefaultsField,
} from './demo-aosr-workspace.js';

type MoveDirection = 'up' | 'down';

export function DemoAosrWorkspacePage(): React.JSX.Element {
  const [objectDefaults, setObjectDefaults] = useState<DemoAosrObjectDefaults>(
    demoAosrWorkspace.objectDefaults,
  );
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [selectedDraftId, setSelectedDraftId] = useState(demoAosrWorkspace.drafts[0]?.id ?? '');
  const [draggedDraftId, setDraggedDraftId] = useState<string | null>(null);
  const [draggedRepresentativeId, setDraggedRepresentativeId] = useState<string | null>(null);
  const selectedDraft = getSelectedDraft(drafts, selectedDraftId);
  const selectedSignatories = getDraftRepresentatives(
    selectedDraft,
    objectDefaults.representativeLibrary,
  );
  const selectedMaterials = getDraftMaterialCertificates(
    selectedDraft,
    demoAosrWorkspace.certificateLibrary,
  );
  const finalApplications = getDraftApplications(
    selectedDraft,
    demoAosrWorkspace.certificateLibrary,
    demoAosrWorkspace.derivedAttachmentLibrary,
  );

  const updateObjectDefaults = (field: DemoAosrObjectDefaultsField, value: string): void => {
    setObjectDefaults((currentDefaults) =>
      updateDemoObjectDefaultsField(currentDefaults, field, value),
    );
  };

  const updateSelectedDraft = (field: DemoAosrDraftField, value: string): void => {
    updateSelectedDraftWith((draft) => updateDemoAosrDraftField(draft, field, value));
  };

  const updateSelectedDraftWith = (updater: (draft: DemoAosrDraft) => DemoAosrDraft): void => {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === selectedDraft.id ? updater(draft) : draft)),
    );
  };

  const moveSelectedSignatory = (representativeId: string, direction: MoveDirection): void => {
    updateSelectedDraftWith((draft) =>
      moveRepresentativeInDraft(draft, representativeId, direction),
    );
  };

  const reorderSelectedSignatory = (targetRepresentativeId: string): void => {
    if (draggedRepresentativeId === null || draggedRepresentativeId === targetRepresentativeId) {
      return;
    }

    updateSelectedDraftWith((draft) =>
      reorderDraftRepresentatives(draft, draggedRepresentativeId, targetRepresentativeId),
    );
    setDraggedRepresentativeId(null);
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
          <h1 id="workspace-title">{objectDefaults.projectName}</h1>
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
            <h2 id="act-form-title">Данные объекта и текущего акта</h2>
          </div>

          <div className="scope-switch" aria-label="Разделение уровней данных">
            <span>Данные объекта</span>
            <span>Текущий акт</span>
          </div>

          <div className="form-sections">
            <section
              className="form-section form-section--scope"
              aria-labelledby="object-data-title"
            >
              <div className="scope-heading">
                <p className="scope-label">Данные объекта</p>
                <h3 id="object-data-title">Объектовые значения по умолчанию</h3>
              </div>

              <div className="act-form-grid">
                <label className="act-form-grid__wide">
                  Название проекта / объекта
                  <input
                    name="projectName"
                    onChange={(event) => {
                      updateObjectDefaults('projectName', event.currentTarget.value);
                    }}
                    value={objectDefaults.projectName}
                  />
                </label>
                <label className="act-form-grid__wide">
                  Объект капитального строительства
                  <input
                    name="objectName"
                    onChange={(event) => {
                      updateObjectDefaults('objectName', event.currentTarget.value);
                    }}
                    value={objectDefaults.objectName}
                  />
                </label>
                <label className="act-form-grid__wide">
                  Компании и объектовые данные
                  <textarea
                    name="companySummary"
                    onChange={(event) => {
                      updateObjectDefaults('companySummary', event.currentTarget.value);
                    }}
                    rows={4}
                    value={objectDefaults.companySummary}
                  />
                </label>
                <label className="act-form-grid__wide">
                  Проектная документация по умолчанию
                  <textarea
                    className="large-field"
                    name="defaultProjectDocumentation"
                    onChange={(event) => {
                      updateObjectDefaults(
                        'defaultProjectDocumentation',
                        event.currentTarget.value,
                      );
                    }}
                    rows={7}
                    value={objectDefaults.defaultProjectDocumentation}
                  />
                </label>
              </div>

              <div className="library-panel" aria-labelledby="representative-library-title">
                <div>
                  <h4 id="representative-library-title">Библиотека представителей объекта</h4>
                  <p className="helper-note">
                    Представителей добавляем в текущий акт из объектовой библиотеки.
                  </p>
                </div>
                <div
                  className="library-list"
                  role="list"
                  aria-label="Библиотека представителей объекта"
                >
                  {objectDefaults.representativeLibrary.map((representative) => {
                    const isInCurrentAct = selectedDraft.representativeIds.includes(
                      representative.id,
                    );

                    return (
                      <div className="library-row" key={representative.id} role="listitem">
                        <span>
                          <strong>{representative.name}</strong>
                          <small>
                            {representative.role} / {representative.company}
                          </small>
                          <small>{representative.basis}</small>
                        </span>
                        <button
                          disabled={isInCurrentAct}
                          onClick={() => {
                            updateSelectedDraftWith((draft) =>
                              addRepresentativeToDraft(draft, representative.id),
                            );
                          }}
                          type="button"
                        >
                          {isInCurrentAct ? 'В акте' : 'Добавить'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section
              className="form-section form-section--scope"
              aria-labelledby="current-act-title"
            >
              <div className="scope-heading">
                <p className="scope-label">Текущий акт</p>
                <h3 id="current-act-title">Поля АОСР</h3>
              </div>

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

              <section className="form-section" aria-labelledby="act-location-data-title">
                <h3 id="act-location-data-title">Место и границы работ</h3>
                <div className="act-form-grid">
                  <label className="act-form-grid__wide">
                    Участок / место работ
                    <input
                      name="location"
                      onChange={(event) => {
                        updateSelectedDraft('location', event.currentTarget.value);
                      }}
                      value={selectedDraft.location}
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
                <h3 id="commission-data-title">Комиссия / подписанты текущего акта</h3>
                <ol className="signatory-order-list" aria-label="Порядок подписантов">
                  {selectedSignatories.map((representative, index) => (
                    <li
                      className="signatory-order-item"
                      draggable
                      key={representative.id}
                      onDragEnd={() => {
                        setDraggedRepresentativeId(null);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                      }}
                      onDragStart={() => {
                        setDraggedRepresentativeId(representative.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        reorderSelectedSignatory(representative.id);
                      }}
                    >
                      <span className="signatory-order-item__drag" aria-hidden="true">
                        ::
                      </span>
                      <span className="signatory-order-item__position">{index + 1}</span>
                      <span>
                        <strong>{representative.role}</strong>
                        <small>
                          {representative.name} / {representative.company}
                        </small>
                      </span>
                      <span className="signatory-order-item__actions">
                        <button
                          aria-label={`Переместить ${representative.name} вверх`}
                          disabled={index === 0}
                          onClick={() => {
                            moveSelectedSignatory(representative.id, 'up');
                          }}
                          type="button"
                        >
                          Вверх
                        </button>
                        <button
                          aria-label={`Переместить ${representative.name} вниз`}
                          disabled={index === selectedSignatories.length - 1}
                          onClick={() => {
                            moveSelectedSignatory(representative.id, 'down');
                          }}
                          type="button"
                        >
                          Вниз
                        </button>
                        <button
                          aria-label={`Убрать ${representative.name} из акта`}
                          onClick={() => {
                            updateSelectedDraftWith((draft) =>
                              removeRepresentativeFromDraft(draft, representative.id),
                            );
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
                <p className="readonly-field">{objectDefaults.defaultProjectDocumentation}</p>
                <p className="helper-note">
                  Для этого демо блок берется из объектовых значений по умолчанию.
                </p>
              </section>

              <section className="form-section" aria-labelledby="materials-data-title">
                <h3 id="materials-data-title">Материалы из библиотеки сертификатов</h3>
                <p className="placeholder-note">
                  В реальной системе материал добавляется из библиотеки сертификатов
                </p>

                <div
                  className="library-list"
                  role="list"
                  aria-label="Мок-библиотека сертификатов и материалов"
                >
                  {demoAosrWorkspace.certificateLibrary.map((certificate) => {
                    const isSelected = selectedDraft.materialCertificateIds.includes(
                      certificate.id,
                    );

                    return (
                      <div className="library-row" key={certificate.id} role="listitem">
                        <span>
                          <strong>{certificate.materialName}</strong>
                          <small>{certificate.certificateNumber}</small>
                          <small>{certificate.documentName}</small>
                        </span>
                        <button
                          disabled={isSelected}
                          onClick={() => {
                            updateSelectedDraftWith((draft) =>
                              addMaterialCertificateToDraft(draft, certificate.id),
                            );
                          }}
                          type="button"
                        >
                          {isSelected ? 'Выбрано' : 'Добавить'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="selected-list" aria-labelledby="selected-materials-title">
                  <h4 id="selected-materials-title">Материалы в текущем акте</h4>
                  {selectedMaterials.length > 0 ? (
                    <ul aria-label="Выбранные материалы текущего акта">
                      {selectedMaterials.map((certificate) => (
                        <li key={certificate.id}>
                          <span>
                            <strong>{certificate.materialName}</strong>
                            <small>
                              {certificate.certificateNumber} / {certificate.documentName}
                            </small>
                          </span>
                          <button
                            aria-label={`Убрать материал ${certificate.materialName}`}
                            onClick={() => {
                              updateSelectedDraftWith((draft) =>
                                removeMaterialCertificateFromDraft(draft, certificate.id),
                              );
                            }}
                            type="button"
                          >
                            Убрать
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">Материалы для текущего акта пока не выбраны.</p>
                  )}
                </div>
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

              <section className="form-section" aria-labelledby="attachments-data-title">
                <h3 id="attachments-data-title">Производные приложения</h3>
                <p className="helper-note">
                  Итоговый блок приложений формируется в самом конце акта из выбранных сертификатов
                  и структурированных демо-источников.
                </p>
                <div
                  className="attachment-options"
                  role="group"
                  aria-label="Структурированные демо-приложения"
                >
                  {demoAosrWorkspace.derivedAttachmentLibrary.map((attachment) => (
                    <label className="checkbox-row" key={attachment.id}>
                      <input
                        checked={selectedDraft.derivedAttachmentIds.includes(attachment.id)}
                        onChange={() => {
                          updateSelectedDraftWith((draft) =>
                            toggleDerivedAttachmentInDraft(draft, attachment.id),
                          );
                        }}
                        type="checkbox"
                      />
                      <span>
                        <strong>{attachment.title}</strong>
                        <small>{attachment.reference}</small>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="selected-list" aria-labelledby="final-applications-title">
                  <h4 id="final-applications-title">Итоговые приложения в акте</h4>
                  <ol aria-label="Итоговые приложения текущего акта">
                    {finalApplications.map((application) => (
                      <li key={application.id}>
                        <span>
                          <strong>{application.title}</strong>
                          <small>{application.source}</small>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
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
                <p>ДЕМО-макет формы АОСР</p>
                <h3>Акт освидетельствования скрытых работ</h3>
                <div className="act-page__header-row">
                  <span>{selectedDraft.actPlace}</span>
                  <strong>{selectedDraft.actNumber}</strong>
                  <span>{selectedDraft.actDate}</span>
                </div>
              </header>

              <section className="act-page__official-section" aria-label="Объект и проект">
                <h4>1. Объект капитального строительства</h4>
                <p>{objectDefaults.objectName}</p>
                <dl className="act-page__compact-grid">
                  <div>
                    <dt>Проект</dt>
                    <dd>{objectDefaults.projectName}</dd>
                  </div>
                  <div>
                    <dt>Участок работ</dt>
                    <dd>{selectedDraft.location}</dd>
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
                <p>{objectDefaults.companySummary}</p>
              </section>

              <section className="act-page__official-section" aria-label="Комиссия">
                <h4>2. Комиссия, составившая акт</h4>
                <ol className="act-page__ordered-list">
                  {selectedSignatories.map((representative) => (
                    <li key={representative.id}>
                      <span>{representative.role}</span>
                      <strong>{representative.name}</strong>
                      <span>
                        {representative.company}; {representative.basis}
                      </span>
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
                <p>{objectDefaults.defaultProjectDocumentation}</p>
              </section>

              <section className="act-page__official-section" aria-label="Материалы и сертификаты">
                <h4>5. Примененные материалы, изделия, сертификаты и паспорта</h4>
                {selectedMaterials.length > 0 ? (
                  <ol className="act-page__ordered-list">
                    {selectedMaterials.map((certificate) => (
                      <li key={certificate.id}>
                        <span>{certificate.materialName}</span>
                        <strong>{certificate.certificateNumber}</strong>
                        <span>{certificate.documentName}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Материалы из демо-библиотеки сертификатов не выбраны.</p>
                )}
              </section>

              <section className="act-page__official-section" aria-label="Период работ">
                <h4>6. Даты выполнения работ</h4>
                <p>
                  Работы выполнены в период с {selectedDraft.periodStart} по{' '}
                  {selectedDraft.periodEnd}.
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Решение комиссии">
                <h4>7. Решение комиссии</h4>
                <p>{selectedDraft.subsequentWorksPermitted}</p>
              </section>

              <section className="act-page__official-section" aria-label="Подписи">
                <h4>8. Подписи представителей</h4>
                <div className="act-page__signature-table">
                  {selectedSignatories.map((representative) => (
                    <div key={representative.id}>
                      <span>{representative.role}</span>
                      <strong>{representative.name}</strong>
                      <span className="act-page__signature-line">подпись</span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="act-page__official-section act-page__official-section--final"
                aria-label="Приложения"
              >
                <h4>9. Приложения к акту</h4>
                <ol className="act-page__ordered-list">
                  {finalApplications.map((application) => (
                    <li key={application.id}>
                      <span>{application.title}</span>
                      <strong>{application.source}</strong>
                    </li>
                  ))}
                </ol>
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
