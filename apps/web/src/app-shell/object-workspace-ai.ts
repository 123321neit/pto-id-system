import {
  createEmptyDemoAosrDraft,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import { addDemoIdFolderDraft, type DemoIdFolderId } from './object-id-folders.js';
import type { DemoObjectWorkspaceSession } from './object-workspace-session.js';

export type AiDocumentationScope = 'folder' | 'section';

interface PrepareAiDocumentationInput {
  readonly folderId?: DemoIdFolderId | undefined;
  readonly scope: AiDocumentationScope;
  readonly section: DemoDocumentationSection;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
  readonly workspace: DemoObjectWorkspaceSession;
}

export interface PrepareAiDocumentationResult {
  readonly createdDraftIds: readonly string[];
  readonly workspace: DemoObjectWorkspaceSession;
}

export function prepareAiDocumentationDrafts({
  folderId,
  scope,
  section,
  sectionTemplateSettings,
  workspace,
}: PrepareAiDocumentationInput): PrepareAiDocumentationResult {
  const existingFolderIds = new Set(workspace.folders.map((folder) => folder.id));
  const sectionFolderIds = section.folderIds.filter((candidateId) =>
    existingFolderIds.has(candidateId),
  );
  const targetFolderIds =
    scope === 'folder'
      ? folderId !== undefined && sectionFolderIds.includes(folderId)
        ? [folderId]
        : []
      : sectionFolderIds;

  let drafts = workspace.drafts;
  let folders = workspace.folders;
  let nextAosrOrdinal = workspace.nextAosrOrdinal;
  const createdDraftIds: string[] = [];

  for (const targetFolderId of targetFolderIds) {
    const numberDetails = getProposedDemoDocumentNumberDetails({
      documentTypeId: 'aosr',
      drafts,
      folderId: targetFolderId,
      folders,
      sectionId: section.id,
      setting: {
        documentTypeId: 'aosr',
        mode: sectionTemplateSettings.sectionTemplate.numberingMode,
        prefix: sectionTemplateSettings.sectionTemplate.numberingPrefix,
        scope: sectionTemplateSettings.sectionTemplate.numberingScope,
        start: sectionTemplateSettings.sectionTemplate.numberingStart,
        suffix: sectionTemplateSettings.sectionTemplate.numberingSuffix,
        template: '{prefix}{number}{suffix}',
      },
    });
    const draftId = `aosr-draft-ai-${String(nextAosrOrdinal)}`;
    const draft = createEmptyDemoAosrDraft({
      actNumber: numberDetails.renderedNumber,
      folderId: targetFolderId,
      id: draftId,
      numberingAssignment: numberDetails.numberingAssignment,
      sectionId: section.id,
      sectionTemplateSettings,
      sectionTemplateSettingsId: section.templateSettingsId,
    });

    drafts = [...drafts, draft];
    folders = addDemoIdFolderDraft(folders, targetFolderId, draftId);
    createdDraftIds.push(draftId);
    nextAosrOrdinal += 1;
  }

  if (createdDraftIds.length === 0) {
    return { createdDraftIds, workspace };
  }

  return {
    createdDraftIds,
    workspace: {
      ...workspace,
      drafts,
      folders,
      nextAosrOrdinal,
    },
  };
}
