import { describe, expect, it } from 'vitest';

import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import type { DemoIdFolders } from './object-id-folders.js';
import {
  maybeRenumberAutomaticSectionDrafts,
  renumberSectionDraftsByFolderOrder,
} from './object-workspace-numbering.js';

describe('object workspace numbering helpers', () => {
  it('renumbers section-wide automatic numbers by folder draftIds order', () => {
    const result = renumberSectionDraftsByFolderOrder({
      currentDrafts: createDrafts(),
      currentFolders: testFolders,
      section: testSection,
      sectionTemplateSettings: createNumberingSettings({ scope: 'section-wide', start: 5 }),
    });

    expect(result.map((draft) => draft.id)).toEqual(['draft-1', 'draft-2', 'draft-3']);
    expect(getDraftById(result, 'draft-2')).toMatchObject({
      actNumber: 'ОВ-5',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 5 },
        source: 'automatic',
      },
    });
    expect(getDraftById(result, 'draft-1')).toMatchObject({
      actNumber: 'ОВ-6',
      numberingAssignment: {
        automaticSequences: { folder: 6, section: 6 },
        source: 'automatic',
      },
    });
    expect(getDraftById(result, 'draft-3')).toMatchObject({
      actNumber: 'ОВ-7',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 7 },
        source: 'automatic',
      },
    });
  });

  it('restarts displayed automatic numbers per folder while keeping section sequence', () => {
    const result = renumberSectionDraftsByFolderOrder({
      currentDrafts: createDrafts(),
      currentFolders: testFolders,
      section: testSection,
      sectionTemplateSettings: createNumberingSettings({ scope: 'restart-per-folder', start: 5 }),
    });

    expect(getDraftById(result, 'draft-2')).toMatchObject({
      actNumber: 'ОВ-5',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 5 },
        source: 'automatic',
      },
    });
    expect(getDraftById(result, 'draft-1')).toMatchObject({
      actNumber: 'ОВ-6',
      numberingAssignment: {
        automaticSequences: { folder: 6, section: 6 },
        source: 'automatic',
      },
    });
    expect(getDraftById(result, 'draft-3')).toMatchObject({
      actNumber: 'ОВ-5',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 7 },
        source: 'automatic',
      },
    });
  });

  it('renumbers only automatic drafts when requested after reorder/delete', () => {
    const manualDraft = createDraft({
      actNumber: 'ручной-номер',
      id: 'draft-2',
      numberingAssignment: { source: 'manual' },
    });
    const result = renumberSectionDraftsByFolderOrder({
      currentDrafts: [
        createDraft({
          id: 'draft-1',
          numberingAssignment: {
            automaticSequences: { folder: 2, section: 2 },
            source: 'automatic',
          },
        }),
        manualDraft,
        createDraft({
          id: 'draft-3',
          numberingAssignment: {
            automaticSequences: { folder: 3, section: 3 },
            source: 'automatic',
          },
        }),
      ],
      currentFolders: testFolders,
      mode: 'automatic-only',
      section: testSection,
      sectionTemplateSettings: createNumberingSettings({ scope: 'section-wide', start: 5 }),
    });

    expect(getDraftById(result, 'draft-2')).toBe(manualDraft);
    expect(getDraftById(result, 'draft-1')).toMatchObject({
      actNumber: 'ОВ-5',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 5 },
        source: 'automatic',
      },
    });
    expect(getDraftById(result, 'draft-3')).toMatchObject({
      actNumber: 'ОВ-6',
      numberingAssignment: {
        automaticSequences: { folder: 5, section: 6 },
        source: 'automatic',
      },
    });
  });

  it('does not renumber when section is missing or numbering mode is manual', () => {
    const drafts = createDrafts();
    const manualSettings = createNumberingSettings({ mode: 'manual' });

    expect(
      maybeRenumberAutomaticSectionDrafts({
        currentDrafts: drafts,
        currentFolders: testFolders,
        section: undefined,
        sectionTemplateSettings: createNumberingSettings({ mode: 'automatic' }),
      }),
    ).toBe(drafts);
    expect(
      maybeRenumberAutomaticSectionDrafts({
        currentDrafts: drafts,
        currentFolders: testFolders,
        section: testSection,
        sectionTemplateSettings: manualSettings,
      }),
    ).toBe(drafts);
  });

  it('throws instead of silently falling back when section folder links are corrupted', () => {
    expect(() =>
      renumberSectionDraftsByFolderOrder({
        currentDrafts: createDrafts(),
        currentFolders: [],
        section: { ...testSection, folderIds: ['missing-folder'] },
        sectionTemplateSettings: createNumberingSettings({ mode: 'automatic' }),
      }),
    ).toThrow('Unknown demo ID folder: missing-folder');
  });
});

const testSection = {
  folderIds: ['folder-a', 'folder-b'],
  id: 'section-test',
  name: 'Тестовый раздел',
  templateSettingsId: 'section-template-settings-test',
} satisfies DemoDocumentationSection;

const testFolders = [
  {
    draftIds: ['draft-2', 'draft-1'],
    id: 'folder-a',
    intermediateIdTitle: 'Промежуточная ИД A',
    name: 'Папка A',
    registryTitle: 'Реестр A',
  },
  {
    draftIds: ['draft-3'],
    id: 'folder-b',
    intermediateIdTitle: 'Промежуточная ИД B',
    name: 'Папка B',
    registryTitle: 'Реестр B',
  },
] satisfies DemoIdFolders;

function createDrafts(): readonly DemoAosrDraft[] {
  return [
    createDraft({ id: 'draft-1' }),
    createDraft({ id: 'draft-2' }),
    createDraft({ id: 'draft-3' }),
  ];
}

function createDraft({
  actNumber = '',
  id,
  numberingAssignment = { source: 'manual' },
}: {
  readonly actNumber?: string;
  readonly id: string;
  readonly numberingAssignment?: DemoAosrDraft['numberingAssignment'];
}): DemoAosrDraft {
  return createEmptyDemoAosrDraft({
    actNumber,
    id,
    numberingAssignment,
    sectionId: testSection.id,
    sectionTemplateSettings: createNumberingSettings({ mode: 'automatic' }),
    sectionTemplateSettingsId: testSection.templateSettingsId,
  });
}

function createNumberingSettings({
  mode = 'automatic',
  scope = 'section-wide',
  start = 1,
}: {
  readonly mode?: DemoSectionTemplateSettings['sectionTemplate']['numberingMode'];
  readonly scope?: DemoSectionTemplateSettings['sectionTemplate']['numberingScope'];
  readonly start?: number;
}): DemoSectionTemplateSettings {
  const sectionTemplate = {
    ...demoAosrWorkspace.sectionTemplateSettings.sectionTemplate,
    numberingMode: mode,
    numberingPrefix: 'ОВ-',
    numberingScope: scope,
    numberingStart: start,
    numberingSuffix: '',
  };

  return {
    ...demoAosrWorkspace.sectionTemplateSettings,
    objectTemplate: sectionTemplate,
    sectionTemplate,
  };
}

function getDraftById(drafts: readonly DemoAosrDraft[], draftId: string): DemoAosrDraft {
  const draft = drafts.find((currentDraft) => currentDraft.id === draftId);

  if (draft === undefined) {
    throw new Error(`Expected test draft: ${draftId}`);
  }

  return draft;
}
