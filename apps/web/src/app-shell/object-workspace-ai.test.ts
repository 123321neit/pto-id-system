import { describe, expect, it } from 'vitest';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import {
  createDemoDocumentationSection,
  type DemoDocumentationSection,
} from './object-documentation-sections.js';
import { createDemoIdFolder } from './object-id-folders.js';
import { createSectionTemplateSettings } from './object-section-template-settings.js';
import { prepareAiDocumentationDrafts } from './object-workspace-ai.js';
import type { DemoObjectWorkspaceSession } from './object-workspace-session.js';

function createWorkspace(): {
  readonly section: DemoDocumentationSection;
  readonly workspace: DemoObjectWorkspaceSession;
} {
  const sourceSection = createDemoDocumentationSection('section-ai', 'Вентиляция');
  const firstFolder = createDemoIdFolder('folder-ai-1', 'Сентябрь');
  const secondFolder = createDemoIdFolder('folder-ai-2', 'Октябрь');
  const section = { ...sourceSection, folderIds: [firstFolder.id, secondFolder.id] };

  return {
    section,
    workspace: {
      drafts: [],
      folders: [firstFolder, secondFolder],
      nextAosrOrdinal: 7,
      nextFolderOrdinal: 1,
      nextSectionOrdinal: 1,
      sections: [section],
      sectionTemplateSettingsById: {},
    },
  };
}

describe('prepareAiDocumentationDrafts', () => {
  it('creates one linked empty draft in the selected folder', () => {
    const { section, workspace } = createWorkspace();
    const sectionTemplateSettings = createSectionTemplateSettings(section);
    const result = prepareAiDocumentationDrafts({
      folderId: 'folder-ai-1',
      scope: 'folder',
      section,
      sectionTemplateSettings,
      workspace,
    });

    expect(result.createdDraftIds).toEqual(['aosr-draft-ai-7']);
    expect(result.workspace.nextAosrOrdinal).toBe(8);
    expect(result.workspace.folders[0]?.draftIds).toEqual(['aosr-draft-ai-7']);
    expect(result.workspace.folders[1]?.draftIds).toEqual([]);
    expect(result.workspace.drafts[0]).toMatchObject({
      actNumber: '1',
      actDate: '',
      folderId: 'folder-ai-1',
      templateMode: 'linked',
      workDescription: '',
    });
  });

  it('creates one correctly numbered draft in every folder of a section', () => {
    const { section, workspace } = createWorkspace();
    const sectionTemplateSettings = createSectionTemplateSettings(section);
    const result = prepareAiDocumentationDrafts({
      scope: 'section',
      section,
      sectionTemplateSettings,
      workspace,
    });

    expect(result.createdDraftIds).toEqual(['aosr-draft-ai-7', 'aosr-draft-ai-8']);
    expect(result.workspace.drafts.map((draft) => draft.actNumber)).toEqual(['1', '2']);
    expect(result.workspace.folders.map((folder) => folder.draftIds)).toEqual([
      ['aosr-draft-ai-7'],
      ['aosr-draft-ai-8'],
    ]);
  });

  it('does not mutate the workspace when the selected folder is outside the section', () => {
    const { section, workspace } = createWorkspace();
    const result = prepareAiDocumentationDrafts({
      folderId: 'folder-unknown',
      scope: 'folder',
      section,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workspace,
    });

    expect(result.createdDraftIds).toEqual([]);
    expect(result.workspace).toBe(workspace);
  });
});
