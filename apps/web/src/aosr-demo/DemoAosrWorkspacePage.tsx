import { type SyntheticEvent, useState } from 'react';

import {
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  addRepresentativeToDraft,
  addRepresentativeToLibrary,
  demoAosrWorkspace,
  getDraftApplications,
  getDraftDerivedAttachments,
  getDraftMaterialCertificates,
  getDraftRepresentatives,
  moveHeaderOrganizationBlock,
  moveRepresentativeInDraft,
  removeMaterialCertificateFromDraft,
  removeRepresentativeFromDraft,
  reorderDraftRepresentatives,
  toggleDerivedAttachmentInDraft,
  updateDemoAosrDraftField,
  updateDemoObjectDefaultsField,
  type DemoAosrDraft,
  type DemoAosrDraftField,
  type DemoAosrHeaderOrganization,
  type DemoAosrObjectDefaults,
  type DemoAosrObjectDefaultsField,
  type DemoAosrRepresentative,
} from './demo-aosr-workspace.js';

type MoveDirection = 'up' | 'down';

interface HeaderOrganizationFormState {
  readonly label: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption: string;
}

interface RepresentativeFormState {
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId: string;
  readonly details: string;
}

const emptyHeaderOrganizationForm: HeaderOrganizationFormState = {
  caption: '',
  details: '',
  label: '',
  organizationName: '',
};

const emptyRepresentativeForm: RepresentativeFormState = {
  authorityBasis: '',
  details: '',
  fullName: '',
  nrsId: '',
  organization: '',
  position: '',
  roleLabel: '',
};

