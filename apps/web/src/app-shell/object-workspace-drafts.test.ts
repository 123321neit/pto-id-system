import { describe, expect, it } from 'vitest';

import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import type { DemoIdFolders } from './object-id-folders.js';
import { duplicateAosrDraftInFolder } from './object-workspace-drafts.js';

describe('object workspace draft helpers', () => {
  it('duplicates an AOSR draft after the source and keeps object links/content', () => {
    const sourceDraft = createRichDraft({
      id: 'draft-source',
      numberingAssignment: {
        automaticSequences: { folder: 1, section: 1 },
        source: 'automatic',
      },
    });
    const nextDraft = createRichDraft({
      id: 'draft-next',
      numberingAssignment: {
        automaticSequences: { folder: 2, section: 2 },
        source: 'automatic',
      },
    });
    const result = duplicateAosrDraftInFolder({
      currentDrafts: [sourceDraft, nextDraft],
      currentFolders: createFolders(['draft-source', 'draft-next']),
      duplicateDraftId: 'draft-copy',
      section: testSection,
      sectionTemplateSettings: createNumberingSettings('automatic'),
      sourceDraftId: sourceDraft.id,
    });

    expect(result).not.toBeNull();

    const duplicatedDraft = result?.duplicatedDraft;
    expect(result?.folders).toMatchObject([
      { draftIds: ['draft-source', 'draft-copy', 'draft-next'] },
    ]);
    expect(duplicatedDraft).toMatchObject({
      additionalInfo: sourceDraft.additionalInfo,
      axes: sourceDraft.axes,
      complianceStatement: sourceDraft.complianceStatement,
      copiesCount: sourceDraft.copiesCount,
      elevationRange: sourceDraft.elevationRange,
      folderId: sourceDraft.folderId,
      formVariantId: sourceDraft.formVariantId,
      formVariantPrintTitle: sourceDraft.formVariantPrintTitle,
      formVariantTitle: sourceDraft.formVariantTitle,
      id: 'draft-copy',
      objectName: sourceDraft.objectName,
      periodEnd: sourceDraft.periodEnd,
      periodStart: sourceDraft.periodStart,
      projectDocumentation: sourceDraft.projectDocumentation,
      sectionId: sourceDraft.sectionId,
      sectionTemplateId: sourceDraft.sectionTemplateId,
      sectionTemplateSettingsId: sourceDraft.sectionTemplateSettingsId,
      subsequentWorksPermitted: sourceDraft.subsequentWorksPermitted,
      templateMode: sourceDraft.templateMode,
      workContractorName: sourceDraft.workContractorName,
      workDescription: sourceDraft.workDescription,
    });
    expect(duplicatedDraft?.id).not.toBe(sourceDraft.id);
    expect(duplicatedDraft?.headerOrganizations).toEqual(sourceDraft.headerOrganizations);
    expect(duplicatedDraft?.materialCertificateIds).toEqual(sourceDraft.materialCertificateIds);
    expect(duplicatedDraft?.materialCertificateSnapshots).toEqual(
      sourceDraft.materialCertificateSnapshots,
    );
    expect(duplicatedDraft?.objectDocumentIds).toEqual(sourceDraft.objectDocumentIds);
    expect(duplicatedDraft?.objectDocumentSnapshots).toEqual(sourceDraft.objectDocumentSnapshots);
    expect(duplicatedDraft?.representatives).toEqual(sourceDraft.representatives);
  });

  it('renumbers automatic duplicate instead of reusing the source final number', () => {
    const sourceDraft = createRichDraft({
      actNumber: 'ОВ-1',
      id: 'draft-source',
      numberingAssignment: {
        automaticSequences: { folder: 1, section: 1 },
        source: 'automatic',
      },
    });
    const nextDraft = createRichDraft({
      actNumber: 'ОВ-2',
      id: 'draft-next',
      numberingAssignment: {
        automaticSequences: { folder: 2, section: 2 },
        source: 'automatic',
      },
    });
    const result = duplicateAosrDraftInFolder({
      currentDrafts: [sourceDraft, nextDraft],
      currentFolders: createFolders(['draft-source', 'draft-next']),
      duplicateDraftId: 'draft-copy',
      section: testSection,
      sectionTemplateSettings: createNumberingSettings('automatic'),
      sourceDraftId: sourceDraft.id,
    });
    const duplicatedDraft = getDraftById(result?.drafts ?? [], 'draft-copy');

    expect(duplicatedDraft.actNumber).toBe('ОВ-2');
    expect(duplicatedDraft.actNumber).not.toBe(sourceDraft.actNumber);
    expect(getDraftById(result?.drafts ?? [], 'draft-next').actNumber).toBe('ОВ-3');
  });

  it('keeps manual duplicate without copying the final manual number', () => {
    const sourceDraft = createRichDraft({
      actNumber: 'ручной-номер',
      id: 'draft-source',
      numberingAssignment: { source: 'manual' },
    });
    const result = duplicateAosrDraftInFolder({
      currentDrafts: [sourceDraft],
      currentFolders: createFolders(['draft-source']),
      duplicateDraftId: 'draft-copy',
      section: testSection,
      sectionTemplateSettings: createNumberingSettings('manual'),
      sourceDraftId: sourceDraft.id,
    });

    expect(result?.folders).toMatchObject([{ draftIds: ['draft-source', 'draft-copy'] }]);
    expect(result?.duplicatedDraft).toMatchObject({
      actNumber: '',
      numberingAssignment: { source: 'manual' },
    });
  });
});

