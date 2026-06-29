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
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoActApplicationsSection } from './DemoActApplicationsSection.js';
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
  readonly sectionName?: string | undefined;
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
  sectionName,
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
  const documentLabel =
    selectedDraft.actNumber.trim() === '' ? 'Без номера' : selectedDraft.actNumber;
  const templateScopeGenitive = 'шаблонных значений раздела';
  const templateScopeNominative = 'Шаблонные значения';
  const linkedTemplateSourceLabel = 'Шаблонные значения';
  const differsFromTemplateSourceLabel = `Отличается от ${templateScopeGenitive}`;
  const templateSourceLabel = isManualTemplate ? 'Ручная версия' : linkedTemplateSourceLabel;
  const objectNameSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(selectedDraft, objectDefaults, 'objectName'),
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  const objectNameSubscriptSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    templateFields.objectNameSubscript !== linkedTemplateFields.objectNameSubscript,
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  const objectDataSourceLabel =
    objectNameSourceLabel === differsFromTemplateSourceLabel ||
    objectNameSubscriptSourceLabel === differsFromTemplateSourceLabel
      ? differsFromTemplateSourceLabel
      : templateSourceLabel;
  const projectDocumentationSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'projectDocumentation',
    ),
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  const complianceSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'complianceStatement',
    ),
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  const workContractorSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'workContractorName',
    ),
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  const additionalInfoSourceLabel = getTemplateFieldSourceLabel(
    isManualTemplate,
    isManualDraftFieldDifferentFromObjectTemplate(
      selectedDraft,
      objectDefaults,
      'additionalInfo',
    ) ||
      isManualDraftFieldDifferentFromObjectTemplate(selectedDraft, objectDefaults, 'copiesCount'),
    differsFromTemplateSourceLabel,
    linkedTemplateSourceLabel,
  );
  return (
    <section
      className="current-act-editor"
      aria-labelledby="current-act-title"
      aria-label={`Документ ${documentLabel}`}
    >
      <div className="scope-heading current-act-editor__heading">
        <p className="scope-label">АОСР</p>
        <h3 id="current-act-title">Редактирование акта {documentLabel}</h3>
        <dl className="current-act-metadata" aria-label="Метаданные документа">
          <div>
            <dt>Акт</dt>
            <dd>{documentLabel}</dd>
          </div>
          <div>
            <dt>Шаблонные значения</dt>
            <dd>{isManualTemplate ? 'Ручной режим' : 'Связан с разделом'}</dd>
          </div>
        </dl>
        <div className="template-mode-actions" aria-label="Режим шаблонных данных">
          {isManualTemplate ? (
            <>
              <span className="source-chip">Ручной режим</span>
              <p className="helper-note">
                Акт в ручном режиме. Изменения шаблонных значений раздела не применяются к этому
                акту.
              </p>
              <button
                className="compact-toggle compact-toggle--accent"
                onClick={onReturnDraftToLinkedTemplate}
                type="button"
              >
                Вернуть связь с шаблонными значениями
              </button>
            </>
          ) : (
            <>
              <span className="source-chip">{linkedTemplateSourceLabel}</span>
              <button
                className="compact-toggle"
                onClick={onSwitchDraftToManualTemplate}
                type="button"
              >
                Сделать акт ручным
              </button>
            </>
          )}
        </div>
      </div>

      <section
        className="form-section act-editor-card act-editor-card--featured"
        aria-labelledby="act-header-data-title"
      >
        <h3 id="act-header-data-title">1. Номер и дата акта</h3>
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
        sourceLabel={objectDataSourceLabel}
        summary={templateFields.objectName}
        sectionName={sectionName}
        title="2. Объект и участники"
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
        differentSourceLabel={differsFromTemplateSourceLabel}
        headerOrganizations={templateFields.headerOrganizations}
        isTemplateEditable={isManualTemplate}
        linkedHeaderOrganizations={linkedTemplateFields.headerOrganizations}
        onMoveHeaderOrganization={onMoveHeaderOrganization}
        onUpdateHeaderOrganization={onUpdateHeaderOrganization}
        sourceLabel={templateSourceLabel}
      />

      <DemoSignatoriesEditor
        actRepresentativeSearch={actRepresentativeSearch}
        differentSourceLabel={differsFromTemplateSourceLabel}
        draggedRepresentativeId={draggedRepresentativeId}
        dropTargetRepresentativeId={dropTargetRepresentativeId}
        isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
        isTemplateEditable={isManualTemplate}
        manualRepresentativeForm={manualRepresentativeForm}
        objectRepresentatives={objectDefaults.representativeLibrary}
        linkedSignatories={linkedTemplateFields.representatives}
        selectedSignatories={selectedSignatories}
        sourceLabel={templateSourceLabel}
        templateScopeNominative={templateScopeNominative}
        onAddManualRepresentative={onAddManualRepresentative}
        onAddRepresentativeToAct={onAddRepresentativeToAct}
        onChangeActRepresentativeSearch={onChangeActRepresentativeSearch}
        onChangeManualRepresentativeForm={onChangeManualRepresentativeForm}
        onDragRepresentativeEnd={onDragRepresentativeEnd}
        onDragRepresentativeStart={onDragRepresentativeStart}
        onDragRepresentativeTarget={onDragRepresentativeTarget}
        onMoveSelectedSignatory={onMoveSelectedSignatory}
        onRemoveRepresentativeFromAct={onRemoveRepresentativeFromAct}
        onUpdateRepresentative={onUpdateRepresentative}
        onReorderSelectedSignatory={onReorderSelectedSignatory}
        onToggleManualRepresentativeForm={onToggleManualRepresentativeForm}
      />

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="work-contractor-data-title"
        sourceLabel={workContractorSourceLabel}
        summary={templateFields.workContractorName}
        sectionName={sectionName}
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
        <h3 id="hidden-works-data-title">4. Выполненные работы</h3>
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
          <p className="helper-note act-form-grid__wide">
            Место выполнения укажите в описании работ, осях и отметках — так оно будет понятно в
            акте без отдельного технического поля.
          </p>
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

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="project-docs-data-title"
        sourceLabel={projectDocumentationSourceLabel}
        summary={templateFields.projectDocumentation}
        sectionName={sectionName}
        title="6. Документы-основания"
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

      <TemplateOwnedSection
        defaultOpen={isManualTemplate}
        id="compliance-data-title"
        sourceLabel={complianceSourceLabel}
        summary={templateFields.complianceStatement}
        sectionName={sectionName}
        title="7. Соответствие работ требованиям"
      >
        <label className="act-form-grid__wide">
          Текст соответствия работ требованиям
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
        <h3 id="subsequent-data-title">8. Последующие работы</h3>
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
        sourceLabel={additionalInfoSourceLabel}
        summary={`Экземпляров: ${templateFields.copiesLine}`}
        sectionName={sectionName}
        title="10. Дополнительные сведения / экземпляры / подписи"
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
  readonly sourceLabel: string;
  readonly summary: string;
  readonly sectionName?: string | undefined;
  readonly title: string;
}

