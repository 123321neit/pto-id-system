import { type SyntheticEvent, useEffect, useState } from 'react';

import { getDemoActTypeById } from '../act-types/act-types.js';
import { DocumentPreviewDrawer } from '../document-preview/DocumentPreviewDrawer.js';
import {
  getCertificateDocumentName,
  type DemoCertificate,
  type DemoOrganization,
  type DemoRepresentative,
  useDemoStore,
} from '../demo-store/demo-store.js';
import {
  addObjectDocumentToDraft,
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  addRepresentativeToDraft,
  addRepresentativeToLibrary,
  demoAosrWorkspace,
  getDraftApplications,
  getDraftObjectDocuments,
  getIncludedDraftApplications,
  getDraftMaterialCertificates,
  getDraftRepresentatives,
  moveHeaderOrganizationBlock,
  moveRepresentativeInDraft,
  removeMaterialCertificateFromDraft,
  removeObjectDocumentFromDraft,
  removeRepresentativeFromDraft,
  reorderDraftRepresentatives,
  resetDraftComplianceToObjectDefault,
  startDraftComplianceOverride,
  toggleApplicationInclusionInDraft,
  updateDemoAosrDraftField,
  updateDemoObjectDefaultsField,
  updateDraftComplianceOverride,
  type DemoAosrDraft,
  type DemoAosrDraftField,
  type DemoAosrHeaderOrganization,
  type DemoAosrObjectDefaults,
  type DemoAosrObjectDefaultsField,
  type DemoAosrRepresentative,
  type DemoGlobalOrganization,
  type DemoMaterialCertificate,
  type DemoObjectDocumentType,
} from './demo-aosr-workspace.js';
import {
  createRepresentativeFromForm,
  emptyHeaderOrganizationForm,
  emptyRepresentativeForm,
  formatDocumentDate,
  type HeaderOrganizationFormState,
  type MoveDirection,
  type RepresentativeFormState,
} from './demo-aosr-ui.js';
import { DemoAosrPreview } from './DemoAosrPreview.js';
import { DemoCurrentActEditor } from './DemoCurrentActEditor.js';
import { DemoDocumentTree } from './DemoDocumentTree.js';
import { DemoObjectSettingsPanel } from './DemoObjectSettingsPanel.js';

const aosrActType = getDemoActTypeById('aosr');

interface DemoAosrWorkspacePageProps {
  readonly initialDocumentPreviewOpen?: boolean;
  readonly initialSelectedDraftId?: string;
  readonly isEmbeddedInObjectWorkspace?: boolean;
  readonly onBackToObjects?: () => void;
  readonly onObjectSettingsClosed?: () => void;
  readonly periodName?: string;
  readonly settingsOpenRequest?: number;
}