const testSection = {
  folderIds: ['folder-a'],
  id: 'section-test',
  name: 'Тестовый раздел',
  templateSettingsId: 'section-template-settings-test',
} satisfies DemoDocumentationSection;

function createFolders(draftIds: readonly string[]): DemoIdFolders {
  return [
    {
      draftIds,
      id: 'folder-a',
      intermediateIdTitle: 'Промежуточная ИД A',
      name: 'Папка A',
      registryTitle: 'Реестр A',
    },
  ];
}

function createRichDraft({
  actNumber = 'ОВ-1',
  id,
  numberingAssignment,
}: {
  readonly actNumber?: string;
  readonly id: string;
  readonly numberingAssignment: DemoAosrDraft['numberingAssignment'];
}): DemoAosrDraft {
  return {
    ...createEmptyDemoAosrDraft({
      actNumber,
      folderId: 'folder-a',
      id,
      numberingAssignment,
      sectionId: testSection.id,
      sectionTemplateSettings: createNumberingSettings('automatic'),
      sectionTemplateSettingsId: testSection.templateSettingsId,
    }),
    additionalInfo: 'Дополнительные сведения',
    axes: '1-3',
    complianceStatement: 'Соответствует рабочей документации',
    copiesCount: '2',
    elevationRange: '+3.000',
    excludedApplicationIds: ['application-hidden'],
    headerOrganizations: [
      {
        details: 'ИНН 123',
        id: 'header-1',
        label: 'Застройщик',
        organizationName: 'ООО "Заказчик"',
      },
    ],
    materialCertificateIds: ['certificate-1'],
    materialCertificateSnapshots: [
      {
        certificateNumber: 'С-1',
        documentName: 'Паспорт качества',
        id: 'certificate-1',
        materialName: 'Воздуховод',
      },
    ],
    objectDocumentIds: ['object-document-1'],
    objectDocumentSnapshots: [
      {
        documentDate: '2026-06-01',
        id: 'object-document-1',
        reference: 'ИС-1',
        title: 'Исполнительная схема',
        type: 'Исполнительная схема',
      },
    ],
    periodEnd: '2026-06-02',
    periodStart: '2026-06-01',
    projectDocumentation: 'РД-ОВ',
    representatives: [
      {
        authorityBasis: 'Приказ № 1',
        fullName: 'Иванов И.И.',
        id: 'representative-1',
        organization: 'ООО "ПТО Монтаж"',
        position: 'Производитель работ',
        roleLabel: 'Представитель подрядчика',
      },
    ],
    subsequentWorksPermitted: 'монтажу решеток',
    templateMode: 'manual',
    workContractorName: 'ООО "ПТО Монтаж"',
    workDescription: 'Монтаж скрытых участков вентиляции',
  };
}

function createNumberingSettings(
  mode: DemoSectionTemplateSettings['sectionTemplate']['numberingMode'],
): DemoSectionTemplateSettings {
  const sectionTemplate = {
    ...demoAosrWorkspace.sectionTemplateSettings.sectionTemplate,
    numberingMode: mode,
    numberingPrefix: 'ОВ-',
    numberingScope: 'section-wide' as const,
    numberingStart: 1,
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
