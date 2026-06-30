import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';

export type DemoIdFolderId = string;

export interface DemoIdFolder {
  readonly draftIds: readonly string[];
  readonly id: DemoIdFolderId;
  readonly intermediateIdTitle: string;
  readonly name: string;
  readonly registryTitle: string;
}

export type DemoIdFolders = readonly DemoIdFolder[];

export const defaultDemoIdFolder: DemoIdFolder = {
  draftIds: ['aosr-draft-001'],
  id: 'folder-2026-09',
  intermediateIdTitle: 'Промежуточная ИД по папке «Сентябрь 2026»',
  name: 'Сентябрь 2026',
  registryTitle: 'Реестр папки «Сентябрь 2026»',
};

export const demoIdFolders: readonly DemoIdFolder[] = [
  defaultDemoIdFolder,
  {
    draftIds: ['aosr-draft-002'],
    id: 'folder-2026-10',
    intermediateIdTitle: 'Промежуточная ИД по папке «Октябрь 2026»',
    name: 'Октябрь 2026',
    registryTitle: 'Реестр папки «Октябрь 2026»',
  },
];

export function createDemoIdFolder(id: DemoIdFolderId, name: string): DemoIdFolder {
  return {
    draftIds: [],
    id,
    intermediateIdTitle: `Промежуточная ИД по папке «${name}»`,
    name,
    registryTitle: `Реестр папки «${name}»`,
  };
}

export function getDemoIdFolderById(
  folderId: DemoIdFolderId,
  folders: DemoIdFolders = demoIdFolders,
): DemoIdFolder {
  const folder = folders.find((candidate) => candidate.id === folderId);

  if (folder === undefined) {
    throw new Error(`Unknown demo ID folder: ${folderId}`);
  }

  return folder;
}

export function getDemoIdFolderForDraftId(
  draftId: string,
  folders: DemoIdFolders = demoIdFolders,
): DemoIdFolder {
  const folder = folders.find((candidate) => candidate.draftIds.includes(draftId));

  if (folder === undefined) {
    throw new Error(`Unknown demo ID folder for draft: ${draftId}`);
  }

  return folder;
}

export function getDemoIdFolderDrafts(
  folder: DemoIdFolder,
  drafts: readonly DemoAosrDraft[],
): readonly DemoAosrDraft[] {
  const draftById = new Map(drafts.map((draft) => [draft.id, draft]));

  return folder.draftIds
    .map((draftId) => draftById.get(draftId))
    .filter((draft): draft is DemoAosrDraft => draft !== undefined);
}

export function addDemoIdFolderDraft(
  folders: DemoIdFolders,
  folderId: DemoIdFolderId,
  draftId: string,
): DemoIdFolders {
  return folders.map((folder) =>
    folder.id === folderId ? { ...folder, draftIds: [...folder.draftIds, draftId] } : folder,
  );
}

export function removeDemoIdFolderDraft(folders: DemoIdFolders, draftId: string): DemoIdFolders {
  return folders.map((folder) =>
    folder.draftIds.includes(draftId)
      ? {
          ...folder,
          draftIds: folder.draftIds.filter((currentDraftId) => currentDraftId !== draftId),
        }
      : folder,
  );
}

export function moveDemoIdFolderDraftBefore(
  folders: DemoIdFolders,
  folderId: DemoIdFolderId,
  draggedDraftId: string,
  targetDraftId: string,
): DemoIdFolders {
  if (draggedDraftId === targetDraftId) {
    return folders;
  }

  return folders.map((folder) => {
    if (
      folder.id !== folderId ||
      !folder.draftIds.includes(draggedDraftId) ||
      !folder.draftIds.includes(targetDraftId)
    ) {
      return folder;
    }

    const withoutDraggedDraft = folder.draftIds.filter((draftId) => draftId !== draggedDraftId);
    const targetIndex = withoutDraggedDraft.indexOf(targetDraftId);

    if (targetIndex < 0) {
      return folder;
    }

    return {
      ...folder,
      draftIds: [
        ...withoutDraggedDraft.slice(0, targetIndex),
        draggedDraftId,
        ...withoutDraggedDraft.slice(targetIndex),
      ],
    };
  });
}
