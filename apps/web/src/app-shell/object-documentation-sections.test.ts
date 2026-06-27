import { describe, expect, it } from 'vitest';

import { createEmptyDemoAosrDraft, demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { createDemoDocumentationSection } from './object-documentation-sections.js';

describe('frontend-only documentation section model', () => {
  it('creates a demo AOSR draft with explicit section, folder and section-template context', () => {
    const section = createDemoDocumentationSection('section-created-1', 'Вентиляция', 1);
    const folderId = 'folder-created-1';
    const sectionTemplateSettings = {
      ...demoAosrWorkspace.sectionTemplateSettings,
      objectTemplate: {
        ...demoAosrWorkspace.sectionTemplateSettings.sectionTemplate,
        id: section.templateSettingsId,
        sectionId: section.id,
      },
      sectionTemplate: {
        ...demoAosrWorkspace.sectionTemplateSettings.sectionTemplate,
        id: section.templateSettingsId,
        sectionId: section.id,
      },
    };

    const draft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-1',
      folderId,
      id: 'aosr-draft-created-1',
      sectionId: section.id,
      sectionTemplateSettings,
      sectionTemplateSettingsId: section.templateSettingsId,
    });

    expect(section.code).toBe('ОВ');
    expect(draft.sectionId).toBe(section.id);
    expect(draft.folderId).toBe(folderId);
    expect(draft.sectionTemplateSettingsId).toBe(section.templateSettingsId);
    expect(draft.objectTemplateId).toBe(section.templateSettingsId);
  });
});
