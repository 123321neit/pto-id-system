import { describe, expect, it } from 'vitest';

import { createEmptyDemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  createDemoDocumentationSection,
  demoDocumentationSections,
  getDemoDocumentationSectionForFolderId,
} from './object-documentation-sections.js';
import { demoIdFolders, getDemoIdFolderForDraftId } from './object-id-folders.js';
import {
  copySectionTemplateSettingsToTarget,
  createSectionTemplateSettings,
} from './object-section-template-settings.js';

describe('frontend-only documentation section model', () => {
  it('creates a demo AOSR draft with explicit section, folder and section-template context', () => {
    const section = createDemoDocumentationSection('section-created-1', 'Вентиляция');
    const folderId = 'folder-created-1';
    const sectionTemplateSettings = createSectionTemplateSettings(section);

    const draft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-1',
      folderId,
      id: 'aosr-draft-created-1',
      sectionId: section.id,
      sectionTemplateSettings,
      sectionTemplateSettingsId: section.templateSettingsId,
    });

    expect(section.name).toBe('Вентиляция');
    expect(draft.sectionId).toBe(section.id);
    expect(draft.folderId).toBe(folderId);
    expect(draft.sectionTemplateId).toBe(section.templateSettingsId);
    expect(draft.sectionTemplateSettingsId).toBe(section.templateSettingsId);
    expect(draft.objectTemplateId).toBe(section.templateSettingsId);
  });

  it('retargets copied section template settings without copying the target prefix', () => {
    const sourceSection = demoDocumentationSections[0];
    const targetSection = demoDocumentationSections[1];

    if (sourceSection === undefined || targetSection === undefined) {
      throw new Error('Для теста нужны два demo-раздела.');
    }

    const sourceSettings = createSectionTemplateSettings(sourceSection);
    const targetSettings = createSectionTemplateSettings(targetSection);
    const copiedComplianceText = 'Скопированный текст соответствия для target-раздела';
    const sourceTemplate = {
      ...sourceSettings.sectionTemplate,
      complianceText: copiedComplianceText,
      numberingMode: 'manual' as const,
      numberingPrefix: 'CUSTOM-',
      numberingStart: 100,
      numberingScope: 'restart-per-folder' as const,
      numberingSuffix: '/2026',
    };
    const sourceSettingsWithChanges = {
      ...sourceSettings,
      defaultAdditionalInfo: 'Скопированный повторяющийся текст',
      defaultComplianceStatement: copiedComplianceText,
      objectTemplate: sourceTemplate,
      sectionTemplate: sourceTemplate,
    };

    const copiedSettings = copySectionTemplateSettingsToTarget(
      sourceSettingsWithChanges,
      targetSection,
      targetSettings,
    );

    expect(copiedSettings.defaultAdditionalInfo).toBe('Скопированный повторяющийся текст');
    expect(copiedSettings.sectionTemplate.id).toBe(targetSection.templateSettingsId);
    expect(copiedSettings.sectionTemplate.sectionId).toBe(targetSection.id);
    expect(copiedSettings.objectTemplate).toBe(copiedSettings.sectionTemplate);
    expect(copiedSettings.headerOrganizations).not.toBe(
      sourceSettingsWithChanges.headerOrganizations,
    );
    expect(copiedSettings.representativeLibrary).not.toBe(
      sourceSettingsWithChanges.representativeLibrary,
    );
    expect(copiedSettings.sectionTemplate.counterparties).not.toBe(
      sourceSettingsWithChanges.sectionTemplate.counterparties,
    );
    expect(copiedSettings.sectionTemplate.representativeGroups).not.toBe(
      sourceSettingsWithChanges.sectionTemplate.representativeGroups,
    );
    expect(copiedSettings.sectionTemplate.representativeGroups[0]).not.toBe(
      sourceSettingsWithChanges.sectionTemplate.representativeGroups[0],
    );
    expect(copiedSettings.sectionTemplate.representativeGroups[0]?.members).not.toBe(
      sourceSettingsWithChanges.sectionTemplate.representativeGroups[0]?.members,
    );
    expect(copiedSettings.sectionTemplate.numberingPrefix).toBe(
      targetSettings.sectionTemplate.numberingPrefix,
    );
    expect(copiedSettings.sectionTemplate.numberingPrefix).not.toBe(
      sourceSettingsWithChanges.sectionTemplate.numberingPrefix,
    );
    expect(copiedSettings.sectionTemplate.numberingMode).toBe('manual');
    expect(copiedSettings.sectionTemplate.numberingStart).toBe(100);
    expect(copiedSettings.sectionTemplate.numberingScope).toBe('restart-per-folder');
    expect(copiedSettings.sectionTemplate.numberingSuffix).toBe('/2026');
    expect(sourceSettingsWithChanges.sectionTemplate.id).toBe(sourceSection.templateSettingsId);
    expect(sourceSettingsWithChanges.sectionTemplate.sectionId).toBe(sourceSection.id);
    expect(targetSection.folderIds).toEqual([]);
    expect(sourceSection.folderIds).toEqual(demoIdFolders.map((folder) => folder.id));

    const targetDraft = createEmptyDemoAosrDraft({
      actNumber: 'ОТ-1',
      folderId: 'folder-heating-01',
      id: 'target-section-draft',
      sectionId: targetSection.id,
      sectionTemplateSettings: copiedSettings,
      sectionTemplateSettingsId: targetSection.templateSettingsId,
    });

    expect(targetDraft.sectionId).toBe(targetSection.id);
    expect(targetDraft.sectionTemplateId).toBe(targetSection.templateSettingsId);
    expect(targetDraft.complianceStatement).toBe(copiedComplianceText);
  });

  it('throws when strict section or folder lookup cannot resolve corrupted links', () => {
    expect(getDemoDocumentationSectionForFolderId('folder-2026-09')).toMatchObject({
      id: 'section-ventilation',
    });
    expect(getDemoIdFolderForDraftId('aosr-draft-001')).toMatchObject({
      id: 'folder-2026-09',
    });
    expect(() => {
      getDemoDocumentationSectionForFolderId('folder-missing');
    }).toThrow('Unknown demo documentation section for folder: folder-missing');
    expect(() => {
      getDemoIdFolderForDraftId('draft-missing');
    }).toThrow('Unknown demo ID folder for draft: draft-missing');
  });
});
