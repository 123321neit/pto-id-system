import type { SyntheticEvent } from 'react';

import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoAosrDraftField,
  DemoAosrObjectDefaults,
  DemoAosrRepresentative,
  DemoDerivedAttachment,
  DemoMaterialCertificate,
} from './demo-aosr-workspace.js';
import type { MoveDirection, RepresentativeFormState } from './demo-aosr-ui.js';
import { DemoDerivedApplicationsEditor } from './DemoDerivedApplicationsEditor.js';
import { DemoMaterialsSelector } from './DemoMaterialsSelector.js';
import { DemoSignatoriesEditor } from './DemoSignatoriesEditor.js';

interface DemoCurrentActEditorProps {
  readonly actRepresentativeSearch: string;
  readonly attachmentLibrary: readonly DemoDerivedAttachment[];
  readonly certificateLibrary: readonly DemoMaterialCertificate[];
  readonly draggedRepresentativeId: string | null;
  readonly finalApplications: readonly DemoActApplication[];
  readonly isCertificateLibraryOpen: boolean;
  readonly isManualRepresentativeFormOpen: boolean;
  readonly manualRepresentativeForm: RepresentativeFormState;
  readonly materialSearch: string;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
  readonly shouldAddManualRepresentativeToLibrary: boolean;
  readonly onAddManualRepresentative: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onAddMaterialToAct: (certificateId: string) => void;
  readonly onAddRepresentativeToAct: (representative: DemoAosrRepresentative) => void;
  readonly onChangeActRepresentativeSearch: (value: string) => void;
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
  readonly onRemoveRepresentativeFromAct: (representativeId: string) => void;
  readonly onReorderSelectedSignatory: (targetRepresentativeId: string) => void;
  readonly onToggleAttachment: (attachmentId: string) => void;
  readonly onToggleCertificateLibrary: () => void;
  readonly onToggleManualRepresentativeForm: () => void;
  readonly onUpdateSelectedDraft: (field: DemoAosrDraftField, value: string) => void;
}

export function DemoCurrentActEditor({
  actRepresentativeSearch,
  attachmentLibrary,
  certificateLibrary,
  draggedRepresentativeId,
  finalApplications,
  isCertificateLibraryOpen,
  isManualRepresentativeFormOpen,
  manualRepresentativeForm,
  materialSearch,
  objectDefaults,
  selectedDraft,
  selectedMaterials,
  selectedSignatories,
  shouldAddManualRepresentativeToLibrary,
  onAddManualRepresentative,
  onAddMaterialToAct,
  onAddRepresentativeToAct,
  onChangeActRepresentativeSearch,
  onChangeManualRepresentativeForm,
  onChangeMaterialSearch,
  onChangeShouldAddManualRepresentativeToLibrary,
  onDragRepresentativeEnd,
  onDragRepresentativeStart,
  onMoveSelectedSignatory,
  onRemoveMaterialFromAct,
  onRemoveRepresentativeFromAct,
  onReorderSelectedSignatory,
  onToggleAttachment,
  onToggleCertificateLibrary,
  onToggleManualRepresentativeForm,
  onUpdateSelectedDraft,
}: DemoCurrentActEditorProps): React.JSX.Element {
  return (
    <section className="form-section form-section--scope" aria-labelledby="current-act-title">
      <div className="scope-heading">
        <p className="scope-label">Текущий акт</p>
        <h3 id="current-act-title">Поля АОСР</h3>
      </div>

      <section className="form-section" aria-labelledby="act-header-data-title">
        <h3 id="act-header-data-title">Шапка акта</h3>
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
          <label>
            Место
            <input
              name="actPlace"
              onChange={(event) => {
                onUpdateSelectedDraft('actPlace', event.currentTarget.value);
              }}
              value={selectedDraft.actPlace}
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
                onUpdateSelectedDraft('location', event.currentTarget.value);
              }}
              value={selectedDraft.location}
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
            Отметка
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

      <section className="form-section" aria-labelledby="hidden-works-data-title">
        <h3 id="hidden-works-data-title">Предъявленные скрытые работы</h3>
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
      </section>

      <section className="form-section" aria-labelledby="project-docs-data-title">
        <h3 id="project-docs-data-title">Проектная документация</h3>
        <p className="readonly-field">{objectDefaults.defaultProjectDocumentation}</p>
        <p className="helper-note">
          Для демо этот блок берётся из объектовых значений по умолчанию.
        </p>
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

      <section className="form-section" aria-labelledby="period-data-title">
        <h3 id="period-data-title">Период выполнения работ</h3>
        <div className="act-form-grid act-form-grid--compact">
          <label>
            Работы выполнялись с
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
            Работы выполнялись по
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

      <section className="form-section" aria-labelledby="decision-data-title">
        <h3 id="decision-data-title">Решение комиссии и сведения</h3>
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

      <DemoDerivedApplicationsEditor
        attachmentLibrary={attachmentLibrary}
        finalApplications={finalApplications}
        selectedDraft={selectedDraft}
        onToggleAttachment={onToggleAttachment}
      />
    </section>
  );
}
