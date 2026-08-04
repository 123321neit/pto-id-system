import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { mockObjectCards, type MockObjectCard } from './mock-dashboard.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import type { DemoIdFolder } from './object-id-folders.js';
import type { DemoObjectWorkspaceSession } from './object-workspace-session.js';

export function resolveRouteObject(objectId: string | undefined): MockObjectCard | undefined {
  return mockObjectCards.find((object) => object.id === objectId);
}

export function resolveRouteSection(
  sectionId: string | undefined,
  workspace: DemoObjectWorkspaceSession,
): DemoDocumentationSection | undefined {
  return workspace.sections.find((section) => section.id === sectionId);
}

export function resolveRouteFolder(
  folderId: string | undefined,
  section: DemoDocumentationSection,
  workspace: DemoObjectWorkspaceSession,
): DemoIdFolder | undefined {
  if (folderId === undefined || !section.folderIds.includes(folderId)) {
    return undefined;
  }

  return workspace.folders.find((folder) => folder.id === folderId);
}

export function resolveRouteDraft(
  draftId: string | undefined,
  folder: DemoIdFolder,
  section: DemoDocumentationSection,
  workspace: DemoObjectWorkspaceSession,
): DemoAosrDraft | undefined {
  if (draftId === undefined || !folder.draftIds.includes(draftId)) {
    return undefined;
  }

  return workspace.drafts.find(
    (draft) =>
      draft.id === draftId && draft.folderId === folder.id && draft.sectionId === section.id,
  );
}
