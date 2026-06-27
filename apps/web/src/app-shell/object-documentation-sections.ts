import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  demoObjectPeriods,
  getDemoObjectPeriodDrafts,
  type DemoObjectPeriod,
  type DemoObjectPeriodId,
  type DemoObjectPeriods,
} from './object-periods.js';

export type DemoDocumentationSectionId = string;

export interface DemoDocumentationSection {
  readonly folderIds: readonly DemoObjectPeriodId[];
  readonly id: DemoDocumentationSectionId;
  readonly name: string;
}

export type DemoDocumentationSections = readonly DemoDocumentationSection[];

export const defaultDemoDocumentationSection: DemoDocumentationSection = {
  folderIds: demoObjectPeriods.map((period) => period.id),
  id: 'section-ventilation',
  name: 'Вентиляция',
};

export const demoDocumentationSections: DemoDocumentationSections = [
  defaultDemoDocumentationSection,
  {
    folderIds: [],
    id: 'section-heating',
    name: 'Отопление',
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
  folderId: DemoObjectPeriodId,
  sections: DemoDocumentationSections = demoDocumentationSections,
): DemoDocumentationSection {
  const section = sections.find((candidate) => candidate.folderIds.includes(folderId));

  if (section === undefined) {
    return defaultDemoDocumentationSection;
  }

  return section;
}

export function getDemoDocumentationSectionPeriods(
  section: DemoDocumentationSection,
  periods: DemoObjectPeriods = demoObjectPeriods,
): readonly DemoObjectPeriod[] {
  return periods.filter((period) => section.folderIds.includes(period.id));
}

export function getDemoDocumentationSectionDrafts(
  section: DemoDocumentationSection,
  periods: DemoObjectPeriods,
  drafts: readonly DemoAosrDraft[],
): readonly DemoAosrDraft[] {
  return getDemoDocumentationSectionPeriods(section, periods).flatMap((period) =>
    getDemoObjectPeriodDrafts(period, drafts),
  );
}

export function addDemoDocumentationSectionFolder(
  sections: DemoDocumentationSections,
  sectionId: DemoDocumentationSectionId,
  folderId: DemoObjectPeriodId,
): DemoDocumentationSections {
  return sections.map((section) =>
    section.id === sectionId
      ? { ...section, folderIds: [...section.folderIds, folderId] }
      : section,
  );
}
