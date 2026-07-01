import { describe, expect, it } from 'vitest';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getDemoIdFolderDrafts,
  moveDemoIdFolderDraft,
  moveDemoIdFolderDraftBefore,
  removeDemoIdFolderDraft,
  type DemoIdFolder,
} from './object-id-folders.js';

describe('object ID folder helpers', () => {
  it('returns folder drafts in the folder order instead of global draft order', () => {
    const folder: DemoIdFolder = {
      draftIds: ['aosr-draft-002', 'aosr-draft-001'],
      id: 'folder-test',
      intermediateIdTitle: 'Промежуточная ИД',
      name: 'Тестовая папка',
      registryTitle: 'Реестр',
    };

    expect(
      getDemoIdFolderDrafts(folder, demoAosrWorkspace.drafts).map((draft) => draft.id),
    ).toEqual(['aosr-draft-002', 'aosr-draft-001']);
  });

  it('moves a draft before the target inside one folder only', () => {
    const folders = [
      {
        draftIds: ['draft-1', 'draft-2', 'draft-3'],
        id: 'folder-a',
        intermediateIdTitle: 'Промежуточная ИД A',
        name: 'Папка A',
        registryTitle: 'Реестр A',
      },
      {
        draftIds: ['draft-4'],
        id: 'folder-b',
        intermediateIdTitle: 'Промежуточная ИД B',
        name: 'Папка B',
        registryTitle: 'Реестр B',
      },
    ] satisfies readonly DemoIdFolder[];

    expect(moveDemoIdFolderDraftBefore(folders, 'folder-a', 'draft-3', 'draft-1')).toMatchObject([
      { draftIds: ['draft-3', 'draft-1', 'draft-2'] },
      { draftIds: ['draft-4'] },
    ]);
  });

  it('moves a draft after the target inside one folder', () => {
    const folders = [
      {
        draftIds: ['draft-1', 'draft-2'],
        id: 'folder-a',
        intermediateIdTitle: 'Промежуточная ИД A',
        name: 'Папка A',
        registryTitle: 'Реестр A',
      },
    ] satisfies readonly DemoIdFolder[];

    expect(moveDemoIdFolderDraft(folders, 'folder-a', 'draft-1', 'draft-2', 'after')).toMatchObject(
      [{ draftIds: ['draft-2', 'draft-1'] }],
    );
  });

  it('removes a draft from every folder list', () => {
    const folders = [
      {
        draftIds: ['draft-1', 'draft-2'],
        id: 'folder-a',
        intermediateIdTitle: 'Промежуточная ИД A',
        name: 'Папка A',
        registryTitle: 'Реестр A',
      },
      {
        draftIds: ['draft-2', 'draft-3'],
        id: 'folder-b',
        intermediateIdTitle: 'Промежуточная ИД B',
        name: 'Папка B',
        registryTitle: 'Реестр B',
      },
    ] satisfies readonly DemoIdFolder[];

    expect(removeDemoIdFolderDraft(folders, 'draft-2')).toMatchObject([
      { draftIds: ['draft-1'] },
      { draftIds: ['draft-3'] },
    ]);
  });
});
