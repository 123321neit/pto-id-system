import type { SyntheticEvent } from 'react';

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
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoActApplicationsSection } from './DemoActApplicationsSection.js';
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
  readonly finalApplications: readonly DemoActApplication[];
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
  readonly shouldAddManualRepresentativeToLibrary: boolean;
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
  readonly onChangeShouldAddManualRepresentativeToLibrary: (value: boolean) => void;
  readonly onDragRepresentativeEnd: () => void;
  readonly onDragRepresentativeStart: (representativeId: string) => void;
  readonly onMoveSelectedSignatory: (representativeId: string, direction: MoveDirection) => void;
  readonly onRemoveMaterialFromAct: (certificateId: string) => void;
  readonly onRemoveObjectDocumentFromAct: (documentId: string) => void;
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleApplication: (applicationId: string) => void;
  readonly onToggleCertificateLibrary: () => void;
  readonly onToggleManualRepresentativeForm: () => void;
  readonly onToggleObjectDocumentLibrary: () => void;
  readonly onUpdateSelectedDraft: (field: DemoAosrDraftField, value: string) => void;
}

export function DemoCurrentActEditor({
  actRepresentativeSearch,
  allApplications,
  certificateLibrary,
  documentSearch,
  documentTypeFilter,
  draggedRepresentativeId,
  finalApplications,
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
  shouldAddManualRepresentativeToLibrary,
  onAddManualRepresentative,
  onAddMaterialToAct,
  onAddObjectDocumentToAct,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeDocumentSearch,
  onChangeDocumentTypeFilter,
  onChangeManualRepresentativeForm,
  onChangeMaterialSearch,
  onChangeShouldAddManualRepresentativeToLibrary,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
  onMoveSelectedSignatory,
  onRemoveMaterialFromAct,
  onRemoveObjectDocumentFromAct,
  onRemoveRepresentativeFromAct,
  onReorderSelectedSignatory,
  onToggleApplication,
  onToggleCertificateLibrary,
  onToggleManualRepresentativeForm,
  onToggleObjectDocumentLibrary,
  onUpdateSelectedDraft,
}: DemoCurrentActEditorProps): React.JSX.Element {
  return (
    <section
      className="current-act-editor"
      aria-labelledby="current-act-title"
      aria-label="Редактор текущего АОСР"
    >
      <div className="scope-heading current-act-editor__heading">
        <p className="scope-label">Уровень акта</p>
        <h3 id="current-act-title">Текущий акт</h3>
      </div>

      <dl className="act-summary-strip" aria-label="Сводка текущего акта">
        <div aria-label={`Материалы: ${String(selectedMaterials.length)}`}>
          <dt>Материалы</dt>
          <dd>{selectedMaterials.length}</dd>
        </div>
        <div aria-label={`Документы: ${String(selectedObjectDocuments.length)}`}>
          <dt>Документы</dt>
          <dd>{selectedObjectDocuments.length}</dd>
        </div>
        <div aria-label={`Приложения: ${String(finalApplications.length)}`}>
          <dt>Приложения</dt>
          <dd>{finalApplications.length}</dd>
        </div>
        <div aria-label={`Подписанты: ${String(selectedSignatories.length)}`}>
          <dt>Подписанты</dt>
          <dd>{selectedSignatories.length}</dd>
        </div>
        <div aria-label={`Статус: ${getDraftStatusLabel(selectedDraft.status)}`}>
          <dt>Статус</dt>
          <dd>{getDraftStatusLabel(selectedDraft.status)}</dd>
        </div>
      </dl>

      <section className="form-section act-editor-card" aria-labelledby="act-header-data-title">
        <h3 id="act-header-data-title">Общие данные акта</h3>
        <div className="act-form-grid act-form-grid--compact">
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
        </div>
      </section>

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
        <h3 id="compliance-data-title">6. Соответствие работ</h3>
        <label className="act-form-grid__wide">
          Работы выполнены в соответствии с
          <textarea
            className="large-field"
            name="complianceStatement"
            onChange={(event) => {
              onUpdateSelectedDraft('complianceStatement', event.currentTarget.value);
            }}
            rows={5}
            value={selectedDraft.complianceStatement}
          />
        </label>
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

      <DemoSignatoriesEditor
        actRepresentativeSearch={actRepresentativeSearch}
        draggedRepresentativeId={draggedRepresentativeId}
        isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
        manualRepresentativeForm={manualRepresentativeForm}
        objectRepresentatives={objectDefaults.representativeLibrary}
        selectedSignatories={selectedSignatories}
        shouldAddManualRepresentativeToLibrary={shouldAddManualRepresentativeToLibrary}
        onAddManualRepresentative={onAddManualRepresentative}
        onAddRepresentativeToAct={onAddRepresentativeToAct}
        onChangeActRepresentativeSearch={onChangeActRepresentativeSearch}
        onChangeManualRepresentativeForm={onChangeManualRepresentativeForm}
        onChangeShouldAddManualRepresentativeToLibrary={
          onChangeShouldAddManualRepresentativeToLibrary
        }
        onDragRepresentativeEnd={onDragRepresentativeEnd}
        onDragRepresentativeStart={onDragRepresentativeStart}
        onMoveSelectedSignatory={onMoveSelectedSignatory}
        onRemoveRepresentativeFromAct={onRemoveRepresentativeFromAct}
        onReorderSelectedSignatory={onReorderSelectedSignatory}
        onToggleManualRepresentativeForm={onToggleManualRepresentativeForm}
      />
    </section>
  );
}

function getDraftStatusLabel(status: DemoAosrDraft['status']): string {
  return status === 'draft' ? 'Черновик' : 'На проверку';
}
