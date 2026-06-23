import { describe, expect, it, vi } from 'vitest';

import {
  createApprovedDocumentTypeId,
  createDocumentFolderId,
  createDocumentObjectId,
  createDocumentSectionId,
  createDocumentWorkspaceId,
  readDocumentCreationContext,
  type DocumentCreationContextDenialReason,
  type DocumentCreationContextReader,
  type DocumentCreationSectionWorkspaceRead,
  type DocumentCreationWorkspaceAccessDecision,
  type DocumentWorkspaceId,
} from './document-creation-context.js';

describe('document creation context contract', () => {
  it('denies a non-owner before reading object, section, or folder details', () => {
    const { readSectionWorkspace, reader } = createReader(
      createDocumentWorkspaceId('workspace_alpha'),
    );

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_secret'),
      objectId: createDocumentObjectId('object_secret'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      sectionId: createDocumentSectionId('section_secret'),
      workspaceAccess: denyWorkspaceAccess(),
    });

    expect(result).toEqual({
      reason: 'NOT_FOUND_OR_NOT_AUTHORIZED',
      status: 'denied',
    });
    expect(readSectionWorkspace).not.toHaveBeenCalled();
  });

  it('returns a query-only context for a user-defined section and ID folder', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_vent_camera_a'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      sectionId: createDocumentSectionId('section_ventilation'),
      workspaceAccess: allowWorkspaceAccess(workspaceId),
    });

    expect(result.status).toBe('allowed');

    if (result.status === 'denied') {
      return;
    }

    expect(result.context.section).toEqual({
      sectionId: 'section_ventilation',
      title: 'Вентиляция',
    });
    expect(result.context.folder).toEqual({
      folderId: 'folder_vent_camera_a',
      sectionId: 'section_ventilation',
      title: 'Пусконаладка / венткамера A',
    });
    expect(result.context.selectedDocumentType).toEqual({
      documentTypeId: 'AOSR',
      lifecycle: 'approved',
      registryCode: 'Акт',
      title: 'АОСР',
    });
    expect(result.context.liveResolutionChain).toEqual([
      'global_libraries',
      'section_template',
      'linked_working_document',
    ]);
    expect(result.context.idPackageScope).toEqual({
      finalId: 'section',
      intermediateId: 'folder',
    });
    expect(result.context.queryEffects).toEqual({
      createsDraft: false,
      mutatesSequence: false,
      reservesNumber: false,
    });
    expect(result.context.actions).toEqual(['select_document_type', 'create_document']);
  });

  it('proposes the next number inside the selected section folder without reserving it', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_vent_camera_a'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      sectionId: createDocumentSectionId('section_ventilation'),
      workspaceAccess: allowWorkspaceAccess(workspaceId),
    });

    expect(result.status).toBe('allowed');

    if (result.status === 'denied') {
      return;
    }

    expect(result.context.numberingProposal).toEqual({
      documentTypeId: 'AOSR',
      formattedNumber: 'ОВ-3',
      reservation: 'none',
      sequence: 3,
      source: 'proposal_only',
    });
  });

  it('keeps another section independent even when it has folders with similar names', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_heating_stage_1'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      sectionId: createDocumentSectionId('section_heating'),
      workspaceAccess: allowWorkspaceAccess(workspaceId),
    });

    expect(result.status).toBe('allowed');

    if (result.status === 'denied') {
      return;
    }

    expect(result.context.section.title).toBe('Отопление');
    expect(result.context.folder.title).toBe('Этап 1');
    expect(result.context.sectionTemplate.sectionTemplateId).toBe('section_template_heating');
    expect(result.context.numberingProposal?.formattedNumber).toBe('ОТ-8');
  });

  it('denies a folder that belongs to another section with leakage-safe vocabulary', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    expect(
      readDocumentCreationContext({
        folderId: createDocumentFolderId('folder_heating_stage_1'),
        objectId: createDocumentObjectId('object_main'),
        reader,
        sectionId: createDocumentSectionId('section_ventilation'),
        workspaceAccess: allowWorkspaceAccess(workspaceId),
      }),
    ).toEqual({
      reason: 'NOT_FOUND_OR_NOT_AUTHORIZED',
      status: 'denied',
    });
  });
});

function allowWorkspaceAccess(
  workspaceId: DocumentWorkspaceId,
): DocumentCreationWorkspaceAccessDecision {
  return {
    status: 'allowed',
    workspaceId,
  };
}

function denyWorkspaceAccess(): DocumentCreationWorkspaceAccessDecision {
  return {
    reason: 'NOT_FOUND_OR_NOT_AUTHORIZED' satisfies DocumentCreationContextDenialReason,
    status: 'denied',
  };
}

