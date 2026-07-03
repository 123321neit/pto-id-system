import { type SetStateAction, type SyntheticEvent, useEffect, useState } from 'react';

import { getDemoActTypeById, getDemoAosrFormVariantById } from '../act-types/act-types.js';
import type { SectionTemplateClipboard } from '../app-shell/section-template-clipboard.js';
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
  buildDemoAosrPrintState,
  createEmptyDemoAosrDraft,
  defaultAosrRepresentativeSubscript,
  demoAosrWorkspace,
  getCounterpartyLibraryItemFromGlobalOrganization,
  getDraftApplications,
  getDraftObjectDocuments,
  getIncludedDraftApplications,
  getDraftMaterialCertificates,
  getSignatoryLibraryItemFromRepresentative,
  moveHeaderOrganizationInDraft,
  moveHeaderOrganizationBlock,
  moveRepresentativeInDraft,
  removeMaterialCertificateFromDraft,
  removeObjectDocumentFromDraft,
  removeRepresentativeFromDraft,
  reorderDraftRepresentatives,
  resolveDemoAosrTemplateFields,
  returnDraftToLinkedTemplateMode,
  switchDraftToManualTemplateMode,
  toggleApplicationInclusionInDraft,
  updateDemoAosrDraftField,
  updateDemoSectionNumberingMode,
  updateDemoSectionNumberingAffix,
  updateDemoSectionNumberingScope,
  updateDemoSectionNumberingStart,
  updateDemoObjectDefaultsField,
  updateHeaderOrganizationInDraft,
  updateHeaderOrganizationBlock,
  updateObjectRepresentative,
  updateObjectRepresentativeGroupTitle,
  updateRepresentativeInDraft,
  type AosrPrintState,
  type DemoAosrDraft,
  type DemoAosrDraftField,
  type DemoAosrHeaderOrganization,
  type DemoAosrObjectDefaults,
  type DemoAosrObjectDefaultsField,
  type DemoAosrRepresentative,
  type DemoSectionTemplateSettings,
  type DemoAosrTemplateFields,
  type DemoDocumentNumberingAffixField,
  type DemoDocumentNumberingMode,
  type DemoDocumentNumberingScope,
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
import { downloadAosrDocx } from './aosr-docx-generator.js';
import { DemoAosrPreview } from './DemoAosrPreview.js';
import { DemoCurrentActEditor } from './DemoCurrentActEditor.js';
import { DemoDocumentTree } from './DemoDocumentTree.js';
import { DemoObjectSettingsPanel } from './DemoObjectSettingsPanel.js';

const aosrActType = getDemoActTypeById('aosr');
type DraftMoveDirection = 'down' | 'up';

interface DemoAosrWorkspacePageProps {
  readonly drafts?: readonly DemoAosrDraft[];
  readonly initialDocumentPreviewOpen?: boolean;
  readonly initialSelectedDraftId?: string;
  readonly isEmbeddedInObjectWorkspace?: boolean;
  readonly isSectionTemplateSettingsPage?: boolean;
  readonly lastTemplateCopyMessage?: string;
  readonly sectionTemplateClipboard?: SectionTemplateClipboard | null;
  readonly sectionTemplateSettings?: DemoSectionTemplateSettings;
  readonly sectionDraftCount?: number;
  /** Legacy compatibility alias for older standalone AOSR demo helpers. */
  readonly objectDefaults?: DemoAosrObjectDefaults;
  readonly onDraftsChange?: (drafts: readonly DemoAosrDraft[]) => void;
  readonly onCopySectionTemplate?: () => void;
  readonly onCreateActInFolder?: () => void;
  readonly onDeleteDraft?: (draftId: string, nextSelectedDraftId: string) => void;
  readonly onDuplicateDraft?: (draftId: string) => void;
  readonly onMoveDraft?: (draftId: string, direction: DraftMoveDirection) => void;
  readonly onPasteSectionTemplate?: () => void;
  readonly onRenumberSectionDrafts?: () => void;
  readonly onSectionTemplateSettingsChange?: (
    sectionTemplateSettings: DemoSectionTemplateSettings,
  ) => void;
  /** Legacy compatibility alias for older standalone AOSR demo helpers. */
  readonly onObjectDefaultsChange?: (objectDefaults: DemoAosrObjectDefaults) => void;
  readonly onBackToObjects?: () => void;
  readonly onObjectSettingsClosed?: () => void;
  readonly folderName?: string | undefined;
  readonly objectId?: string | undefined;
  readonly objectTitle?: string | undefined;
  readonly sectionId?: string | undefined;
  readonly sectionName?: string | undefined;
  readonly settingsOpenRequest?: number;
  readonly visibleDraftIds?: readonly string[];
}