export function DemoAosrWorkspacePage(): React.JSX.Element {
  const [objectDefaults, setObjectDefaults] = useState<DemoAosrObjectDefaults>(
    demoAosrWorkspace.objectDefaults,
  );
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [selectedDraftId, setSelectedDraftId] = useState(demoAosrWorkspace.drafts[0]?.id ?? '');
  const [draggedDraftId, setDraggedDraftId] = useState<string | null>(null);
  const [draggedRepresentativeId, setDraggedRepresentativeId] = useState<string | null>(null);
  const [isObjectSettingsOpen, setObjectSettingsOpen] = useState(false);
  const [isHeaderOrganizationFormOpen, setHeaderOrganizationFormOpen] = useState(false);
  const [isRepresentativeLibraryOpen, setRepresentativeLibraryOpen] = useState(false);
  const [isRepresentativeLibraryFormOpen, setRepresentativeLibraryFormOpen] = useState(false);
  const [isActRepresentativePickerOpen, setActRepresentativePickerOpen] = useState(false);
  const [isManualRepresentativeFormOpen, setManualRepresentativeFormOpen] = useState(false);
  const [isCertificateLibraryOpen, setCertificateLibraryOpen] = useState(false);
  const [headerOrganizationForm, setHeaderOrganizationForm] = useState<HeaderOrganizationFormState>(
    emptyHeaderOrganizationForm,
  );
  const [libraryRepresentativeForm, setLibraryRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);
  const [manualRepresentativeForm, setManualRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);
  const [shouldAddManualRepresentativeToLibrary, setShouldAddManualRepresentativeToLibrary] =
    useState(false);
  const [createdHeaderOrganizationCount, setCreatedHeaderOrganizationCount] = useState(1);
  const [createdRepresentativeCount, setCreatedRepresentativeCount] = useState(1);
  const selectedDraft = getSelectedDraft(drafts, selectedDraftId);
  const selectedSignatories = getDraftRepresentatives(selectedDraft);
  const selectedMaterials = getDraftMaterialCertificates(
    selectedDraft,
    demoAosrWorkspace.certificateLibrary,
  );
  const selectedDerivedAttachments = getDraftDerivedAttachments(
    selectedDraft,
    demoAosrWorkspace.derivedAttachmentLibrary,
  );
  const finalApplications = getDraftApplications(
    selectedDraft,
    demoAosrWorkspace.certificateLibrary,
    demoAosrWorkspace.derivedAttachmentLibrary,
  );
  const executingOrganization = getExecutingOrganization(selectedSignatories, objectDefaults);

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

  const updateHeaderOrganizationForm = (
    field: keyof HeaderOrganizationFormState,
    value: string,
  ): void => {
    setHeaderOrganizationForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateLibraryRepresentativeForm = (
    field: keyof RepresentativeFormState,
    value: string,
  ): void => {
    setLibraryRepresentativeForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateManualRepresentativeForm = (
    field: keyof RepresentativeFormState,
    value: string,
  ): void => {
    setManualRepresentativeForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateHeaderOrganizationOrder = (
    headerOrganizationId: string,
    direction: MoveDirection,
  ): void => {
    setObjectDefaults((currentDefaults) =>
      moveHeaderOrganizationBlock(currentDefaults, headerOrganizationId, direction),
    );
  };

  const addConfiguredHeaderOrganization = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const caption = headerOrganizationForm.caption.trim();
    const headerOrganization: DemoAosrHeaderOrganization = {
      details: headerOrganizationForm.details.trim(),
      id: `header-organization-created-${String(createdHeaderOrganizationCount)}`,
      label: headerOrganizationForm.label.trim(),
      organizationName: headerOrganizationForm.organizationName.trim(),
      ...(caption === '' ? {} : { caption }),
    };

    setObjectDefaults((currentDefaults) =>
      addHeaderOrganizationBlock(currentDefaults, headerOrganization),
    );
    setCreatedHeaderOrganizationCount((currentCount) => currentCount + 1);
    setHeaderOrganizationForm(emptyHeaderOrganizationForm);
    setHeaderOrganizationFormOpen(false);
  };

  const addLibraryRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const representative = createRepresentativeFromForm(
      `representative-created-${String(createdRepresentativeCount)}`,
      libraryRepresentativeForm,
    );

    setObjectDefaults((currentDefaults) =>
      addRepresentativeToLibrary(currentDefaults, representative),
    );
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);
    setLibraryRepresentativeForm(emptyRepresentativeForm);
    setRepresentativeLibraryFormOpen(false);
    setRepresentativeLibraryOpen(true);
  };

  const addManualRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const representative = createRepresentativeFromForm(
      shouldAddManualRepresentativeToLibrary
        ? `representative-created-${String(createdRepresentativeCount)}`
        : `temporary-representative-${String(createdRepresentativeCount)}`,
      manualRepresentativeForm,
    );

    if (shouldAddManualRepresentativeToLibrary) {
      setObjectDefaults((currentDefaults) =>
        addRepresentativeToLibrary(currentDefaults, representative),
      );
    }

    updateSelectedDraftWith((draft) => addRepresentativeToDraft(draft, representative));
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);
    setManualRepresentativeForm(emptyRepresentativeForm);
    setShouldAddManualRepresentativeToLibrary(false);
    setManualRepresentativeFormOpen(false);
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
          <div>
            <dt>Шапка</dt>
            <dd>{objectDefaults.headerOrganizations.length}</dd>
          </div>
          <div>
            <dt>Подписанты</dt>
            <dd>{selectedSignatories.length}</dd>
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
            <span>Настройки объекта</span>
            <span>Текущий акт</span>
          </div>

          <div className="form-sections">
            <section
              className="form-section form-section--scope"
              aria-labelledby="object-settings-title"
            >
              <div className="scope-heading scope-heading--with-action">
                <span>
                  <p className="scope-label">Данные объекта</p>
                  <h3 id="object-settings-title">Настройки объекта для АОСР</h3>
                </span>
                <button
                  aria-controls="object-settings-panel"
                  aria-expanded={isObjectSettingsOpen}
                  className="compact-toggle"
                  onClick={() => {
                    setObjectSettingsOpen((isOpen) => !isOpen);
                  }}
                  type="button"
                >
                  {isObjectSettingsOpen ? 'Свернуть' : 'Открыть объектовые настройки'}
                </button>
              </div>

              <div className="compact-summary-list" aria-label="Кратко об объектовых настройках">
                <span>{objectDefaults.headerOrganizations.length} блока шапки</span>
                <span>{objectDefaults.representativeLibrary.length} подписанта в базе</span>
                <span>роли и подписи настраиваются на объекте</span>
              </div>

              {isObjectSettingsOpen ? (
                <div className="disclosure-panel" id="object-settings-panel">
                  <section className="form-section" aria-labelledby="object-data-title">
                    <h3 id="object-data-title">Объектовые значения по умолчанию</h3>
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
                          rows={5}
                          value={objectDefaults.defaultProjectDocumentation}
                        />
                      </label>
                    </div>
                  </section>

                  <section className="form-section" aria-labelledby="header-organizations-title">
                    <div className="scope-heading scope-heading--with-action">
                      <span>
                        <h3 id="header-organizations-title">Организации в шапке акта</h3>
                        <p className="helper-note">
                          Блоки являются объектовой настройкой и выводятся в превью в этом порядке.
                        </p>
                      </span>
                      <button
                        className="compact-toggle"
                        onClick={() => {
                          setHeaderOrganizationFormOpen((isOpen) => !isOpen);
                        }}
                        type="button"
                      >
                        Добавить организацию в шапке
                      </button>
                    </div>

                    <ol className="compact-card-list" aria-label="Организации в шапке акта">
                      {objectDefaults.headerOrganizations.map((headerOrganization, index) => (
                        <li className="compact-card-list__item" key={headerOrganization.id}>
                          <span>
                            <strong>{headerOrganization.label}</strong>
                            <small>{headerOrganization.organizationName}</small>
                            <small>{headerOrganization.details}</small>
                          </span>
                          <span className="inline-actions">
                            <button
                              aria-label={`Переместить ${headerOrganization.label} вверх`}
                              disabled={index === 0}
                              onClick={() => {
                                updateHeaderOrganizationOrder(headerOrganization.id, 'up');
                              }}
                              type="button"
                            >
                              Вверх
                            </button>
                            <button
                              aria-label={`Переместить ${headerOrganization.label} вниз`}
                              disabled={index === objectDefaults.headerOrganizations.length - 1}
                              onClick={() => {
                                updateHeaderOrganizationOrder(headerOrganization.id, 'down');
                              }}
                              type="button"
                            >
                              Вниз
                            </button>
                          </span>
                        </li>
                      ))}
                    </ol>

                    {isHeaderOrganizationFormOpen ? (
                      <form className="inline-form" onSubmit={addConfiguredHeaderOrganization}>
                        <label>
                          Название блока
                          <input
                            onChange={(event) => {
                              updateHeaderOrganizationForm('label', event.currentTarget.value);
                            }}
                            required
                            value={headerOrganizationForm.label}
                          />
                        </label>
                        <label>
                          Организация / наименование
                          <textarea
                            onChange={(event) => {
                              updateHeaderOrganizationForm(
                                'organizationName',
                                event.currentTarget.value,
                              );
                            }}
                            required
                            rows={2}
                            value={headerOrganizationForm.organizationName}
                          />
                        </label>
                        <label>
                          Реквизиты / детали
                          <textarea
                            onChange={(event) => {
                              updateHeaderOrganizationForm('details', event.currentTarget.value);
                            }}
                            required
                            rows={3}
                            value={headerOrganizationForm.details}
                          />
                        </label>
                        <label>
                          Подпись-подсказка
                          <textarea
                            onChange={(event) => {
                              updateHeaderOrganizationForm('caption', event.currentTarget.value);
                            }}
                            rows={2}
                            value={headerOrganizationForm.caption}
                          />
                        </label>
                        <button type="submit">Сохранить организацию в шапке</button>
                      </form>
                    ) : null}
                  </section>

                  <section className="form-section" aria-labelledby="representative-library-title">
                    <div className="scope-heading scope-heading--with-action">
                      <span>
                        <h3 id="representative-library-title">База подписантов объекта</h3>
                        <p className="helper-note">
                          Это компактная объектовая библиотека: подписи добавляются в конкретный акт
                          отдельно.
                        </p>
                      </span>
                      <span className="inline-actions">
                        <button
                          className="compact-toggle"
                          onClick={() => {
                            setRepresentativeLibraryOpen((isOpen) => !isOpen);
                          }}
                          type="button"
                        >
                          {isRepresentativeLibraryOpen ? 'Скрыть базу' : 'Открыть базу'}
                        </button>
                        <button
                          className="compact-toggle"
                          onClick={() => {
                            setRepresentativeLibraryFormOpen((isOpen) => !isOpen);
                            setRepresentativeLibraryOpen(true);
                          }}
                          type="button"
                        >
                          Добавить представителя
                        </button>
                      </span>
                    </div>

                    {isRepresentativeLibraryOpen ? (
                      <div className="library-panel">
                        <div
                          className="library-list library-list--compact"
                          role="list"
                          aria-label="База подписантов объекта"
                        >
                          {objectDefaults.representativeLibrary.map((representative) => (
                            <div className="library-row" key={representative.id} role="listitem">
                              <span>
                                <strong>{representative.fullName}</strong>
                                <small>
                                  {representative.roleLabel} / {representative.position}
                                </small>
                                <small>{representative.organization}</small>
                              </span>
                            </div>
                          ))}
                        </div>

                        {isRepresentativeLibraryFormOpen ? (
                          <RepresentativeForm
                            form={libraryRepresentativeForm}
                            labels={{
                              authorityBasis: 'Основание полномочий',
                              details: 'Дополнительные сведения',
                              fullName: 'ФИО представителя',
                              nrsId: 'Номер НРС',
                              organization: 'Организация представителя',
                              position: 'Должность представителя',
                              roleLabel: 'Роль в акте',
                            }}
                            onChange={updateLibraryRepresentativeForm}
                            onSubmit={addLibraryRepresentative}
                            submitLabel="Сохранить представителя"
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                </div>
              ) : null}
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
                <div className="scope-heading scope-heading--with-action">
                  <span>
                    <h3 id="commission-data-title">Комиссия / подписанты текущего акта</h3>
                    <p className="helper-note">
                      В акт можно добавить любого подписанта из объектовой базы или временно ввести
                      нового только для этого акта.
                    </p>
                  </span>
                  <span className="inline-actions">
                    <button
                      className="compact-toggle"
                      onClick={() => {
                        setActRepresentativePickerOpen((isOpen) => !isOpen);
                      }}
                      type="button"
                    >
                      Добавить из базы подписантов объекта
                    </button>
                    <button
                      className="compact-toggle"
                      onClick={() => {
                        setManualRepresentativeFormOpen((isOpen) => !isOpen);
                      }}
                      type="button"
                    >
                      Добавить вручную для этого акта
                    </button>
                  </span>
                </div>

                {isActRepresentativePickerOpen ? (
                  <div
                    className="library-list library-list--compact"
                    role="list"
                    aria-label="База подписантов объекта для текущего акта"
                  >
                    {objectDefaults.representativeLibrary.map((representative) => {
                      const isInCurrentAct = selectedDraft.representatives.some(
                        ({ id }) => id === representative.id,
                      );

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
                              updateSelectedDraftWith((draft) =>
                                addRepresentativeToDraft(draft, representative),
                              );
                            }}
                            type="button"
                          >
                            {isInCurrentAct ? 'В акте' : 'Добавить в акт'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {isManualRepresentativeFormOpen ? (
                  <RepresentativeForm
                    afterFields={
                      <label className="checkbox-row checkbox-row--inline">
                        <input
                          checked={shouldAddManualRepresentativeToLibrary}
                          onChange={(event) => {
                            setShouldAddManualRepresentativeToLibrary(event.currentTarget.checked);
                          }}
                          type="checkbox"
                        />
                        <span>
                          <strong>Добавить этого представителя в базу подписантов объекта</strong>
                        </span>
                      </label>
                    }
                    form={manualRepresentativeForm}
                    labels={{
                      authorityBasis: 'Основание полномочий для акта',
                      details: 'Детали для акта',
                      fullName: 'ФИО для акта',
                      nrsId: 'Номер НРС для акта',
                      organization: 'Организация для акта',
                      position: 'Должность для акта',
                      roleLabel: 'Роль для акта',
                    }}
                    onChange={updateManualRepresentativeForm}
                    onSubmit={addManualRepresentative}
                    submitLabel="Добавить подписанта в акт"
                  />
                ) : null}

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
                            moveSelectedSignatory(representative.id, 'up');
                          }}
                          type="button"
                        >
                          Вверх
                        </button>
                        <button
                          aria-label={`Переместить ${representative.fullName} вниз`}
                          disabled={index === selectedSignatories.length - 1}
                          onClick={() => {
                            moveSelectedSignatory(representative.id, 'down');
                          }}
                          type="button"
                        >
                          Вниз
                        </button>
                        <button
                          aria-label={`Убрать ${representative.fullName} из акта`}
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
                    rows={7}
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
                <div className="scope-heading scope-heading--with-action">
                  <span>
                    <h3 id="materials-data-title">Материалы из библиотеки сертификатов</h3>
                    <p className="placeholder-note">
                      В реальной системе материал добавляется из библиотеки сертификатов
                    </p>
                  </span>
                  <button
                    className="compact-toggle"
                    onClick={() => {
                      setCertificateLibraryOpen((isOpen) => !isOpen);
                    }}
                    type="button"
                  >
                    {isCertificateLibraryOpen ? 'Скрыть сертификаты' : 'Открыть сертификаты'}
                  </button>
                </div>

                {isCertificateLibraryOpen ? (
                  <div
                    className="library-list library-list--compact"
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
                ) : null}

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
                <h3 id="decision-data-title">Решение комиссии и сведения</h3>
                <label className="act-form-grid__wide">
                  Работы выполнены в соответствии с
                  <textarea
                    name="complianceStatement"
                    onChange={(event) => {
                      updateSelectedDraft('complianceStatement', event.currentTarget.value);
                    }}
                    rows={4}
                    value={selectedDraft.complianceStatement}
                  />
                </label>
                <label className="act-form-grid__wide">
                  Последующие работы разрешены
                  <textarea
                    name="subsequentWorksPermitted"
                    onChange={(event) => {
                      updateSelectedDraft('subsequentWorksPermitted', event.currentTarget.value);
                    }}
                    rows={4}
                    value={selectedDraft.subsequentWorksPermitted}
                  />
                </label>
                <div className="act-form-grid">
                  <label>
                    Дополнительные сведения
                    <textarea
                      name="additionalInfo"
                      onChange={(event) => {
                        updateSelectedDraft('additionalInfo', event.currentTarget.value);
                      }}
                      rows={3}
                      value={selectedDraft.additionalInfo}
                    />
                  </label>
                  <label>
                    Количество экземпляров
                    <input
                      name="copiesCount"
                      onChange={(event) => {
                        updateSelectedDraft('copiesCount', event.currentTarget.value);
                      }}
                      value={selectedDraft.copiesCount}
                    />
                  </label>
                </div>
              </section>

              <section className="form-section" aria-labelledby="attachments-data-title">
                <h3 id="attachments-data-title">Производные приложения</h3>
                <p className="helper-note">
                  Итоговый блок приложений формируется из выбранных сертификатов, исполнительных
                  схем, фотофиксации и записей журналов.
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

              <header className="act-page__top-blocks">
                <div className="act-page__header-block">
                  <p className="act-page__block-label">Объект капитального строительства:</p>
                  <p className="act-page__field-line">{objectDefaults.objectName}</p>
                  <p className="act-page__caption">
                    (наименование объекта капитального строительства, почтовый или строительный
                    адрес)
                  </p>
                </div>

                {objectDefaults.headerOrganizations.map((headerOrganization) => (
                  <div className="act-page__header-block" key={headerOrganization.id}>
                    <p className="act-page__block-label">{headerOrganization.label}:</p>
                    <p className="act-page__field-line">{headerOrganization.organizationName}</p>
                    <p>{headerOrganization.details}</p>
                    {headerOrganization.caption ? (
                      <p className="act-page__caption">({headerOrganization.caption})</p>
                    ) : null}
                  </div>
                ))}
              </header>

              <section className="act-page__title-block">
                <p>АКТ</p>
                <h3>ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ</h3>
                <div className="act-page__number-date-row">
                  <span>{selectedDraft.actPlace}</span>
                  <strong>№ {selectedDraft.actNumber}</strong>
                  <span>{formatDocumentDate(selectedDraft.actDate)}</span>
                </div>
              </section>

              <section className="act-page__representative-blocks" aria-label="Представители">
                {selectedSignatories.map((representative) => (
                  <div className="act-page__representative-block" key={representative.id}>
                    <p className="act-page__block-label">{representative.roleLabel}:</p>
                    <p className="act-page__field-line">
                      {getRepresentativePreviewLine(representative)}
                    </p>
                    <p>{getRepresentativeAuthorityLine(representative)}</p>
                    <p className="act-page__caption">
                      (должность, фамилия, инициалы, реквизиты документа, подтверждающего
                      полномочия)
                    </p>
                  </div>
                ))}
                <p>произвели осмотр работ, выполненных {executingOrganization}</p>
                <p className="act-page__caption">
                  (наименование лица, выполнившего работы, подлежащие освидетельствованию)
                </p>
                <p>и составили настоящий акт о нижеследующем:</p>
              </section>

              <section className="act-page__official-section" aria-label="Скрытые работы">
                <h4>1. К освидетельствованию предъявлены следующие работы:</h4>
                <p>{selectedDraft.workDescription}</p>
                <p className="act-page__caption">(наименование скрытых работ)</p>
              </section>

              <section className="act-page__official-section" aria-label="Проектная документация">
                <h4>2. Работы выполнены по проектной документации:</h4>
                <p>{objectDefaults.defaultProjectDocumentation}</p>
                <p className="act-page__caption">
                  (номер, другие реквизиты чертежа, наименование проектной и рабочей документации)
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Материалы и сертификаты">
                <h4>3. При выполнении работ применены:</h4>
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
                <p className="act-page__caption">
                  (наименование материалов и реквизиты документов, подтверждающих качество)
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Документы соответствия">
                <h4>
                  4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним
                  требованиям:
                </h4>
                {selectedDerivedAttachments.length > 0 ? (
                  <ol className="act-page__ordered-list">
                    {selectedDerivedAttachments.map((attachment) => (
                      <li key={attachment.id}>
                        <span>{attachment.title}</span>
                        <strong>{attachment.reference}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Исполнительные схемы, фото и журнальные записи пока не выбраны.</p>
                )}
                <p className="act-page__caption">
                  (исполнительные схемы, результаты обследований, журналы и иные материалы)
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Период работ">
                <h4>5. Даты:</h4>
                <dl className="act-page__date-lines">
                  <div>
                    <dt>начала работ</dt>
                    <dd>{formatDocumentDate(selectedDraft.periodStart)}</dd>
                  </div>
                  <div>
                    <dt>окончания работ</dt>
                    <dd>{formatDocumentDate(selectedDraft.periodEnd)}</dd>
                  </div>
                </dl>
              </section>

              <section className="act-page__official-section" aria-label="Соответствие работ">
                <h4>6. Работы выполнены в соответствии с:</h4>
                <p>{selectedDraft.complianceStatement}</p>
                <p className="act-page__caption">
                  (наименования технических регламентов, норм и разделов проектной документации)
                </p>
              </section>

              <section className="act-page__official-section" aria-label="Последующие работы">
                <h4>7. Разрешается производство последующих работ по:</h4>
                <p>{selectedDraft.subsequentWorksPermitted}</p>
                <p className="act-page__caption">
                  (наименование работ, конструкций и участков сетей)
                </p>
              </section>

              <section className="act-page__after-body" aria-label="Сведения и приложения">
                <p>
                  <strong>Дополнительные сведения:</strong> {selectedDraft.additionalInfo}
                </p>
                <p>Акт составлен в {selectedDraft.copiesCount} экземплярах.</p>
                <div>
                  <h4>Приложения:</h4>
                  <ol className="act-page__ordered-list">
                    {finalApplications.map((application) => (
                      <li key={application.id}>
                        <span>{application.title}</span>
                        <strong>{application.source}</strong>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <section
                className="act-page__signature-section act-page__official-section--final"
                aria-label="Подписи представителей"
              >
                <h4>Подписи представителей</h4>
                <div className="act-page__signature-table">
                  {selectedSignatories.map((representative) => (
                    <div className="act-page__signature-block" key={representative.id}>
                      <p>{representative.roleLabel}:</p>
                      <div className="act-page__signature-row">
                        <span>
                          {representative.position} {representative.organization}
                        </span>
                        <strong>{representative.fullName}</strong>
                        <span className="act-page__signature-line">подпись</span>
                      </div>
                      <div className="act-page__signature-caption-row">
                        <span>(должность, организация)</span>
                        <span>(фамилия, инициалы)</span>
                        <span>(подпись)</span>
                      </div>
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

interface RepresentativeFormLabels {
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId: string;
  readonly details: string;
}

interface RepresentativeFormProps {
  readonly afterFields?: React.ReactNode;
  readonly form: RepresentativeFormState;
  readonly labels: RepresentativeFormLabels;
  readonly onChange: (field: keyof RepresentativeFormState, value: string) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly submitLabel: string;
}

function RepresentativeForm({
  afterFields,
  form,
  labels,
  onChange,
  onSubmit,
  submitLabel,
}: RepresentativeFormProps): React.JSX.Element {
  return (
    <form className="inline-form inline-form--representative" onSubmit={onSubmit}>
      <label>
        {labels.roleLabel}
        <input
          onChange={(event) => {
            onChange('roleLabel', event.currentTarget.value);
          }}
          required
          value={form.roleLabel}
        />
      </label>
      <label>
        {labels.fullName}
        <input
          onChange={(event) => {
            onChange('fullName', event.currentTarget.value);
          }}
          required
          value={form.fullName}
        />
      </label>
      <label>
        {labels.position}
        <input
          onChange={(event) => {
            onChange('position', event.currentTarget.value);
          }}
          required
          value={form.position}
        />
      </label>
      <label>
        {labels.organization}
        <input
          onChange={(event) => {
            onChange('organization', event.currentTarget.value);
          }}
          required
          value={form.organization}
        />
      </label>
      <label>
        {labels.authorityBasis}
        <input
          onChange={(event) => {
            onChange('authorityBasis', event.currentTarget.value);
          }}
          required
          value={form.authorityBasis}
        />
      </label>
      <label>
        {labels.nrsId}
        <input
          onChange={(event) => {
            onChange('nrsId', event.currentTarget.value);
          }}
          value={form.nrsId}
        />
      </label>
      <label className="act-form-grid__wide">
        {labels.details}
        <textarea
          onChange={(event) => {
            onChange('details', event.currentTarget.value);
          }}
          rows={2}
          value={form.details}
        />
      </label>
      {afterFields}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

function createRepresentativeFromForm(
  id: string,
  form: RepresentativeFormState,
): DemoAosrRepresentative {
  const details = form.details.trim();
  const nrsId = form.nrsId.trim();

  return {
    authorityBasis: form.authorityBasis.trim(),
    fullName: form.fullName.trim(),
    id,
    organization: form.organization.trim(),
    position: form.position.trim(),
    roleLabel: form.roleLabel.trim(),
    ...(details === '' ? {} : { details }),
    ...(nrsId === '' ? {} : { nrsId }),
  };
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

function getExecutingOrganization(
  selectedSignatories: readonly DemoAosrRepresentative[],
  objectDefaults: DemoAosrObjectDefaults,
): string {
  const lastSignatory = selectedSignatories[selectedSignatories.length - 1];
  const lastHeaderOrganization =
    objectDefaults.headerOrganizations[objectDefaults.headerOrganizations.length - 1];

  return (
    lastSignatory?.organization ??
    lastHeaderOrganization?.organizationName ??
    'организацией, указанной в настройках объекта'
  );
}

function getRepresentativePreviewLine(representative: DemoAosrRepresentative): string {
  return [representative.position, representative.organization, representative.fullName]
    .filter(Boolean)
    .join(' ');
}

function getRepresentativeAuthorityLine(representative: DemoAosrRepresentative): string {
  return [
    representative.authorityBasis,
    representative.nrsId === undefined
      ? ''
      : `идентификационный номер в национальном реестре специалистов ${representative.nrsId}`,
    representative.details ?? '',
  ]
    .filter(Boolean)
    .join('; ');
}

function formatDocumentDate(dateValue: string): string {
  const [year, month, day] = dateValue.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return dateValue;
  }

  return `"${day}" ${getRussianMonthName(month)} ${year} г.`;
}

function getRussianMonthName(monthValue: string): string {
  switch (monthValue) {
    case '01':
      return 'января';
    case '02':
      return 'февраля';
    case '03':
      return 'марта';
    case '04':
      return 'апреля';
    case '05':
      return 'мая';
    case '06':
      return 'июня';
    case '07':
      return 'июля';
    case '08':
      return 'августа';
    case '09':
      return 'сентября';
    case '10':
      return 'октября';
    case '11':
      return 'ноября';
    case '12':
      return 'декабря';
    default:
      return monthValue;
  }
}
