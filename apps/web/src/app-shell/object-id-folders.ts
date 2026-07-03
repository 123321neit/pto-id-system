import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';

export type DemoIdFolderId = string;
export type DemoIdFolderDraftPlacement = 'after' | 'before';
export type DemoIdFolderDraftMoveDirection = 'down' | 'up';

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

export function insertDemoIdFolderDraftAfter(
  folders: DemoIdFolders,
  folderId: DemoIdFolderId,
  sourceDraftId: string,
  insertedDraftId: string,
): DemoIdFolders {
  const sourceFolder = folders.find((folder) => folder.id === folderId);

  if (sourceFolder?.draftIds.includes(sourceDraftId) !== true) {
    return folders;
  }

  const draftIdsWithoutInserted = sourceFolder.draftIds.filter(
    (draftId) => draftId !== insertedDraftId,
  );
  const sourceIndex = draftIdsWithoutInserted.indexOf(sourceDraftId);

  if (sourceIndex < 0) {
    return folders;
  }

  return folders.map((folder) =>
    folder.id === folderId
      ? {
          ...folder,
          draftIds: [
            ...draftIdsWithoutInserted.slice(0, sourceIndex + 1),
            insertedDraftId,
            ...draftIdsWithoutInserted.slice(sourceIndex + 1),
          ],
        }
      : folder,
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
  return moveDemoIdFolderDraft(folders, folderId, draggedDraftId, targetDraftId, 'before');
}

export function moveDemoIdFolderDraftByDirection(
  folders: DemoIdFolders,
  folderId: DemoIdFolderId,
  draftId: string,
  direction: DemoIdFolderDraftMoveDirection,
): DemoIdFolders {
  const sourceFolder = folders.find((folder) => folder.id === folderId);

  if (sourceFolder === undefined) {
    return folders;
  }

  const currentIndex = sourceFolder.draftIds.indexOf(draftId);
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sourceFolder.draftIds.length) {
    return folders;
  }

  const nextDraftIds = [...sourceFolder.draftIds];
  const [movedDraftId] = nextDraftIds.splice(currentIndex, 1);

  if (movedDraftId === undefined) {
    return folders;
  }

  nextDraftIds.splice(nextIndex, 0, movedDraftId);

  return folders.map((folder) =>
    folder.id === folderId ? { ...folder, draftIds: nextDraftIds } : folder,
  );
}

export function moveDemoIdFolderDraft(
  folders: DemoIdFolders,
  folderId: DemoIdFolderId,
  draggedDraftId: string,
  targetDraftId: string,
  placement: DemoIdFolderDraftPlacement,
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

    const insertionIndex = placement === 'before' ? targetIndex : targetIndex + 1;

    return {
      ...folder,
      draftIds: [
        ...withoutDraggedDraft.slice(0, insertionIndex),
        draggedDraftId,
        ...withoutDraggedDraft.slice(insertionIndex),
      ],
    };
  });
}
