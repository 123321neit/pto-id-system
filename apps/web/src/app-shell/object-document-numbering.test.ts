import { describe, expect, it } from 'vitest';

import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
  type DemoAosrDraft,
} from '../aosr-demo/demo-aosr-workspace.js';
import {
  demoAosrNumberingSetting,
  getProposedDemoDocumentNumber,
  getProposedDemoDocumentNumberDetails,
} from './object-document-numbering.js';
import { demoIdFolders, type DemoIdFolders } from './object-id-folders.js';

describe('frontend-only object document numbering helper', () => {
  it('proposes the next AOSR number across the selected section', () => {
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        folderId: 'folder-2026-09',
        folders: demoIdFolders,
        sectionId: 'section-ventilation',
      }),
    ).toBe('ОВ-3');
  });

  it('does not let drafts from another section affect the selected section sequence', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (sourceDraft === undefined) {
      throw new Error('Для теста нужен mock АОСР.');
    }

    const otherSectionDraft: DemoAosrDraft = {
      ...sourceDraft,
      folderId: 'folder-heating-01',
      id: 'heating-section-draft',
      numberingAssignment: {
        automaticSequences: { section: 10, folder: 10 },
        source: 'automatic' as const,
      },
      sectionId: 'section-heating',
      sectionTemplateSettingsId: 'section-template-settings-heating',
    };

    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: [...demoAosrWorkspace.drafts, otherSectionDraft],
        folderId: 'folder-2026-09',
        folders: demoIdFolders,
        sectionId: 'section-ventilation',
      }),
    ).toBe('ОВ-3');
  });

  it('restarts the displayed sequence in each folder while preserving the global sequence', () => {
    expect(
      getProposedDemoDocumentNumberDetails({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        folderId: 'folder-2026-10',
        folders: demoIdFolders,
        sectionId: 'section-ventilation',
        setting: { ...demoAosrNumberingSetting, scope: 'restart-per-folder' },
      }),
    ).toEqual({
      renderedNumber: 'ОВ-2',
      sequences: { section: 3, folder: 2 },
    });
  });

  it('does not let a manual number shift the automatic sequence', () => {
    const manualDraft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-99',
      id: 'manual-number-draft',
      numberingAssignment: { source: 'manual' },
      objectDefaults: demoAosrWorkspace.objectDefaults,
    });

    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: [...demoAosrWorkspace.drafts, manualDraft],
        folderId: 'folder-2026-09',
        folders: withDraftInFolder('folder-2026-09', manualDraft),
        sectionId: 'section-ventilation',
      }),
    ).toBe('ОВ-3');
  });

  it('keeps an allocated automatic position consumed after its number is edited manually', () => {
    const [automaticDraft] = demoAosrWorkspace.drafts;

    if (automaticDraft === undefined) {
      throw new Error('Для теста нужен mock АОСР.');
    }

    const manuallyRenamedDraft = updateDemoAosrDraftField(
      {
        ...automaticDraft,
        actNumber: 'ОВ-3',
        id: 'automatic-then-manual',
        numberingAssignment: {
          automaticSequences: { section: 3, folder: 2 },
          source: 'automatic',
        },
      },
      'actNumber',
      '12-3-ОВ',
    );

    expect(manuallyRenamedDraft.numberingAssignment).toEqual({
      automaticSequences: { section: 3, folder: 2 },
      source: 'manual',
    });
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: [...demoAosrWorkspace.drafts, manuallyRenamedDraft],
        folderId: 'folder-2026-09',
        folders: withDraftInFolder('folder-2026-09', manuallyRenamedDraft),
        sectionId: 'section-ventilation',
      }),
    ).toBe('ОВ-4');
  });

  it('applies the prefix and suffix configured in the section template', () => {
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        folderId: 'folder-2026-09',
        folders: demoIdFolders,
        sectionId: 'section-ventilation',
        setting: {
          ...demoAosrNumberingSetting,
          prefix: 'АОСР/',
          suffix: '/2026',
        },
      }),
    ).toBe('АОСР/3/2026');
  });
});

function withDraftInFolder(
  folderId: 'folder-2026-09' | 'folder-2026-10',
  draft: DemoAosrDraft,
): DemoIdFolders {
  return demoIdFolders.map((folder) =>
    folder.id === folderId ? { ...folder, draftIds: [...folder.draftIds, draft.id] } : folder,
  );
}