export function DemoAosrWorkspacePage({
  initialDocumentPreviewOpen = false,
  initialSelectedDraftId,
  isEmbeddedInObjectWorkspace = false,
  onBackToObjects,
  onObjectSettingsClosed,
  periodName,
  settingsOpenRequest,
}: DemoAosrWorkspacePageProps = {}): React.JSX.Element {
  const { certificates, objectDocuments, organizations, representatives } = useDemoStore();
  const globalOrganizations = organizations.map(toDemoGlobalOrganization);
  const globalRepresentatives = representatives.map(toDemoAosrRepresentative);
  const certificateLibrary = certificates.flatMap(toDemoMaterialCertificates);
  const [objectDefaults, setObjectDefaults] = useState<DemoAosrObjectDefaults>(() => ({
    ...demoAosrWorkspace.objectDefaults,
    representativeLibrary: globalRepresentatives,
  }));
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(demoAosrWorkspace.drafts);
  const [selectedDraftId, setSelectedDraftId] = useState(
    initialSelectedDraftId ?? demoAosrWorkspace.drafts[0]?.id ?? '',
  );
  const [draggedDraftId, setDraggedDraftId] = useState<string | null>(null);
  const [draggedRepresentativeId, setDraggedRepresentativeId] = useState<string | null>(null);
  const [isObjectSettingsOpen, setObjectSettingsOpen] = useState(false);
  const [isHeaderOrganizationFormOpen, setHeaderOrganizationFormOpen] = useState(false);
  const [isRepresentativeLibraryOpen, setRepresentativeLibraryOpen] = useState(false);
  const [isRepresentativeLibraryFormOpen, setRepresentativeLibraryFormOpen] = useState(false);
  const [isManualRepresentativeFormOpen, setManualRepresentativeFormOpen] = useState(false);
  const [isCertificateLibraryOpen, setCertificateLibraryOpen] = useState(false);
  const [isObjectDocumentLibraryOpen, setObjectDocumentLibraryOpen] = useState(false);
  const [isDocumentPreviewOpen, setDocumentPreviewOpen] = useState(initialDocumentPreviewOpen);
  const [headerOrganizationForm, setHeaderOrganizationForm] = useState<HeaderOrganizationFormState>(
    emptyHeaderOrganizationForm,
  );
  const [libraryRepresentativeForm, setLibraryRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);
  const [manualRepresentativeForm, setManualRepresentativeForm] =
    useState<RepresentativeFormState>(emptyRepresentativeForm);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [representativeSearch, setRepresentativeSearch] = useState('');
  const [actRepresentativeSearch, setActRepresentativeSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [objectDocumentSearch, setObjectDocumentSearch] = useState('');
  const [objectDocumentTypeFilter, setObjectDocumentTypeFilter] = useState<
    'all' | DemoObjectDocumentType
  >('all');
  const [createdHeaderOrganizationCount, setCreatedHeaderOrganizationCount] = useState(1);
  const [createdRepresentativeCount, setCreatedRepresentativeCount] = useState(1);

  useEffect(() => {
    if (settingsOpenRequest !== undefined && settingsOpenRequest > 0) {
      setObjectSettingsOpen(true);
    }
  }, [settingsOpenRequest]);

  useEffect(() => {
    if (initialSelectedDraftId !== undefined) {
      setSelectedDraftId(initialSelectedDraftId);
    }
  }, [initialSelectedDraftId]);

  const selectedDraft = getSelectedDraft(drafts, selectedDraftId);
  const selectedSignatories = getDraftRepresentatives(selectedDraft);
  const selectedMaterials = getDraftMaterialCertificates(selectedDraft, certificateLibrary);
  const selectedObjectDocuments = getDraftObjectDocuments(selectedDraft, objectDocuments);
  const allApplications = getDraftApplications(selectedDraft, certificateLibrary, objectDocuments);
  const finalApplications = getIncludedDraftApplications(
    selectedDraft,
    certificateLibrary,
    objectDocuments,
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

  const updateHeaderOrganizationForm = (
    field: keyof HeaderOrganizationFormState,
    value: string,
  ): void => {
    setHeaderOrganizationForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const updateLibraryRepresentativeForm = (
    field: keyof RepresentativeFormState,
    value: string,
  ): void => {
    setLibraryRepresentativeForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const updateManualRepresentativeForm = (
    field: keyof RepresentativeFormState,
    value: string,
  ): void => {
    setManualRepresentativeForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const addConfiguredHeaderOrganization = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const caption = headerOrganizationForm.caption.trim();
    const globalOrganizationId = headerOrganizationForm.globalOrganizationId.trim();
    const headerOrganization: DemoAosrHeaderOrganization = {
      details: headerOrganizationForm.details.trim(),
      id: `header-organization-created-${String(createdHeaderOrganizationCount)}`,
      label: headerOrganizationForm.label.trim(),
      organizationName: headerOrganizationForm.organizationName.trim(),
      ...(caption === '' ? {} : { caption }),
      ...(globalOrganizationId === '' ? {} : { globalOrganizationId }),
    };

    setObjectDefaults((currentDefaults) =>
      addHeaderOrganizationBlock(currentDefaults, headerOrganization),
    );
    setCreatedHeaderOrganizationCount((currentCount) => currentCount + 1);
    setHeaderOrganizationForm(emptyHeaderOrganizationForm);
    setOrganizationSearch('');
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
    setRepresentativeSearch('');
    setRepresentativeLibraryFormOpen(false);
    setRepresentativeLibraryOpen(true);
  };

  const addManualRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const representative = createRepresentativeFromForm(
      `representative-created-${String(createdRepresentativeCount)}`,
      manualRepresentativeForm,
    );

    setObjectDefaults((currentDefaults) =>
      addRepresentativeToLibrary(currentDefaults, representative),
    );

    updateSelectedDraftWith((draft) => addRepresentativeToDraft(draft, representative));
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);
    setManualRepresentativeForm(emptyRepresentativeForm);
    setManualRepresentativeFormOpen(false);
  };

  const selectGlobalOrganization = (organization: DemoGlobalOrganization): void => {
    setHeaderOrganizationForm((currentForm) => ({
      ...currentForm,
      caption: organization.caption,
      details: organization.details,
      globalOrganizationId: organization.id,
      organizationName: organization.organizationName,
    }));
  };

  const selectGlobalRepresentative = (representative: DemoAosrRepresentative): void => {
    setLibraryRepresentativeForm({
      authorityBasis: representative.authorityBasis,
      details: representative.details ?? '',
      fullName: representative.fullName,
      globalRepresentativeId: representative.id,
      nrsId: representative.nrsId ?? '',
      organization: representative.organization,
      position: representative.position,
      roleLabel: representative.roleLabel,
    });
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

  const closeObjectSettings = (): void => {
    setObjectSettingsOpen(false);
    onObjectSettingsClosed?.();
  };

  return (
    <section
      aria-label="Рабочая область АОСР"
      className={`demo-shell${isEmbeddedInObjectWorkspace ? ' demo-shell--embedded' : ''}`}
    >
      <section className="workspace-header" aria-labelledby="workspace-title">
        <div className="workspace-header__main">
          <p className="demo-pill">{demoAosrWorkspace.demoNotice}</p>
          <h1 id="workspace-title">
            {isEmbeddedInObjectWorkspace ? 'АОСР' : objectDefaults.projectName}
          </h1>
          <p className="workspace-header__meta">
            <span>{demoAosrWorkspace.name}</span>
            <span>{demoAosrWorkspace.projectCode}</span>
            <span>{demoAosrWorkspace.ownerName}</span>
          </p>
          <p
            className="workspace-header__current-act"
            aria-label={`Текущий документ: ${selectedDraft.actNumber}`}
          >
            Документ: <strong>{selectedDraft.actNumber}</strong>
            {periodName === undefined ? null : <span>{periodName}</span>}
          </p>
        </div>
        <div className="workspace-header__aside">
          <div className="workspace-actions">
            {onBackToObjects === undefined ? null : (
              <button className="secondary-action" onClick={onBackToObjects} type="button">
                Назад к объектам
              </button>
            )}
            <button
              className="secondary-action secondary-action--accent"
              onClick={() => {
                setObjectSettingsOpen(true);
              }}
              type="button"
            >
              Настройки объекта
            </button>
            <button
              aria-expanded={isDocumentPreviewOpen}
              className="secondary-action secondary-action--accent"
              onClick={() => {
                setDocumentPreviewOpen(true);
              }}
              type="button"
            >
              Предпросмотр документа
            </button>
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <DemoDocumentTree
          actType={aosrActType}
          draggedDraftId={draggedDraftId}
          drafts={drafts}
          periodName={periodName}
          selectedDraftId={selectedDraft.id}
          onDragEnd={() => {
            setDraggedDraftId(null);
          }}
          onDragStart={setDraggedDraftId}
          onReorderDrafts={reorderDrafts}
          onSelectDraft={setSelectedDraftId}
        />

        <section className="act-form-panel" aria-labelledby="act-form-title">
          <div className="panel-heading">
            <p className="section-kicker">Редактируемая демо-форма</p>
            <h2 id="act-form-title">Рабочая область акта</h2>
          </div>

          <div className="form-sections">
            <DemoCurrentActEditor
              actRepresentativeSearch={actRepresentativeSearch}
              allApplications={allApplications}
              certificateLibrary={certificateLibrary}
              documentSearch={objectDocumentSearch}
              documentTypeFilter={objectDocumentTypeFilter}
              draggedRepresentativeId={draggedRepresentativeId}
              isCertificateLibraryOpen={isCertificateLibraryOpen}
              isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
              isObjectDocumentLibraryOpen={isObjectDocumentLibraryOpen}
              manualRepresentativeForm={manualRepresentativeForm}
              materialSearch={materialSearch}
              objectDefaults={objectDefaults}
              objectDocumentLibrary={objectDocuments}
              selectedDraft={selectedDraft}
              selectedMaterials={selectedMaterials}
              selectedObjectDocuments={selectedObjectDocuments}
              selectedSignatories={selectedSignatories}
              onAddManualRepresentative={addManualRepresentative}
              onAddMaterialToAct={(certificateId) => {
                updateSelectedDraftWith((draft) =>
                  addMaterialCertificateToDraft(draft, certificateId),
                );
              }}
              onAddObjectDocumentToAct={(documentId) => {
                updateSelectedDraftWith((draft) => addObjectDocumentToDraft(draft, documentId));
              }}
              onAddRepresentativeToAct={(representative) => {
                updateSelectedDraftWith((draft) => addRepresentativeToDraft(draft, representative));
                setActRepresentativeSearch('');
              }}
              onChangeActRepresentativeSearch={setActRepresentativeSearch}
              onChangeDocumentSearch={setObjectDocumentSearch}
              onChangeDocumentTypeFilter={setObjectDocumentTypeFilter}
              onChangeManualRepresentativeForm={updateManualRepresentativeForm}
              onChangeMaterialSearch={setMaterialSearch}
              onDragRepresentativeEnd={() => {
                setDraggedRepresentativeId(null);
              }}
              onDragRepresentativeStart={setDraggedRepresentativeId}
              onMoveSelectedSignatory={moveSelectedSignatory}
              onRemoveMaterialFromAct={(certificateId) => {
                updateSelectedDraftWith((draft) =>
                  removeMaterialCertificateFromDraft(draft, certificateId),
                );
              }}
              onRemoveObjectDocumentFromAct={(documentId) => {
                updateSelectedDraftWith((draft) =>
                  removeObjectDocumentFromDraft(draft, documentId),
                );
              }}
              onRemoveRepresentativeFromAct={(representativeId) => {
                updateSelectedDraftWith((draft) =>
                  removeRepresentativeFromDraft(draft, representativeId),
                );
              }}
              onReorderSelectedSignatory={reorderSelectedSignatory}
              onResetDraftComplianceToObjectDefault={() => {
                updateSelectedDraftWith(resetDraftComplianceToObjectDefault);
              }}
              onStartDraftComplianceOverride={() => {
                updateSelectedDraftWith((draft) =>
                  startDraftComplianceOverride(draft, objectDefaults),
                );
              }}
              onToggleApplication={(applicationId) => {
                updateSelectedDraftWith((draft) =>
                  toggleApplicationInclusionInDraft(draft, applicationId),
                );
              }}
              onToggleCertificateLibrary={() => {
                setCertificateLibraryOpen((isOpen) => !isOpen);
              }}
              onToggleManualRepresentativeForm={() => {
                setManualRepresentativeFormOpen((isOpen) => !isOpen);
              }}
              onToggleObjectDocumentLibrary={() => {
                setObjectDocumentLibraryOpen((isOpen) => !isOpen);
              }}
              onUpdateDraftComplianceOverride={(value) => {
                updateSelectedDraftWith((draft) => updateDraftComplianceOverride(draft, value));
              }}
              onUpdateSelectedDraft={updateSelectedDraft}
            />
          </div>
        </section>
      </div>

      <DocumentPreviewDrawer
        context={
          <>
            <span>
              Акт <strong>{selectedDraft.actNumber}</strong>
            </span>
            <span>{formatDocumentDate(selectedDraft.actDate)}</span>
            <span>{finalApplications.length} приложений</span>
          </>
        }
        contextLabel="Контекст предпросмотра документа"
        eyebrow="HTML-макет печатной формы"
        isOpen={isDocumentPreviewOpen}
        onClose={() => {
          setDocumentPreviewOpen(false);
        }}
        title="Предпросмотр документа"
      >
        <DemoAosrPreview
          finalApplications={finalApplications}
          objectDefaults={objectDefaults}
          selectedDraft={selectedDraft}
          selectedMaterials={selectedMaterials}
          selectedObjectDocuments={selectedObjectDocuments}
          selectedSignatories={selectedSignatories}
        />
      </DocumentPreviewDrawer>

      {isObjectSettingsOpen ? (
        <DemoObjectSettingsPanel
          globalOrganizations={globalOrganizations}
          globalRepresentatives={globalRepresentatives}
          headerOrganizationForm={headerOrganizationForm}
          isHeaderOrganizationFormOpen={isHeaderOrganizationFormOpen}
          isRepresentativeLibraryFormOpen={isRepresentativeLibraryFormOpen}
          isRepresentativeLibraryOpen={isRepresentativeLibraryOpen}
          libraryRepresentativeForm={libraryRepresentativeForm}
          objectDefaults={objectDefaults}
          organizationSearch={organizationSearch}
          representativeSearch={representativeSearch}
          onAddHeaderOrganization={addConfiguredHeaderOrganization}
          onAddLibraryRepresentative={addLibraryRepresentative}
          onChangeHeaderOrganizationForm={updateHeaderOrganizationForm}
          onChangeLibraryRepresentativeForm={updateLibraryRepresentativeForm}
          onChangeOrganizationSearch={setOrganizationSearch}
          onChangeRepresentativeSearch={setRepresentativeSearch}
          onCloseObjectSettings={closeObjectSettings}
          onMoveHeaderOrganization={(headerOrganizationId, direction) => {
            setObjectDefaults((currentDefaults) =>
              moveHeaderOrganizationBlock(currentDefaults, headerOrganizationId, direction),
            );
          }}
          onSelectGlobalOrganization={selectGlobalOrganization}
          onSelectGlobalRepresentative={selectGlobalRepresentative}
          onToggleHeaderOrganizationForm={() => {
            setHeaderOrganizationFormOpen((isOpen) => !isOpen);
          }}
          onToggleRepresentativeLibrary={() => {
            setRepresentativeLibraryOpen((isOpen) => !isOpen);
          }}
          onToggleRepresentativeLibraryForm={() => {
            setRepresentativeLibraryFormOpen((isOpen) => !isOpen);
            setRepresentativeLibraryOpen(true);
          }}
          onUpdateObjectDefaults={updateObjectDefaults}
        />
      ) : null}
    </section>
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

function toDemoGlobalOrganization(organization: DemoOrganization): DemoGlobalOrganization {
  return {
    caption: organization.caption,
    details: organization.details,
    id: organization.id,
    organizationName: organization.name,
  };
}

function toDemoAosrRepresentative(representative: DemoRepresentative): DemoAosrRepresentative {
  const nrsId = getAosrNrsId(representative.nrsDetails);

  return {
    authorityBasis: representative.authorityBasis,
    fullName: representative.fullName,
    id: representative.id,
    organization: representative.organization,
    position: representative.position,
    roleLabel: representative.roleLabel,
    ...(representative.details === undefined ? {} : { details: representative.details }),
    ...(nrsId === undefined ? {} : { nrsId }),
  };
}

function toDemoMaterialCertificates(
  certificate: DemoCertificate,
): readonly DemoMaterialCertificate[] {
  return certificate.materials.map((material) => ({
    certificateNumber: certificate.documentNumber,
    documentName: getCertificateDocumentName(certificate),
    id: material.id,
    materialName: material.name,
  }));
}

function getAosrNrsId(nrsDetails: string | undefined): string | undefined {
  if (nrsDetails === undefined || nrsDetails.trim() === '') {
    return undefined;
  }

  return nrsDetails.trim().replace(/^НРС\s+/u, '');
}
