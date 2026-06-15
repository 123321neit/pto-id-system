import type { SyntheticEvent } from 'react';

import type { DemoAosrFormVariantMetadata } from '../act-types/act-types.js';
import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoAosrDraftField,
  DemoAosrObjectDefaults,
  DemoAosrRepresentative,
  DemoMaterialCertificate,
  DemoObjectDocument,
  DemoObjectDocumentType,
} from './demo-aosr-workspace.js';
import { getDraftComplianceStatement, hasDraftComplianceOverride } from './demo-aosr-workspace.js';
import {
  formatDocumentDate,
  type MoveDirection,
  type RepresentativeFormState,
} from './demo-aosr-ui.js';
import { buildDemoAosrReadiness } from './demo-aosr-readiness.js';
import { DemoActApplicationsSection } from './DemoActApplicationsSection.js';
import { DemoAosrReadinessPanel } from './DemoAosrReadinessPanel.js';
import { DemoHeaderOrganizationsOrderEditor } from './DemoHeaderOrganizationsOrderEditor.js';
import { DemoMaterialsSelector } from './DemoMaterialsSelector.js';
import { DemoObjectDocumentsEditor } from './DemoObjectDocumentsEditor.js';
import { DemoSignatoriesEditor } from './DemoSignatoriesEditor.js';

