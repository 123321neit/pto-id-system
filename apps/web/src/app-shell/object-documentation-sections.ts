import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  demoIdFolders,
  getDemoIdFolderDrafts,
  type DemoIdFolder,
  type DemoIdFolderId,
  type DemoIdFolders,
} from './object-id-folders.js';

export type DemoDocumentationSectionId = string;
export type DemoSectionTemplateSettingsId = string;
export type DemoDocumentationSectionFolderMoveDirection = 'down' | 'up';

export interface DemoDocumentationSection {
  readonly folderIds: readonly DemoIdFolderId[];
  readonly id: DemoDocumentationSectionId;
  readonly name: string;
  readonly templateSettingsId: DemoSectionTemplateSettingsId;
}

export type DemoDocumentationSections = readonly DemoDocumentationSection[];

export const defaultDemoDocumentationSection: DemoDocumentationSection = {
  folderIds: demoIdFolders.map((folder) => folder.id),
  id: 'section-ventilation',
  name: 'Вентиляция',
  templateSettingsId: 'section-template-settings-ventilation',
};

export const demoDocumentationSections: DemoDocumentationSections = [
  defaultDemoDocumentationSection,
  {
    folderIds: [],
    id: 'section-heating',
    name: 'Отопление',
    templateSettingsId: 'section-template-settings-heating',
  },
];

export function createDemoDocumentationSection(
  id: DemoDocumentationSectionId,
  name: string,
): DemoDocumentationSection {
  return {
    folderIds: [],
    id,
    name,
    templateSettingsId: `section-template-settings-${id}`,
  };
}

export function getDemoDocumentationSectionById(
  sectionId: DemoDocumentationSectionId,
  sections: DemoDocumentationSections = demoDocumentationSections,
): DemoDocumentationSection {
  const section = sections.find((candidate) => candidate.id === sectionId);

  if (section === undefined) {
    throw new Error(`Unknown demo documentation section: ${sectionId}`);
  }

  return section;
}

export function getDemoDocumentationSectionForFolderId(
  folderId: DemoIdFolderId,
  sections: DemoDocumentationSections = demoDocumentationSections,
): DemoDocumentationSection {
  const section = sections.find((candidate) => candidate.folderIds.includes(folderId));

  if (section === undefined) {
    throw new Error(`Unknown demo documentation section for folder: ${folderId}`);
  }

  return section;
}

export function getDemoDocumentationSectionFolders(
  section: DemoDocumentationSection,
  folders: DemoIdFolders = demoIdFolders,
): readonly DemoIdFolder[] {
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));

  return section.folderIds
    .map((folderId) => folderById.get(folderId))
    .filter((folder): folder is DemoIdFolder => folder !== undefined);
}

export function getDemoDocumentationSectionDrafts(
  section: DemoDocumentationSection,
  folders: DemoIdFolders,
  drafts: readonly DemoAosrDraft[],
): readonly DemoAosrDraft[] {
  return getDemoDocumentationSectionFolders(section, folders).flatMap((folder) =>
    getDemoIdFolderDrafts(folder, drafts),
  );
}

export function addDemoDocumentationSectionFolder(
  sections: DemoDocumentationSections,
  sectionId: DemoDocumentationSectionId,
  folderId: DemoIdFolderId,
): DemoDocumentationSections {
  return sections.map((section) =>
    section.id === sectionId
      ? { ...section, folderIds: [...section.folderIds, folderId] }
      : section,
  );
}

export function moveDemoDocumentationSectionFolderByDirection(
  sections: DemoDocumentationSections,
  sectionId: DemoDocumentationSectionId,
  folderId: DemoIdFolderId,
  direction: DemoDocumentationSectionFolderMoveDirection,
): DemoDocumentationSections {
  const sourceSection = sections.find((section) => section.id === sectionId);

  if (sourceSection === undefined) {
    return sections;
  }

  const currentIndex = sourceSection.folderIds.indexOf(folderId);
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sourceSection.folderIds.length) {
    return sections;
  }

  const nextFolderIds = [...sourceSection.folderIds];
  const [movedFolderId] = nextFolderIds.splice(currentIndex, 1);

  if (movedFolderId === undefined) {
    return sections;
  }

  nextFolderIds.splice(nextIndex, 0, movedFolderId);

  return sections.map((section) =>
    section.id === sectionId ? { ...section, folderIds: nextFolderIds } : section,
  );
}
