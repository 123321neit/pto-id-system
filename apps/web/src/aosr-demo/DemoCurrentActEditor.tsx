import type { ReactNode, SyntheticEvent } from 'react';

import type { DemoAosrFormVariantMetadata } from '../act-types/act-types.js';
import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoAosrDraftField,
  DemoAosrObjectDefaults,
  DemoAosrRepresentative,
  DemoAosrTemplateFields,
  DemoMaterialCertificate,
  DemoObjectDocument,
  DemoObjectDocumentType,
} from './demo-aosr-workspace.js';
import { isManualDraftFieldDifferentFromObjectTemplate } from './demo-aosr-workspace.js';
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
  readonly linkedTemplateFields: DemoAosrTemplateFields;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly objectDocumentLibrary: readonly DemoObjectDocument[];
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedObjectDocuments: readonly DemoObjectDocument[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly templateFields: DemoAosrTemplateFields;
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
  readonly onUpdateObjectNameSubscript: (value: string) => void;
  readonly onUpdateHeaderOrganization: (
    headerOrganizationId: string,
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ) => void;
  readonly onRemoveMaterialFromAct: (certificateId: string) => void;
  readonly onRemoveObjectDocumentFromAct: (documentId: string) => void;
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onUpdateRepresentative: (
    representativeId: string,
    field:
      | 'authorityBasis'
      | 'details'
      | 'fullName'
      | 'introDisplayText'
      | 'nrsId'
      | 'organization'
      | 'position'
      | 'roleLabel'
      | 'signatureName'
      | 'signatureText',
    value: string,
  ) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleApplication: (applicationId: string) => void;
  readonly onToggleCertificateLibrary: () => void;
  readonly onToggleManualRepresentativeForm: () => void;
  readonly onToggleObjectDocumentLibrary: () => void;
  readonly onReturnDraftToLinkedTemplate: () => void;
  readonly onSwitchDraftToManualTemplate: () => void;
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
  linkedTemplateFields,
  objectDefaults,
  objectDocumentLibrary,
  selectedDraft,
  selectedMaterials,
  selectedObjectDocuments,
  selectedSignatories,
  templateFields,
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
  onUpdateObjectNameSubscript,
  onUpdateHeaderOrganization,
  onRemoveMaterialFromAct,
  onRemoveObjectDocumentFromAct,
  onRemoveRepresentativeFromAct,
  onUpdateRepresentative,
  onReorderSelectedSignatory,
  onToggleApplication,
  onToggleCertificateLibrary,
  onToggleManualRepresentativeForm,
  onToggleObjectDocumentLibrary,
  onReturnDraftToLinkedTemplate,
  onSwitchDraftToManualTemplate,
  onUpdateSelectedDraft,
}: DemoCurrentActEditorProps): React.JSX.Element {
  const isManualTemplate = selectedDraft.templateMode === 'manual';
  const templateSourceLabel = isManualTemplate ? 'Ручная версия' : 'По шаблону объекта';
  const objectNameSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(selectedDraft, objectDefaults, 'objectName'),
  );
  const objectNameSubscriptSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    templateFields.objectNameSubscript !== linkedTemplateFields.objectNameSubscript,
  );
  const objectDataSourceLabel =
    objectNameSourceLabel === 'Отличается от шаблона объекта' ||
    objectNameSubscriptSourceLabel === 'Отличается от шаблона объекта'
      ? 'Отличается от шаблона объекта'
      : templateSourceLabel;
  const projectDocumentationSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'projectDocumentation',
    ),
  );
  const complianceSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'complianceStatement',
    ),
  );
  const workContractorSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'workContractorName',
    ),
  );
  const additionalInfoSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'additionalInfo',
    ) ||
      isManualDraftFieldDifferentFromObjectTemplate(selectedDraft, objectDefaults, 'copiesCount'),
  );
  const readiness = buildDemoAosrReadiness({
    complianceStatement: templateFields.complianceStatement,
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
          <div>
            <dt>Шаблонные данные</dt>
            <dd>{isManualTemplate ? 'Ручная версия' : 'По шаблону'}</dd>
          </div>
        </dl>
        <div className="template-mode-actions" aria-label="Режим шаблонных данных">
          {isManualTemplate ? (
            <>
              <p className="helper-note">
                Ручная версия: изменения шаблона объекта и библиотек не применяются.
              </p>
              <button
                className="compact-toggle compact-toggle--accent"
                onClick={onReturnDraftToLinkedTemplate}
                type="button"
              >
                Вернуть к шаблону объекта
              </button>
            </>
          ) : (
            <>
              <p className="helper-note">Шаблонные данные берутся из шаблона объекта.</p>
              <button
                className="compact-toggle"
                onClick={onSwitchDraftToManualTemplate}
                type="button"
              >
                Редактировать шаблонные данные вручную
              </button>
            </>
          )}
        </div>
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
          <div className="print-header-field">
            <span>Форма акта</span>
            <p>{formVariant.title}</p>
          </div>
        </div>
      </section>

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="act-object-data-title"
        onSwitchToManual={onSwitchDraftToManualTemplate}
        sourceLabel={objectDataSourceLabel}
        summary={templateFields.objectName}
        title="Данные объекта"
      >
        <div className="act-form-grid">
          <label className="act-form-grid__wide">
            Объект капитального строительства в документе
            <textarea
              className="medium-field"
              name="objectName"
              onChange={(event) => {
                if (isManualTemplate) {
                  onUpdateSelectedDraft('objectName', event.currentTarget.value);
                }
              }}
              readOnly={!isManualTemplate}
              rows={3}
              value={templateFields.objectName}
            />
          </label>
          <label className="act-form-grid__wide">
            Подстрочное пояснение объекта
            <textarea
              onChange={(event) => {
                if (isManualTemplate) {
                  onUpdateObjectNameSubscript(event.currentTarget.value);
                }
              }}
              readOnly={!isManualTemplate}
              rows={2}
              value={templateFields.objectNameSubscript}
            />
          </label>
        </div>
      </TemplateOwnedSection>

      <DemoHeaderOrganizationsOrderEditor
        headerOrganizations={templateFields.headerOrganizations}
        isTemplateEditable={isManualTemplate}
        linkedHeaderOrganizations={linkedTemplateFields.headerOrganizations}
        onMoveHeaderOrganization={onMoveHeaderOrganization}
        onSwitchToManual={onSwitchDraftToManualTemplate}
        onUpdateHeaderOrganization={onUpdateHeaderOrganization}
        sourceLabel={templateSourceLabel}
      />

      <DemoSignatoriesEditor
        actRepresentativeSearch={actRepresentativeSearch}
        draggedRepresentativeId={draggedRepresentativeId}
        dropTargetRepresentativeId={dropTargetRepresentativeId}
        isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
        isTemplateEditable={isManualTemplate}
        manualRepresentativeForm={manualRepresentativeForm}
        objectRepresentatives={objectDefaults.representativeLibrary}
        linkedSignatories={linkedTemplateFields.representatives}
        selectedSignatories={selectedSignatories}
        sourceLabel={templateSourceLabel}
        onAddManualRepresentative={onAddManualRepresentative}
        onAddRepresentativeToAct={onAddRepresentativeToAct}
        onChangeActRepresentativeSearch={onChangeActRepresentativeSearch}
        onChangeManualRepresentativeForm={onChangeManualRepresentativeForm}
        onDragRepresentativeEnd={onDragRepresentativeEnd}
        onDragRepresentativeStart={onDragRepresentativeStart}
        onDragRepresentativeTarget={onDragRepresentativeTarget}
        onMoveSelectedSignatory={onMoveSelectedSignatory}
        onRemoveRepresentativeFromAct={onRemoveRepresentativeFromAct}
        onSwitchToManual={onSwitchDraftToManualTemplate}
        onUpdateRepresentative={onUpdateRepresentative}
        onReorderSelectedSignatory={onReorderSelectedSignatory}
        onToggleManualRepresentativeForm={onToggleManualRepresentativeForm}
      />

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="work-contractor-data-title"
        onSwitchToManual={onSwitchDraftToManualTemplate}
        sourceLabel={workContractorSourceLabel}
        summary={templateFields.workContractorName}
        title="Лицо, выполнившее работы"
      >
        <label className="act-form-grid__wide">
          Печатное наименование
          <input
            name="workContractorName"
            onChange={(event) => {
              if (isManualTemplate) {
                onUpdateSelectedDraft('workContractorName', event.currentTarget.value);
              }
            }}
            readOnly={!isManualTemplate}
            value={templateFields.workContractorName}
          />
        </label>
      </TemplateOwnedSection>

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

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="project-docs-data-title"
        onSwitchToManual={onSwitchDraftToManualTemplate}
        sourceLabel={projectDocumentationSourceLabel}
        summary={templateFields.projectDocumentation}
        title="2. Проектная документация"
      >
        <label className="act-form-grid__wide">
          Проектная документация в документе
          <textarea
            className="large-field"
            name="projectDocumentation"
            onChange={(event) => {
              if (isManualTemplate) {
                onUpdateSelectedDraft('projectDocumentation', event.currentTarget.value);
              }
            }}
            readOnly={!isManualTemplate}
            rows={5}
            value={templateFields.projectDocumentation}
          />
        </label>
      </TemplateOwnedSection>

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

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="compliance-data-title"
        onSwitchToManual={onSwitchDraftToManualTemplate}
        sourceLabel={complianceSourceLabel}
        summary={templateFields.complianceStatement}
        title="6. Соответствие работ"
      >
        <label className="act-form-grid__wide">
          Текст пункта 6 в документе
          <textarea
            className="large-field"
            name="complianceStatement"
            onChange={(event) => {
              if (isManualTemplate) {
                onUpdateSelectedDraft('complianceStatement', event.currentTarget.value);
              }
            }}
            readOnly={!isManualTemplate}
            rows={5}
            value={templateFields.complianceStatement}
          />
        </label>
      </TemplateOwnedSection>

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

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="additional-data-title"
        onSwitchToManual={onSwitchDraftToManualTemplate}
        sourceLabel={additionalInfoSourceLabel}
        summary={`Экземпляров: ${templateFields.copiesLine}`}
        title="Дополнительные сведения"
      >
        <div className="act-form-grid">
          <label>
            Дополнительные сведения
            <textarea
              className="medium-field"
              name="additionalInfo"
              onChange={(event) => {
                if (isManualTemplate) {
                  onUpdateSelectedDraft('additionalInfo', event.currentTarget.value);
                }
              }}
              readOnly={!isManualTemplate}
              rows={3}
              value={templateFields.additionalInfo}
            />
          </label>
          <label>
            Количество экземпляров
            <input
              name="copiesCount"
              onChange={(event) => {
                if (isManualTemplate) {
                  onUpdateSelectedDraft('copiesCount', event.currentTarget.value);
                }
              }}
              readOnly={!isManualTemplate}
              value={templateFields.copiesLine}
            />
          </label>
        </div>
      </TemplateOwnedSection>

      <DemoActApplicationsSection
        allApplications={allApplications}
        selectedDraft={selectedDraft}
        onToggleApplication={onToggleApplication}
      />
    </section>
  );
}

