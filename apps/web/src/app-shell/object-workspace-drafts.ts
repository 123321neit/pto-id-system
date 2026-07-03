import type {
  DemoAosrDraft,
  DemoAosrHeaderOrganization,
  DemoAosrManualTemplateSnapshot,
  DemoAosrRepresentative,
  DemoMaterialCertificate,
  DemoObjectDocument,
  DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import { insertDemoIdFolderDraftAfter, type DemoIdFolders } from './object-id-folders.js';
import { maybeRenumberAutomaticSectionDrafts } from './object-workspace-numbering.js';

export interface DuplicateAosrDraftInFolderInput {
  readonly currentDrafts: readonly DemoAosrDraft[];
  readonly currentFolders: DemoIdFolders;
  readonly duplicateDraftId: string;
  readonly section: DemoDocumentationSection | undefined;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
  readonly sourceDraftId: string;
}

export interface DuplicateAosrDraftInFolderResult {
  readonly drafts: readonly DemoAosrDraft[];
  readonly duplicatedDraft: DemoAosrDraft;
  readonly folders: DemoIdFolders;
}

export function duplicateAosrDraftInFolder({
  currentDrafts,
  currentFolders,
  duplicateDraftId,
  section,
  sectionTemplateSettings,
  sourceDraftId,
}: DuplicateAosrDraftInFolderInput): DuplicateAosrDraftInFolderResult | null {
  const sourceDraft = currentDrafts.find((draft) => draft.id === sourceDraftId);

  if (
    sourceDraft === undefined ||
    !currentFolders.some(
      (folder) => folder.id === sourceDraft.folderId && folder.draftIds.includes(sourceDraft.id),
    )
  ) {
    return null;
  }

  const duplicatedDraft = createDuplicatedAosrDraft(sourceDraft, duplicateDraftId);
  const nextFolders = insertDemoIdFolderDraftAfter(
    currentFolders,
    sourceDraft.folderId,
    sourceDraft.id,
    duplicatedDraft.id,
  );
  const draftsWithDuplicate = [...currentDrafts, duplicatedDraft];
  const nextDrafts = maybeRenumberAutomaticSectionDrafts({
    currentDrafts: draftsWithDuplicate,
    currentFolders: nextFolders,
    section,
    sectionTemplateSettings,
  });
  const renumberedDuplicatedDraft =
    nextDrafts.find((draft) => draft.id === duplicatedDraft.id) ?? duplicatedDraft;

  return {
    drafts: nextDrafts,
    duplicatedDraft: renumberedDuplicatedDraft,
    folders: nextFolders,
  };
}

export function createDuplicatedAosrDraft(
  sourceDraft: DemoAosrDraft,
  duplicateDraftId: string,
): DemoAosrDraft {
  const manualTemplateSnapshot =
    sourceDraft.manualTemplateSnapshot === undefined
      ? undefined
      : copyManualTemplateSnapshot(sourceDraft.manualTemplateSnapshot);

  return {
    ...sourceDraft,
    actNumber: '',
    excludedApplicationIds: [...sourceDraft.excludedApplicationIds],
    headerOrganizations: sourceDraft.headerOrganizations.map(copyHeaderOrganization),
    id: duplicateDraftId,
    materialCertificateIds: [...sourceDraft.materialCertificateIds],
    materialCertificateSnapshots: sourceDraft.materialCertificateSnapshots.map(copyCertificate),
    ...(manualTemplateSnapshot === undefined ? {} : { manualTemplateSnapshot }),
    numberingAssignment:
      sourceDraft.numberingAssignment.source === 'automatic'
        ? {
            automaticSequences: { ...sourceDraft.numberingAssignment.automaticSequences },
            source: 'automatic',
          }
        : { source: 'manual' },
    objectDocumentIds: [...sourceDraft.objectDocumentIds],
    objectDocumentSnapshots: sourceDraft.objectDocumentSnapshots.map(copyObjectDocument),
    representatives: sourceDraft.representatives.map(copyRepresentative),
  };
}

function copyHeaderOrganization(
  organization: DemoAosrHeaderOrganization,
): DemoAosrHeaderOrganization {
  return { ...organization };
}

function copyRepresentative(representative: DemoAosrRepresentative): DemoAosrRepresentative {
  return { ...representative };
}

function copyCertificate(certificate: DemoMaterialCertificate): DemoMaterialCertificate {
  return { ...certificate };
}

function copyObjectDocument(document: DemoObjectDocument): DemoObjectDocument {
  return { ...document };
}

function copyManualTemplateSnapshot(
  snapshot: DemoAosrManualTemplateSnapshot,
): DemoAosrManualTemplateSnapshot {
  return {
    counterparties: snapshot.counterparties.map((counterparty) => ({ ...counterparty })),
    documentTemplateDefaults: { ...snapshot.documentTemplateDefaults },
    object: { ...snapshot.object },
    project: { ...snapshot.project },
    representatives: {
      groups: snapshot.representatives.groups.map((group) => ({
        ...group,
        members: group.members.map((member) => ({ ...member })),
      })),
    },
    workTemplateDefaults: { ...snapshot.workTemplateDefaults },
  };
}