export function DemoAosrWorkspacePage({
  drafts: controlledDrafts,
  initialDocumentPreviewOpen = false,
  initialSelectedDraftId,
  isEmbeddedInObjectWorkspace = false,
  isSectionTemplateSettingsPage = false,
  lastTemplateCopyMessage = '',
  sectionTemplateClipboard = null,
  sectionTemplateSettings: controlledSectionTemplateSettings,
  sectionDraftCount = 0,
  objectDefaults: controlledObjectDefaults,
  onDraftsChange,
  onCopySectionTemplate,
  onCreateActInFolder,
  onDeleteDraft,
  onDuplicateDraft,
  onMoveDraft,
  onPasteSectionTemplate,
  onRenumberSectionDrafts,
  onSectionTemplateSettingsChange,
  onObjectDefaultsChange,
  onBackToObjects,
  onObjectSettingsClosed,
  folderName,
  objectId,
  objectTitle,
  sectionId,
  sectionName,
  settingsOpenRequest,
  visibleDraftIds,
}: DemoAosrWorkspacePageProps = {}): React.JSX.Element {
  const {
    addOrganization,
    addRepresentative,
    certificates,
    objectDocuments,
    organizations,
    representatives,
    updateOrganization,
    updateRepresentative,
  } = useDemoStore();
  const globalOrganizations = organizations.map(toDemoGlobalOrganization);
  const globalRepresentatives = representatives.map(toDemoAosrRepresentative);
  const counterpartyLibrary = globalOrganizations.map(
    getCounterpartyLibraryItemFromGlobalOrganization,
  );
  const signatoryLibrary = globalRepresentatives.map(getSignatoryLibraryItemFromRepresentative);
  const certificateLibrary = certificates.flatMap(toDemoMaterialCertificates);
  const [localObjectDefaults, setLocalObjectDefaults] = useState<DemoAosrObjectDefaults>(
    demoAosrWorkspace.sectionTemplateSettings,
  );
  const objectDefaults =
    controlledSectionTemplateSettings ?? controlledObjectDefaults ?? localObjectDefaults;
  const [localDrafts, setLocalDrafts] = useState<readonly DemoAosrDraft[]>(
    demoAosrWorkspace.drafts,
  );
  const drafts = controlledDrafts ?? localDrafts;
  const visibleDrafts =
    visibleDraftIds === undefined
      ? drafts
      : visibleDraftIds
          .map((draftId) => drafts.find((draft) => draft.id === draftId))
          .filter((draft): draft is DemoAosrDraft => draft !== undefined);
  const [selectedDraftId, setSelectedDraftId] = useState(
    initialSelectedDraftId ?? demoAosrWorkspace.drafts[0]?.id ?? '',
  );
  const [draggedRepresentativeId, setDraggedRepresentativeId] = useState<string | null>(null);
  const [representativeDropTargetId, setRepresentativeDropTargetId] = useState<string | null>(null);
  const [isObjectSettingsOpen, setObjectSettingsOpen] = useState(false);
  const [isHeaderOrganizationFormOpen, setHeaderOrganizationFormOpen] = useState(false);
  const [isRepresentativeLibraryFormOpen, setRepresentativeLibraryFormOpen] = useState(false);
  const [isManualRepresentativeFormOpen, setManualRepresentativeFormOpen] = useState(false);
  const [isCertificateLibraryOpen, setCertificateLibraryOpen] = useState(false);
  const [isObjectDocumentLibraryOpen, setObjectDocumentLibraryOpen] = useState(false);
  const [isDocumentPreviewOpen, setDocumentPreviewOpen] = useState(initialDocumentPreviewOpen);
  const [activeActMode, setActiveActMode] = useState<'edit' | 'preview'>(
    initialDocumentPreviewOpen ? 'preview' : 'edit',
  );
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
  const [docxDownloadError, setDocxDownloadError] = useState('');
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

  const selectedDraft = getSelectedDraft(visibleDrafts, selectedDraftId, objectDefaults);
  const selectedDocumentLabel =
    selectedDraft.actNumber.trim() === '' ? 'Без номера' : selectedDraft.actNumber;
  const selectedFormVariant = {
    ...getDemoAosrFormVariantById(selectedDraft.formVariantId),
    printTitle: selectedDraft.formVariantPrintTitle,
    title: selectedDraft.formVariantTitle,
  };
  const selectedTemplateFields: DemoAosrTemplateFields = resolveDemoAosrTemplateFields({
    counterpartyLibrary,
    draft: selectedDraft,
    objectDefaults,
    signatoryLibrary,
  });
  const linkedTemplateFields: DemoAosrTemplateFields = resolveDemoAosrTemplateFields({
    counterpartyLibrary,
    draft: returnDraftToLinkedTemplateMode(selectedDraft),
    objectDefaults,
    signatoryLibrary,
  });
  const selectedSignatories = selectedTemplateFields.representatives;
  const selectedMaterials = getDraftMaterialCertificates(selectedDraft, certificateLibrary);
  const selectedObjectDocuments = getDraftObjectDocuments(selectedDraft, objectDocuments);
  const allApplications = getDraftApplications(selectedDraft, certificateLibrary, objectDocuments);
  const finalApplications = getIncludedDraftApplications(
    selectedDraft,
    certificateLibrary,
    objectDocuments,
  );
  const printState: AosrPrintState = buildDemoAosrPrintState({
    counterpartyLibrary,
    draft: selectedDraft,
    finalApplications,
    objectDefaults,
    selectedMaterials,
    selectedObjectDocuments,
    signatoryLibrary,
  });

  useEffect(() => {
    setDocxDownloadError('');
  }, [selectedDraft.id]);

  const downloadSelectedAosrDocx = async (): Promise<void> => {
    setDocxDownloadError('');

    try {
      await downloadAosrDocx(printState);
    } catch (error) {
      console.error('AOSR DOCX generation failed', error);
      setDocxDownloadError(
        'Не удалось сформировать DOCX. Проверьте шаблон акта и данные документа.',
      );
      setActiveActMode('edit');
    }
  };

  const handleDownloadSelectedAosrDocx = (): void => {
    void downloadSelectedAosrDocx();
  };

  const deleteDraft = (draftId: string = selectedDraft.id): void => {
    const draftToDelete = visibleDrafts.find((draft) => draft.id === draftId);

    if (draftToDelete === undefined) {
      return;
    }

    const currentDraftId = draftToDelete.id;
    const currentDocumentLabel =
      draftToDelete.actNumber.trim() === '' ? 'без номера' : draftToDelete.actNumber;
    const nextSelectedDraftId =
      selectedDraft.id === currentDraftId
        ? (visibleDrafts.find((draft) => draft.id !== currentDraftId)?.id ?? '')
        : selectedDraft.id;
    const shouldDelete = window.confirm(
      `Удалить акт ${currentDocumentLabel}? Акт будет удалён из текущей папки.`,
    );

    if (!shouldDelete) {
      return;
    }

    commitDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== currentDraftId));
    onDeleteDraft?.(currentDraftId, nextSelectedDraftId);
    setSelectedDraftId(nextSelectedDraftId);
    setDocxDownloadError('');
    setActiveActMode('edit');
  };

  const updateObjectDefaults = (field: DemoAosrObjectDefaultsField, value: string): void => {
    commitObjectDefaults((currentDefaults) =>
      updateDemoObjectDefaultsField(currentDefaults, field, value),
    );
  };

  const updateObjectHeaderOrganization = (
    headerOrganization: DemoAosrHeaderOrganization,
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ): void => {
    if (headerOrganization.globalOrganizationId !== undefined) {
      if (field === 'organizationName') {
        updateOrganization(headerOrganization.globalOrganizationId, 'name', value);
      }

      if (field === 'details') {
        updateOrganization(headerOrganization.globalOrganizationId, 'details', value);
      }
    }

    commitObjectDefaults((currentDefaults) =>
      updateHeaderOrganizationBlock(currentDefaults, headerOrganization.id, field, value),
    );
  };

  const updateObjectRepresentativeValue = (
    groupId: string,
    memberId: string,
    signatoryId: string,
    field: 'authorityBasis' | 'details' | 'fullName' | 'nrsId' | 'organization' | 'position',
    value: string,
  ): void => {
    if (field !== 'details') {
      updateRepresentative(signatoryId, field === 'nrsId' ? 'nrsDetails' : field, value);
    }

    commitObjectDefaults((currentDefaults) =>
      updateObjectRepresentative(currentDefaults, groupId, memberId, signatoryId, field, value),
    );
  };

  const updateSelectedDraft = (field: DemoAosrDraftField, value: string): void => {
    updateSelectedDraftWith((draft) => updateDemoAosrDraftField(draft, field, value));
  };

  const updateSelectedDraftWith = (updater: (draft: DemoAosrDraft) => DemoAosrDraft): void => {
    commitDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === selectedDraft.id ? updater(draft) : draft)),
    );
  };

  const switchSelectedDraftToManualTemplate = (): void => {
    const shouldSwitch = window.confirm(
      sectionName === undefined
        ? 'Этот акт станет ручной версией. Шаблонные значения больше не будут обновлять этот акт. Изменения будут действовать только здесь.'
        : `Этот акт станет ручной версией. Шаблонные значения раздела «${sectionName}» больше не будут обновлять этот акт. Изменения будут действовать только здесь.`,
    );

    if (!shouldSwitch) {
      return;
    }

    updateSelectedDraftWith((draft) =>
      switchDraftToManualTemplateMode({
        counterpartyLibrary,
        draft,
        objectDefaults,
        signatoryLibrary,
      }),
    );
  };

  const returnSelectedDraftToLinkedTemplate = (): void => {
    updateSelectedDraftWith(returnDraftToLinkedTemplateMode);
  };

  const commitDrafts = (draftsAction: SetStateAction<readonly DemoAosrDraft[]>): void => {
    if (controlledDrafts === undefined) {
      setLocalDrafts(draftsAction);
      return;
    }

    const nextDrafts =
      typeof draftsAction === 'function' ? draftsAction(controlledDrafts) : draftsAction;

    onDraftsChange?.(nextDrafts);
  };

  const commitObjectDefaults = (
    objectDefaultsAction: SetStateAction<DemoAosrObjectDefaults>,
  ): void => {
    const controlledTemplateSettings =
      controlledSectionTemplateSettings ?? controlledObjectDefaults;

    if (controlledTemplateSettings === undefined) {
      setLocalObjectDefaults(objectDefaultsAction);
      return;
    }

    const nextObjectDefaults =
      typeof objectDefaultsAction === 'function'
        ? objectDefaultsAction(controlledTemplateSettings)
        : objectDefaultsAction;

    onSectionTemplateSettingsChange?.(nextObjectDefaults);
    onObjectDefaultsChange?.(nextObjectDefaults);
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
    const selectedGlobalOrganizationId = headerOrganizationForm.globalOrganizationId.trim();
    const selectedGlobalOrganization = globalOrganizations.find(
      ({ id }) => id === selectedGlobalOrganizationId,
    );
    const globalOrganizationId =
      selectedGlobalOrganizationId === ''
        ? addOrganization({
            details: headerOrganizationForm.details,
            name: headerOrganizationForm.organizationName,
            usageNote: `Используется в шаблоне объекта как «${headerOrganizationForm.label.trim()}».`,
          }).id
        : selectedGlobalOrganizationId;
    const headerOrganization: DemoAosrHeaderOrganization = {
      details: headerOrganizationForm.details.trim(),
      id: `header-organization-created-${String(createdHeaderOrganizationCount)}`,
      label: headerOrganizationForm.label.trim(),
      organizationName: headerOrganizationForm.organizationName.trim(),
      ...(caption === '' || caption === selectedGlobalOrganization?.caption ? {} : { caption }),
      globalOrganizationId,
    };

    commitObjectDefaults((currentDefaults) =>
      addHeaderOrganizationBlock(currentDefaults, headerOrganization),
    );
    setCreatedHeaderOrganizationCount((currentCount) => currentCount + 1);
    setHeaderOrganizationForm(emptyHeaderOrganizationForm);
    setOrganizationSearch('');
    setHeaderOrganizationFormOpen(false);
  };

  const addLibraryRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const selectedGlobalRepresentativeId = libraryRepresentativeForm.globalRepresentativeId.trim();
    const globalRepresentativeId =
      selectedGlobalRepresentativeId === ''
        ? addRepresentative({
            authorityBasis: libraryRepresentativeForm.authorityBasis,
            fullName: libraryRepresentativeForm.fullName,
            nrsDetails: libraryRepresentativeForm.nrsId,
            organization: libraryRepresentativeForm.organization,
            position: libraryRepresentativeForm.position,
            roleLabel: libraryRepresentativeForm.roleLabel,
          }).id
        : selectedGlobalRepresentativeId;
    const createdRepresentative = createRepresentativeFromForm(
      `representative-created-${String(createdRepresentativeCount)}`,
      { ...libraryRepresentativeForm, globalRepresentativeId },
    );
    const selectedGlobalRepresentative = globalRepresentatives.find(
      ({ id }) => id === selectedGlobalRepresentativeId,
    );
    const representative =
      createdRepresentative.details !== undefined &&
      createdRepresentative.details === selectedGlobalRepresentative?.details
        ? omitRepresentativeDetails(createdRepresentative)
        : createdRepresentative;

    commitObjectDefaults((currentDefaults) =>
      addRepresentativeToLibrary(currentDefaults, representative),
    );
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);
    setLibraryRepresentativeForm(emptyRepresentativeForm);
    setRepresentativeSearch('');
    setRepresentativeLibraryFormOpen(false);
  };

  const addManualRepresentative = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const representative = createRepresentativeFromForm(
      `representative-created-${String(createdRepresentativeCount)}`,
      manualRepresentativeForm,
    );

    updateSelectedDraftWith((draft) =>
      draft.templateMode === 'manual' ? addRepresentativeToDraft(draft, representative) : draft,
    );
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
      details: representative.details ?? defaultAosrRepresentativeSubscript,
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
      setRepresentativeDropTargetId(null);
      return;
    }

    updateSelectedDraftWith((draft) =>
      reorderDraftRepresentatives(draft, draggedRepresentativeId, targetRepresentativeId),
    );
    setDraggedRepresentativeId(null);
    setRepresentativeDropTargetId(null);
  };

  const moveDraft = (draftId: string, direction: DraftMoveDirection): void => {
    if (onMoveDraft === undefined) {
      commitDrafts((currentDrafts) => moveItemByDirection(currentDrafts, draftId, direction));
    } else {
      onMoveDraft(draftId, direction);
    }

    setSelectedDraftId(draftId);
  };

  const closeObjectSettings = (): void => {
    setObjectSettingsOpen(false);
    onObjectSettingsClosed?.();
  };

  if (isSectionTemplateSettingsPage) {
    return (
      <DemoObjectSettingsPanel
        globalOrganizations={globalOrganizations}
        globalRepresentatives={globalRepresentatives}
        headerOrganizationForm={headerOrganizationForm}
        isHeaderOrganizationFormOpen={isHeaderOrganizationFormOpen}
        isRepresentativeLibraryFormOpen={isRepresentativeLibraryFormOpen}
        lastTemplateCopyMessage={lastTemplateCopyMessage}
        libraryRepresentativeForm={libraryRepresentativeForm}
        objectDefaults={objectDefaults}
        organizationSearch={organizationSearch}
        objectId={objectId}
        objectTitle={objectTitle}
        presentation="page"
        representativeSearch={representativeSearch}
        sectionDraftCount={sectionDraftCount}
        sectionId={sectionId}
        sectionTemplateClipboard={sectionTemplateClipboard}
        onAddHeaderOrganization={addConfiguredHeaderOrganization}
        onAddLibraryRepresentative={addLibraryRepresentative}
        onChangeHeaderOrganizationForm={updateHeaderOrganizationForm}
        onChangeLibraryRepresentativeForm={updateLibraryRepresentativeForm}
        onChangeOrganizationSearch={setOrganizationSearch}
        onChangeRepresentativeSearch={setRepresentativeSearch}
        onCloseObjectSettings={closeObjectSettings}
        onCopySectionTemplate={onCopySectionTemplate}
        onMoveHeaderOrganization={(headerOrganizationId, direction) => {
          commitObjectDefaults((currentDefaults) =>
            moveHeaderOrganizationBlock(currentDefaults, headerOrganizationId, direction),
          );
        }}
        onSelectGlobalOrganization={selectGlobalOrganization}
        onSelectGlobalRepresentative={selectGlobalRepresentative}
        sectionName={sectionName}
        onToggleHeaderOrganizationForm={() => {
          setHeaderOrganizationFormOpen((isOpen) => !isOpen);
        }}
        onToggleRepresentativeLibraryForm={() => {
          setRepresentativeLibraryFormOpen((isOpen) => !isOpen);
        }}
        onUpdateHeaderOrganization={updateObjectHeaderOrganization}
        onUpdateNumberingMode={(numberingMode: DemoDocumentNumberingMode) => {
          commitObjectDefaults((currentDefaults) =>
            updateDemoSectionNumberingMode(currentDefaults, numberingMode),
          );
        }}
        onUpdateNumberingAffix={(field: DemoDocumentNumberingAffixField, value: string) => {
          commitObjectDefaults((currentDefaults) =>
            updateDemoSectionNumberingAffix(currentDefaults, field, value),
          );
        }}
        onUpdateNumberingScope={(numberingScope: DemoDocumentNumberingScope) => {
          commitObjectDefaults((currentDefaults) =>
            updateDemoSectionNumberingScope(currentDefaults, numberingScope),
          );
        }}
        onUpdateNumberingStart={(numberingStart: number) => {
          commitObjectDefaults((currentDefaults) =>
            updateDemoSectionNumberingStart(currentDefaults, numberingStart),
          );
        }}
        onUpdateObjectDefaults={updateObjectDefaults}
        onPasteSectionTemplate={onPasteSectionTemplate}
        onRenumberSectionDrafts={onRenumberSectionDrafts}
        onUpdateRepresentative={updateObjectRepresentativeValue}
        onUpdateRepresentativeGroupTitle={(groupId, value) => {
          commitObjectDefaults((currentDefaults) =>
            updateObjectRepresentativeGroupTitle(currentDefaults, groupId, value),
          );
        }}
      />
    );
  }

  if (visibleDrafts.length === 0) {
    return (
      <section
        aria-label="Рабочая область АОСР"
        className={`demo-shell${isEmbeddedInObjectWorkspace ? ' demo-shell--embedded' : ''}`}
      >
        <section className="workspace-header" aria-labelledby="workspace-title">
          <div className="workspace-header__main">
            <p className="demo-pill">
              {isEmbeddedInObjectWorkspace ? 'Папка ИД' : demoAosrWorkspace.demoNotice}
            </p>
            <h1 id="workspace-title">В папке нет актов</h1>
            <p className="workspace-header__meta">
              {sectionName === undefined ? null : <span>{sectionName}</span>}
              {folderName === undefined ? null : <span>{folderName}</span>}
            </p>
          </div>
          <div className="workspace-header__aside">
            <div className="workspace-actions">
              {onBackToObjects === undefined ? null : (
                <button className="secondary-action" onClick={onBackToObjects} type="button">
                  Назад к объектам
                </button>
              )}
              {onCreateActInFolder === undefined ? null : (
                <button
                  className="secondary-action secondary-action--accent"
                  onClick={onCreateActInFolder}
                  type="button"
                >
                  Создать акт
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="empty-state-card" aria-label="Пустая папка актов">
          <h2>Акт удалён</h2>
          <p>В этой папке пока нет актов. Создайте новый акт, когда будете готовы.</p>
        </section>
      </section>
    );
  }

  return (
    <section
      aria-label="Рабочая область АОСР"
      className={`demo-shell${isEmbeddedInObjectWorkspace ? ' demo-shell--embedded' : ''}`}
    >
      <section className="workspace-header" aria-labelledby="workspace-title">
        <div className="workspace-header__main">
          <p className="demo-pill">
            {isEmbeddedInObjectWorkspace ? 'Акт в папке ИД' : demoAosrWorkspace.demoNotice}
          </p>
          <h1 id="workspace-title">
            {isEmbeddedInObjectWorkspace ? selectedDocumentLabel : objectDefaults.projectName}
          </h1>
          <p className="workspace-header__meta">
            <span>
              {aosrActType.code} — {aosrActType.title}
            </span>
            {sectionName === undefined ? null : <span>{sectionName}</span>}
            {folderName === undefined ? null : <span>{folderName}</span>}
            {isEmbeddedInObjectWorkspace ? null : <span>{demoAosrWorkspace.ownerName}</span>}
          </p>
          <p
            className="workspace-header__current-act"
            aria-label={`Текущий акт: ${selectedDocumentLabel}`}
          >
            Акт: <strong>{selectedDocumentLabel}</strong>
            <span>{formatDocumentDate(selectedDraft.actDate)}</span>
          </p>
        </div>
        <div className="workspace-header__aside">
          <div className="workspace-actions">
            {onBackToObjects === undefined ? null : (
              <button className="secondary-action" onClick={onBackToObjects} type="button">
                Назад к объектам
              </button>
            )}
            {isEmbeddedInObjectWorkspace ? null : (
              <button
                className="secondary-action"
                onClick={() => {
                  setObjectSettingsOpen(true);
                }}
                type="button"
              >
                Шаблонные значения
              </button>
            )}
            {isEmbeddedInObjectWorkspace ? (
              <>
                <button
                  aria-pressed={activeActMode === 'preview'}
                  className="secondary-action secondary-action--accent"
                  onClick={() => {
                    setActiveActMode('preview');
                  }}
                  type="button"
                >
                  Предпросмотр
                </button>
                <button
                  aria-pressed={activeActMode === 'edit'}
                  className="secondary-action"
                  onClick={() => {
                    setActiveActMode('edit');
                  }}
                  type="button"
                >
                  Редактирование
                </button>
                <button
                  className="secondary-action"
                  onClick={handleDownloadSelectedAosrDocx}
                  type="button"
                >
                  Скачать DOCX
                </button>
                <button className="secondary-action" type="button">
                  Скачать PDF
                </button>
              </>
            ) : (
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
            )}
          </div>
        </div>
      </section>

      {isEmbeddedInObjectWorkspace && activeActMode === 'preview' ? (
        <section className="act-preview-mode" aria-label="Предпросмотр акта">
          <div className="preview-panel">
            <div className="panel-heading">
              <p className="section-kicker">Предпросмотр</p>
              <h2>Предпросмотр акта</h2>
            </div>
            <DemoAosrPreview formVariant={selectedFormVariant} printState={printState} />
          </div>
        </section>
      ) : (
        <div className="workspace-grid">
          <DemoDocumentTree
            actType={aosrActType}
            drafts={visibleDrafts}
            folderName={folderName}
            selectedDraftId={selectedDraft.id}
            onCreateAct={onCreateActInFolder}
            onDeleteDraft={deleteDraft}
            onDuplicateDraft={onDuplicateDraft}
            onMoveDraft={moveDraft}
            onSelectDraft={setSelectedDraftId}
          />

          <section className="act-form-panel" aria-label="Редактор документа">
            <div className="form-sections">
              <DemoCurrentActEditor
                actRepresentativeSearch={actRepresentativeSearch}
                allApplications={allApplications}
                certificateLibrary={certificateLibrary}
                documentSearch={objectDocumentSearch}
                documentTypeFilter={objectDocumentTypeFilter}
                draggedRepresentativeId={draggedRepresentativeId}
                dropTargetRepresentativeId={representativeDropTargetId}
                formVariant={selectedFormVariant}
                isCertificateLibraryOpen={isCertificateLibraryOpen}
                isManualRepresentativeFormOpen={isManualRepresentativeFormOpen}
                isObjectDocumentLibraryOpen={isObjectDocumentLibraryOpen}
                docxDownloadError={docxDownloadError}
                manualRepresentativeForm={manualRepresentativeForm}
                materialSearch={materialSearch}
                linkedTemplateFields={linkedTemplateFields}
                objectDefaults={objectDefaults}
                objectDocumentLibrary={objectDocuments}
                sectionName={sectionName}
                selectedDraft={selectedDraft}
                selectedMaterials={selectedMaterials}
                selectedObjectDocuments={selectedObjectDocuments}
                selectedSignatories={selectedSignatories}
                templateFields={selectedTemplateFields}
                onAddManualRepresentative={addManualRepresentative}
                onAddMaterialToAct={(certificateId) => {
                  const certificate = certificateLibrary.find(({ id }) => id === certificateId);

                  if (certificate === undefined) {
                    return;
                  }

                  updateSelectedDraftWith((draft) =>
                    addMaterialCertificateToDraft(draft, certificate),
                  );
                }}
                onAddObjectDocumentToAct={(documentId) => {
                  const document = objectDocuments.find(({ id }) => id === documentId);

                  if (document === undefined) {
                    return;
                  }

                  updateSelectedDraftWith((draft) => addObjectDocumentToDraft(draft, document));
                }}
                onAddRepresentativeToAct={(representative) => {
                  updateSelectedDraftWith((draft) =>
                    addRepresentativeToDraft(draft, representative),
                  );
                  setActRepresentativeSearch('');
                }}
                onChangeActRepresentativeSearch={setActRepresentativeSearch}
                onChangeDocumentSearch={setObjectDocumentSearch}
                onChangeDocumentTypeFilter={setObjectDocumentTypeFilter}
                onChangeManualRepresentativeForm={updateManualRepresentativeForm}
                onChangeMaterialSearch={setMaterialSearch}
                onDeleteAct={() => {
                  deleteDraft();
                }}
                onDownloadDocx={handleDownloadSelectedAosrDocx}
                onDragRepresentativeEnd={() => {
                  setDraggedRepresentativeId(null);
                  setRepresentativeDropTargetId(null);
                }}
                onDragRepresentativeStart={setDraggedRepresentativeId}
                onDragRepresentativeTarget={setRepresentativeDropTargetId}
                onMoveHeaderOrganization={(headerOrganizationId, direction) => {
                  updateSelectedDraftWith((draft) =>
                    moveHeaderOrganizationInDraft(draft, headerOrganizationId, direction),
                  );
                }}
                onUpdateHeaderOrganization={(headerOrganizationId, field, value) => {
                  updateSelectedDraftWith((draft) =>
                    updateHeaderOrganizationInDraft(draft, headerOrganizationId, field, value),
                  );
                }}
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
                onUpdateRepresentative={(representativeId, field, value) => {
                  updateSelectedDraftWith((draft) =>
                    updateRepresentativeInDraft(draft, representativeId, field, value),
                  );
                }}
                onReorderSelectedSignatory={reorderSelectedSignatory}
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
                onReturnDraftToLinkedTemplate={returnSelectedDraftToLinkedTemplate}
                onSwitchDraftToManualTemplate={switchSelectedDraftToManualTemplate}
                onUpdateSelectedDraft={updateSelectedDraft}
              />
            </div>
          </section>
        </div>
      )}

      {isEmbeddedInObjectWorkspace ? null : (
        <DocumentPreviewDrawer
          context={
            <>
              <span>
                Акт <strong>{selectedDraft.actNumber}</strong>
              </span>
              <span>{selectedFormVariant.title}</span>
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
          <DemoAosrPreview formVariant={selectedFormVariant} printState={printState} />
        </DocumentPreviewDrawer>
      )}

      {isObjectSettingsOpen ? (
        <DemoObjectSettingsPanel
          globalOrganizations={globalOrganizations}
          globalRepresentatives={globalRepresentatives}
          headerOrganizationForm={headerOrganizationForm}
          isHeaderOrganizationFormOpen={isHeaderOrganizationFormOpen}
          isRepresentativeLibraryFormOpen={isRepresentativeLibraryFormOpen}
          lastTemplateCopyMessage={lastTemplateCopyMessage}
          libraryRepresentativeForm={libraryRepresentativeForm}
          objectDefaults={objectDefaults}
          organizationSearch={organizationSearch}
          objectId={objectId}
          objectTitle={objectTitle}
          representativeSearch={representativeSearch}
          sectionDraftCount={sectionDraftCount}
          sectionId={sectionId}
          sectionTemplateClipboard={sectionTemplateClipboard}
          onAddHeaderOrganization={addConfiguredHeaderOrganization}
          onAddLibraryRepresentative={addLibraryRepresentative}
          onChangeHeaderOrganizationForm={updateHeaderOrganizationForm}
          onChangeLibraryRepresentativeForm={updateLibraryRepresentativeForm}
          onChangeOrganizationSearch={setOrganizationSearch}
          onChangeRepresentativeSearch={setRepresentativeSearch}
          onCloseObjectSettings={closeObjectSettings}
          onCopySectionTemplate={onCopySectionTemplate}
          onMoveHeaderOrganization={(headerOrganizationId, direction) => {
            commitObjectDefaults((currentDefaults) =>
              moveHeaderOrganizationBlock(currentDefaults, headerOrganizationId, direction),
            );
          }}
          onSelectGlobalOrganization={selectGlobalOrganization}
          onSelectGlobalRepresentative={selectGlobalRepresentative}
          sectionName={sectionName}
          onToggleHeaderOrganizationForm={() => {
            setHeaderOrganizationFormOpen((isOpen) => !isOpen);
          }}
          onToggleRepresentativeLibraryForm={() => {
            setRepresentativeLibraryFormOpen((isOpen) => !isOpen);
          }}
          onUpdateHeaderOrganization={updateObjectHeaderOrganization}
          onUpdateNumberingMode={(numberingMode: DemoDocumentNumberingMode) => {
            commitObjectDefaults((currentDefaults) =>
              updateDemoSectionNumberingMode(currentDefaults, numberingMode),
            );
          }}
          onUpdateNumberingAffix={(field: DemoDocumentNumberingAffixField, value: string) => {
            commitObjectDefaults((currentDefaults) =>
              updateDemoSectionNumberingAffix(currentDefaults, field, value),
            );
          }}
          onUpdateNumberingScope={(numberingScope: DemoDocumentNumberingScope) => {
            commitObjectDefaults((currentDefaults) =>
              updateDemoSectionNumberingScope(currentDefaults, numberingScope),
            );
          }}
          onUpdateNumberingStart={(numberingStart: number) => {
            commitObjectDefaults((currentDefaults) =>
              updateDemoSectionNumberingStart(currentDefaults, numberingStart),
            );
          }}
          onUpdateObjectDefaults={updateObjectDefaults}
          onPasteSectionTemplate={onPasteSectionTemplate}
          onRenumberSectionDrafts={onRenumberSectionDrafts}
          onUpdateRepresentative={updateObjectRepresentativeValue}
          onUpdateRepresentativeGroupTitle={(groupId, value) => {
            commitObjectDefaults((currentDefaults) =>
              updateObjectRepresentativeGroupTitle(currentDefaults, groupId, value),
            );
          }}
        />
      ) : null}
    </section>
  );
}

function getSelectedDraft(
  drafts: readonly DemoAosrDraft[],
  selectedDraftId: string,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0];

  if (selectedDraft === undefined) {
    return createEmptyDemoAosrDraft({
      actNumber: '',
      id: 'aosr-object-settings-placeholder',
      objectDefaults,
    });
  }

  return selectedDraft;
}

function moveItemByDirection<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  itemId: string,
  direction: DraftMoveDirection,
): readonly TItem[] {
  const itemIndex = items.findIndex((item) => item.id === itemId);
  const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

  if (itemIndex < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(itemIndex, 1);

  if (item === undefined) {
    return items;
  }

  nextItems.splice(targetIndex, 0, item);

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

function omitRepresentativeDetails(representative: DemoAosrRepresentative): DemoAosrRepresentative {
  const { details, ...representativeWithoutDetails } = representative;
  void details;

  return representativeWithoutDetails;
}

function getAosrNrsId(nrsDetails: string | undefined): string | undefined {
  if (nrsDetails === undefined || nrsDetails.trim() === '') {
    return undefined;
  }

  return nrsDetails.trim().replace(/^НРС\s+/u, '');
}