interface TemplateOwnedSectionProps {
  readonly children: ReactNode;
  readonly defaultOpen: boolean;
  readonly id: string;
  readonly onSwitchToManual: () => void;
  readonly sourceLabel: string;
  readonly summary: string;
  readonly title: string;
}

function TemplateOwnedSection({
  children,
  defaultOpen,
  id,
  onSwitchToManual,
  sourceLabel,
  summary,
  title,
}: TemplateOwnedSectionProps): React.JSX.Element {
  const isManual = sourceLabel !== 'По шаблону объекта';

  return (
    <section className="form-section act-editor-card template-owned-section" aria-labelledby={id}>
      <details className="template-data-disclosure" open={defaultOpen ? true : undefined}>
        <summary>
          <span>
            <strong id={id}>{title}</strong>
            <small>{summary}</small>
          </span>
          <span className="source-chip">{sourceLabel}</span>
        </summary>
        <div className="template-data-disclosure__body">
          {isManual ? null : (
            <div className="template-data-disclosure__intro">
              <p className="helper-note">Данные берутся из шаблона объекта.</p>
              <button className="compact-toggle" onClick={onSwitchToManual} type="button">
                Изменить вручную
              </button>
            </div>
          )}
          {children}
        </div>
      </details>
    </section>
  );
}

function getTemplateFieldSourceLabel(isManualTemplate: boolean, isDifferent: boolean): string {
  if (!isManualTemplate) {
    return 'По шаблону объекта';
  }

  return isDifferent ? 'Отличается от шаблона объекта' : 'Ручная версия';
}