function TemplateOwnedSection({
  children,
  defaultOpen,
  id,
  sourceLabel,
  summary,
  sectionName,
  title,
}: TemplateOwnedSectionProps): React.JSX.Element {
  const isManual = sourceLabel !== 'Шаблонные значения';
  const sectionTemplateIntro =
    sectionName === undefined
      ? 'Эти данные взяты из шаблонных значений раздела.'
      : `Эти данные взяты из шаблонных значений раздела «${sectionName}».`;

  return (
    <section className="form-section act-editor-card template-owned-section" aria-labelledby={id}>
      <details className="template-data-disclosure" open={defaultOpen ? true : undefined}>
        <summary>
          <span>
            <strong id={id}>{title}</strong>
            <small>{summary}</small>
          </span>
          <span className="source-chip">{isManual ? sourceLabel : 'Шаблонные значения'}</span>
        </summary>
        <div className="template-data-disclosure__body">
          <p className="template-data-disclosure__intro">
            {isManual
              ? 'Акт в ручном режиме. Эти значения меняются только в этом акте. Изменения шаблонных значений раздела больше не применяются к этому акту.'
              : `${sectionTemplateIntro} Они автоматически применяются к связанным актам этого раздела. Чтобы изменить их только в этом акте, сначала сделайте акт ручным.`}
          </p>
          {children}
        </div>
      </details>
    </section>
  );
}

function getTemplateFieldSourceLabel(
  isManualTemplate: boolean,
  isDifferent: boolean,
  differentSourceLabel: string,
  linkedSourceLabel: string,
): string {
  if (!isManualTemplate) {
    return linkedSourceLabel;
  }

  return isDifferent ? differentSourceLabel : 'Ручная версия';
}