interface DemoCurrentActEditorProps {
  readonly actRepresentativeSearch: string;
  readonly allApplications: readonly DemoActApplication[];
  readonly certificateLibrary: readonly DemoMaterialCertificate[];
  readonly documentSearch: string;
  readonly documentTypeFilter: 'all' | DemoObjectDocumentType;
  readonly draggedRepresentativeId: string | null;
  readonly dropTargetRepresentativeId: string | null;
  readonly formVariant: DemoAosrFormVariantMetadata;
  readonly isCertificateLibraryOpen: boolean;
  readonly isManualRepresentativeFormOpen: boolean;
  readonly isObjectDocumentLibraryOpen: boolean;
  readonly manualRepresentativeForm: RepresentativeFormState;
  readonly materialSearch: string;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly objectDocumentLibrary: readonly DemoObjectDocument[];
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedObjectDocuments: readonly DemoObjectDocument[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly onAddManualRepresentative: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onAddMaterialToAct: (certificateId: string) => void;
  readonly onAddObjectDocumentToAct: (documentId: string) => void;
  readonly onAddRepresentativeToAct: (representative: DemoAosrRepresentative) => void;
  readonly onChangeActRepresentativeSearch: (value: string) => void;
  readonly onChangeDocumentSearch: (value: string) => void;
  readonly onChangeDocumentTypeFilter: (value: 'all' | DemoObjectDocumentType) => void;
  readonly onChangeManualRepresentativeForm: (
    field: keyof RepresentativeFormState,
    value: string,
  ) => void;
  readonly onChangeMaterialSearch: (value: string) => void;
  readonly onDragRepresentativeEnd: () => void;
  readonly onDragRepresentativeStart: (representativeId: string) => void;
  readonly onDragRepresentativeTarget: (representativeId: string) => void;
  readonly onMoveSelectedSignatory: (representativeId: string, direction: MoveDirection) => void;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onRemoveMaterialFromAct: (certificateId: string) => void;
  readonly onRemoveObjectDocumentFromAct: (documentId: string) => void;
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onResetDraftComplianceToObjectDefault: () => void;
  readonly onStartDraftComplianceOverride: () => void;
  readonly onToggleApplication: (applicationId: string) => void;
  readonly onToggleCertificateLibrary: () => void;
  readonly onToggleManualRepresentativeForm: () => void;
  readonly onToggleObjectDocumentLibrary: () => void;
  readonly onUpdateDraftComplianceOverride: (value: string) => void;
  readonly onUpdateSelectedDraft: (field: DemoAosrDraftField, value: string) => void;
}

export function DemoCurrentActEditor({
  actRepresentativeSearch,
  allApplications,
  certificateLibrary,
  documentSearch,
  documentTypeFilter,
  draggedRepresentativeId,
  dropTargetRepresentativeId,
  formVariant,
  isCertificateLibraryOpen,
  isManualRepresentativeFormOpen,
  isObjectDocumentLibraryOpen,
  manualRepresentativeForm,
  materialSearch,
  objectDefaults,
  objectDocumentLibrary,
  selectedDraft,
  selectedMaterials,
  selectedObjectDocuments,
  selectedSignatories,
  onAddManualRepresentative,
  onAddMaterialToAct,
  onAddObjectDocumentToAct,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeDocumentSearch,
  onChangeDocumentTypeFilter,
  onChangeManualRepresentativeForm,
  onChangeMaterialSearch,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
  onDragRepresentativeTarget,
  onMoveSelectedSignatory,
  onMoveHeaderOrganization,
  onRemoveMaterialFromAct,
  onRemoveObjectDocumentFromAct,
  onRemoveRepresentativeFromAct,
  onReorderSelectedSignatory,
  onResetDraftComplianceToObjectDefault,
  onStartDraftComplianceOverride,
  onToggleApplication,
  onToggleCertificateLibrary,
  onToggleManualRepresentativeForm,
  onToggleObjectDocumentLibrary,
  onUpdateDraftComplianceOverride,
  onUpdateSelectedDraft,
}: DemoCurrentActEditorProps): React.JSX.Element {
  const complianceStatement = getDraftComplianceStatement(selectedDraft, objectDefaults);
  const isComplianceOverridden = hasDraftComplianceOverride(selectedDraft);
  const readiness = buildDemoAosrReadiness({
    complianceStatement,
    materialsCount: selectedMaterials.length,
    objectDocumentsCount: selectedObjectDocuments.length,
    signatoriesCount: selectedSignatories.length,
  });

  return (
    <section
      className="current-act-editor"
      aria-labelledby="current-act-title"
      aria-label="Редактор текущего АОСР"
    >
      <div className="scope-heading current-act-editor__heading">
        <p className="scope-label">Уровень акта</p>
        <h3 id="current-act-title">Текущий акт</h3>
        <dl className="current-act-metadata" aria-label="Метаданные текущего акта">
          <div>
            <dt>Документ</dt>
            <dd>{selectedDraft.actNumber}</dd>
          </div>
          <div>
            <dt>Версия документа</dt>
            <dd>v1.0</dd>
          </div>
          <div>
            <dt>Последнее изменение</dt>
            <dd>{formatDocumentDate(selectedDraft.actDate)}</dd>
          </div>
        </dl>
      </div>

      <DemoAosrReadinessPanel readiness={readiness} />

      <section
        className="form-section act-editor-card act-editor-card--featured"
        aria-labelledby="act-header-data-title"
      >
        <h3 id="act-header-data-title">Шапка печатного документа</h3>
        <div className="act-form-grid">
          <label>
            Номер акта
            <input
              name="actNumber"
              onChange={(event) => {
                onUpdateSelectedDraft('actNumber', event.currentTarget.value);
              }}
              value={selectedDraft.actNumber}
            />
          </label>
          <label>
            Дата акта
            <input
              name="actDate"
              onChange={(event) => {
                onUpdateSelectedDraft('actDate', event.currentTarget.value);
              }}
              type="date"
              value={selectedDraft.actDate}
            />
          </label>
          <div className="print-header-field act-form-grid__wide">
            <span>Объект капитального строительства</span>
            <p>{objectDefaults.objectName}</p>
          </div>
          <div className="print-header-field">
            <span>Форма акта</span>
            <p>{formVariant.title}</p>
          </div>
          <div className="print-header-field act-form-grid__wide">
            <span>Текст под заголовком акта</span>
            <p>{objectDefaults.defaultUnderTitleText}</p>
            <small>Задаётся в настройках объекта и используется текущим актом.</small>
          </div>
        </div>
      </section>

      <DemoHeaderOrganizationsOrderEditor
        headerOrganizations={objectDefaults.headerOrganizations}
        onMoveHeaderOrganization={onMoveHeaderOrganization}
      />

      <DemoSignatoriesEditor
        actRepresentativeSearch={actRepresentativeSearch}
        draggedRepresentativeId={draggedRepresentativeId}
        dropTargetRepresentativeId={dropTargetRepresentativeId}
        isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
        manualRepresentativeForm={manualRepresentativeForm}
        objectRepresentatives={objectDefaults.representativeLibrary}
        selectedSignatories={selectedSignatories}
        onAddManualRepresentative={onAddManualRepresentative}
        onAddRepresentativeToAct={onAddRepresentativeToAct}
        onChangeActRepresentativeSearch={onChangeActRepresentativeSearch}
        onChangeManualRepresentativeForm={onChangeManualRepresentativeForm}
        onDragRepresentativeEnd={onDragRepresentativeEnd}
        onDragRepresentativeStart={onDragRepresentativeStart}
        onDragRepresentativeTarget={onDragRepresentativeTarget}
        onMoveSelectedSignatory={onMoveSelectedSignatory}
        onRemoveRepresentativeFromAct={onRemoveRepresentativeFromAct}
        onReorderSelectedSignatory={onReorderSelectedSignatory}
        onToggleManualRepresentativeForm={onToggleManualRepresentativeForm}
      />

      <section className="form-section act-editor-card" aria-labelledby="hidden-works-data-title">
        <h3 id="hidden-works-data-title">1. Скрытые работы</h3>
        <div className="act-form-grid">
          <label className="act-form-grid__wide">
            Описание скрытых работ
            <textarea
              className="large-field"
              name="workDescription"
              onChange={(event) => {
                onUpdateSelectedDraft('workDescription', event.currentTarget.value);
              }}
              rows={7}
              value={selectedDraft.workDescription}
            />
          </label>
          <label>
            Оси
            <input
              name="axes"
              onChange={(event) => {
                onUpdateSelectedDraft('axes', event.currentTarget.value);
              }}
              value={selectedDraft.axes}
            />
          </label>
          <label>
            Отметки
            <input
              name="elevationRange"
              onChange={(event) => {
                onUpdateSelectedDraft('elevationRange', event.currentTarget.value);
              }}
              value={selectedDraft.elevationRange}
            />
          </label>
        </div>
      </section>

      <section className="form-section act-editor-card" aria-labelledby="project-docs-data-title">
        <h3 id="project-docs-data-title">2. Проектная документация</h3>
        <p className="readonly-field">{objectDefaults.defaultProjectDocumentation}</p>
        <p className="helper-note">Значение берётся из настроек объекта.</p>
      </section>

      <DemoMaterialsSelector
        certificateLibrary={certificateLibrary}
        isCertificateLibraryOpen={isCertificateLibraryOpen}
        materialSearch={materialSearch}
        selectedDraft={selectedDraft}
        selectedMaterials={selectedMaterials}
        onAddMaterialToAct={onAddMaterialToAct}
        onChangeMaterialSearch={onChangeMaterialSearch}
        onRemoveMaterialFromAct={onRemoveMaterialFromAct}
        onToggleCertificateLibrary={onToggleCertificateLibrary}
      />

      <DemoObjectDocumentsEditor
        documentSearch={documentSearch}
        documentTypeFilter={documentTypeFilter}
        isObjectDocumentLibraryOpen={isObjectDocumentLibraryOpen}
        objectDocumentLibrary={objectDocumentLibrary}
        selectedDraft={selectedDraft}
        selectedObjectDocuments={selectedObjectDocuments}
        onAddObjectDocumentToAct={onAddObjectDocumentToAct}
        onChangeDocumentSearch={onChangeDocumentSearch}
        onChangeDocumentTypeFilter={onChangeDocumentTypeFilter}
        onRemoveObjectDocumentFromAct={onRemoveObjectDocumentFromAct}
        onToggleObjectDocumentLibrary={onToggleObjectDocumentLibrary}
      />

      <section className="form-section act-editor-card" aria-labelledby="period-data-title">
        <h3 id="period-data-title">5. Даты выполнения работ</h3>
        <div className="act-form-grid act-form-grid--compact">
          <label>
            Начало работ
            <input
              name="periodStart"
              onChange={(event) => {
                onUpdateSelectedDraft('periodStart', event.currentTarget.value);
              }}
              type="date"
              value={selectedDraft.periodStart}
            />
          </label>
          <label>
            Окончание работ
            <input
              name="periodEnd"
              onChange={(event) => {
                onUpdateSelectedDraft('periodEnd', event.currentTarget.value);
              }}
              type="date"
              value={selectedDraft.periodEnd}
            />
          </label>
        </div>
      </section>

      <section className="form-section act-editor-card" aria-labelledby="compliance-data-title">
        <div className="scope-heading scope-heading--with-action">
          <span>
            <h3 id="compliance-data-title">6. Соответствие работ</h3>
            <span className="source-chip">
              {isComplianceOverridden
                ? 'Изменено только для этого акта'
                : 'Используется значение объекта'}
            </span>
          </span>
          {isComplianceOverridden ? (
            <button
              className="compact-toggle"
              onClick={onResetDraftComplianceToObjectDefault}
              type="button"
            >
              Вернуться к значению объекта
            </button>
          ) : (
            <button
              className="compact-toggle compact-toggle--accent"
              onClick={onStartDraftComplianceOverride}
              type="button"
            >
              Изменить только для этого акта
            </button>
          )}
        </div>

        {isComplianceOverridden ? (
          <label className="act-form-grid__wide">
            Значение только для этого акта
            <textarea
              className="large-field"
              name="complianceStatementOverride"
              onChange={(event) => {
                onUpdateDraftComplianceOverride(event.currentTarget.value);
              }}
              rows={5}
              value={selectedDraft.complianceStatementOverride ?? ''}
            />
          </label>
        ) : (
          <>
            <p className="readonly-field" aria-label="Соответствие работ из настроек объекта">
              {complianceStatement}
            </p>
            <p className="helper-note">
              Базовый текст задаётся в настройках объекта и используется актом автоматически.
            </p>
          </>
        )}
      </section>

      <section className="form-section act-editor-card" aria-labelledby="subsequent-data-title">
        <h3 id="subsequent-data-title">7. Последующие работы</h3>
        <label className="act-form-grid__wide">
          Последующие работы разрешены
          <textarea
            className="large-field"
            name="subsequentWorksPermitted"
            onChange={(event) => {
              onUpdateSelectedDraft('subsequentWorksPermitted', event.currentTarget.value);
            }}
            rows={5}
            value={selectedDraft.subsequentWorksPermitted}
          />
        </label>
      </section>

      <section className="form-section act-editor-card" aria-labelledby="additional-data-title">
        <h3 id="additional-data-title">Дополнительные сведения</h3>
        <div className="act-form-grid">
          <label>
            Дополнительные сведения
            <textarea
              className="medium-field"
              name="additionalInfo"
              onChange={(event) => {
                onUpdateSelectedDraft('additionalInfo', event.currentTarget.value);
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
                onUpdateSelectedDraft('copiesCount', event.currentTarget.value);
              }}
              value={selectedDraft.copiesCount}
            />
          </label>
        </div>
      </section>

      <DemoActApplicationsSection
        allApplications={allApplications}
        selectedDraft={selectedDraft}
        onToggleApplication={onToggleApplication}
      />
    </section>
  );
}