function createReader(workspaceId: DocumentWorkspaceId): {
  readonly readSectionWorkspace: ReturnType<
    typeof vi.fn<DocumentCreationContextReader['readSectionWorkspace']>
  >;
  readonly reader: DocumentCreationContextReader;
} {
  const sectionWorkspaces: readonly DocumentCreationSectionWorkspaceRead[] = [
    {
      approvedDocumentTypes: createApprovedDocumentTypes(),
      existingDocumentNumbers: [
        {
          automaticSequence: 1,
          documentTypeId: createApprovedDocumentTypeId('AOSR'),
          folderId: createDocumentFolderId('folder_vent_camera_a'),
          sectionId: createDocumentSectionId('section_ventilation'),
        },
        {
          automaticSequence: 2,
          documentTypeId: createApprovedDocumentTypeId('AOSR'),
          folderId: createDocumentFolderId('folder_vent_camera_a'),
          sectionId: createDocumentSectionId('section_ventilation'),
        },
        {
          automaticSequence: null,
          documentTypeId: createApprovedDocumentTypeId('AOSR'),
          folderId: createDocumentFolderId('folder_vent_camera_a'),
          sectionId: createDocumentSectionId('section_ventilation'),
        },
      ],
      folders: [
        {
          folderId: createDocumentFolderId('folder_vent_camera_a'),
          sectionId: createDocumentSectionId('section_ventilation'),
          title: 'Пусконаладка / венткамера A',
        },
        {
          folderId: createDocumentFolderId('folder_vent_floor_2'),
          sectionId: createDocumentSectionId('section_ventilation'),
          title: 'Этаж 2',
        },
      ],
      numberingPolicy: {
        nextSequenceMinimum: 1,
        prefix: 'ОВ-',
        scope: 'folder',
        suffix: '',
      },
      object: createObject(workspaceId),
      section: {
        objectId: createDocumentObjectId('object_main'),
        sectionId: createDocumentSectionId('section_ventilation'),
        title: 'Вентиляция',
        workspaceId,
      },
      sectionTemplate: {
        organizationAssignmentCount: 2,
        repeatedTextKeys: ['projectDocumentation', 'complianceText', 'copies'],
        representativeAssignmentCount: 4,
        sectionTemplateId: 'section_template_ventilation',
        version: 12,
      },
    },
    {
      approvedDocumentTypes: createApprovedDocumentTypes(),
      existingDocumentNumbers: [
        {
          automaticSequence: 7,
          documentTypeId: createApprovedDocumentTypeId('AOSR'),
          folderId: createDocumentFolderId('folder_heating_stage_1'),
          sectionId: createDocumentSectionId('section_heating'),
        },
      ],
      folders: [
        {
          folderId: createDocumentFolderId('folder_heating_stage_1'),
          sectionId: createDocumentSectionId('section_heating'),
          title: 'Этап 1',
        },
      ],
      numberingPolicy: {
        nextSequenceMinimum: 1,
        prefix: 'ОТ-',
        scope: 'section',
        suffix: '',
      },
      object: createObject(workspaceId),
      section: {
        objectId: createDocumentObjectId('object_main'),
        sectionId: createDocumentSectionId('section_heating'),
        title: 'Отопление',
        workspaceId,
      },
      sectionTemplate: {
        organizationAssignmentCount: 2,
        repeatedTextKeys: ['projectDocumentation', 'complianceText', 'copies'],
        representativeAssignmentCount: 3,
        sectionTemplateId: 'section_template_heating',
        version: 4,
      },
    },
  ];

  const readSectionWorkspace = vi.fn<DocumentCreationContextReader['readSectionWorkspace']>(
    ({ objectId, sectionId }) =>
      sectionWorkspaces.find(
        (workspace) =>
          workspace.object.objectId === objectId && workspace.section.sectionId === sectionId,
      ) ?? null,
  );

  return {
    readSectionWorkspace,
    reader: {
      readSectionWorkspace,
    },
  };
}

function createApprovedDocumentTypes(): DocumentCreationSectionWorkspaceRead['approvedDocumentTypes'] {
  return [
    {
      documentTypeId: createApprovedDocumentTypeId('AOSR'),
      lifecycle: 'approved',
      registryCode: 'Акт',
      title: 'АОСР',
    },
    {
      documentTypeId: createApprovedDocumentTypeId('TEST_ACT'),
      lifecycle: 'deferred',
      registryCode: 'ТА',
      title: 'Акт испытаний',
    },
  ];
}

function createObject(
  workspaceId: DocumentWorkspaceId,
): DocumentCreationSectionWorkspaceRead['object'] {
  return {
    objectId: createDocumentObjectId('object_main'),
    title: 'ЖК Северный / корпус 2',
    workspaceId,
  };
}
