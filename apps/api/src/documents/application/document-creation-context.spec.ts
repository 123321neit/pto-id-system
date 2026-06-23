import { describe, expect, it, vi } from 'vitest';

import {
  createApprovedDocumentTypeId,
  createDocumentFolderId,
  createDocumentObjectId,
  createDocumentWorkspaceId,
  readDocumentCreationContext,
  type DocumentCreationContextDenialReason,
  type DocumentCreationObjectWorkspaceRead,
  type DocumentCreationContextReader,
  type DocumentCreationWorkspaceAccessDecision,
  type DocumentWorkspaceId,
} from './document-creation-context.js';

describe('document creation context contract', () => {
  it('denies a non-owner before reading object or folder details', () => {
    const { readObjectWorkspace, reader } = createReader(
      createDocumentWorkspaceId('workspace_alpha'),
    );

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_secret'),
      objectId: createDocumentObjectId('object_secret'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      workspaceAccess: denyWorkspaceAccess(),
    });

    expect(result).toEqual({
      reason: 'NOT_FOUND_OR_NOT_AUTHORIZED',
      status: 'denied',
    });
    expect(readObjectWorkspace).not.toHaveBeenCalled();
  });

  it('returns a query-only context for a user-defined ID folder', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_vent_camera_a'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      workspaceAccess: allowWorkspaceAccess(workspaceId),
    });

    expect(result.status).toBe('allowed');

    if (result.status === 'denied') {
      return;
    }

    expect(result.context.folder).toEqual({
      folderId: 'folder_vent_camera_a',
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
      'object_template',
      'linked_working_document',
    ]);
    expect(result.context.queryEffects).toEqual({
      createsDraft: false,
      mutatesSequence: false,
      reservesNumber: false,
    });
    expect(result.context.actions).toEqual(['select_document_type', 'create_document']);
  });

  it('proposes the next number inside the selected folder without reserving it', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_vent_camera_a'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
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

  it('does not treat another arbitrary folder as a fixed month enum or same numbering scope', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    const result = readDocumentCreationContext({
      folderId: createDocumentFolderId('folder_roof_stage'),
      objectId: createDocumentObjectId('object_main'),
      reader,
      requestedDocumentTypeId: createApprovedDocumentTypeId('AOSR'),
      workspaceAccess: allowWorkspaceAccess(workspaceId),
    });

    expect(result.status).toBe('allowed');

    if (result.status === 'denied') {
      return;
    }

    expect(result.context.folder.title).toBe('Кровля — этап 2');
    expect(result.context.numberingProposal?.formattedNumber).toBe('ОВ-8');
  });

  it('denies a missing folder with leakage-safe vocabulary', () => {
    const workspaceId = createDocumentWorkspaceId('workspace_alpha');
    const { reader } = createReader(workspaceId);

    expect(
      readDocumentCreationContext({
        folderId: createDocumentFolderId('folder_not_existing'),
        objectId: createDocumentObjectId('object_main'),
        reader,
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
  readonly readObjectWorkspace: ReturnType<
    typeof vi.fn<DocumentCreationContextReader['readObjectWorkspace']>
  >;
  readonly reader: DocumentCreationContextReader;
} {
  const objectWorkspace: DocumentCreationObjectWorkspaceRead = {
    approvedDocumentTypes: [
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
    ],
    existingDocumentNumbers: [
      {
        automaticSequence: 1,
        documentTypeId: createApprovedDocumentTypeId('AOSR'),
        folderId: createDocumentFolderId('folder_vent_camera_a'),
      },
      {
        automaticSequence: 2,
        documentTypeId: createApprovedDocumentTypeId('AOSR'),
        folderId: createDocumentFolderId('folder_vent_camera_a'),
      },
      {
        automaticSequence: 7,
        documentTypeId: createApprovedDocumentTypeId('AOSR'),
        folderId: createDocumentFolderId('folder_roof_stage'),
      },
      {
        automaticSequence: null,
        documentTypeId: createApprovedDocumentTypeId('AOSR'),
        folderId: createDocumentFolderId('folder_vent_camera_a'),
      },
    ],
    folders: [
      {
        folderId: createDocumentFolderId('folder_vent_camera_a'),
        title: 'Пусконаладка / венткамера A',
      },
      {
        folderId: createDocumentFolderId('folder_roof_stage'),
        title: 'Кровля — этап 2',
      },
    ],
    numberingPolicy: {
      nextSequenceMinimum: 1,
      prefix: 'ОВ-',
      scope: 'folder',
      suffix: '',
    },
    object: {
      objectId: createDocumentObjectId('object_main'),
      title: 'ЖК Северный / корпус 2',
      workspaceId,
    },
    objectTemplate: {
      objectTemplateId: 'object_template_main',
      organizationAssignmentCount: 2,
      repeatedTextKeys: ['projectDocumentation', 'complianceText', 'copies'],
      representativeAssignmentCount: 4,
      version: 12,
    },
  };

  const readObjectWorkspace = vi.fn<DocumentCreationContextReader['readObjectWorkspace']>(
    ({ objectId }) => (objectId === objectWorkspace.object.objectId ? objectWorkspace : null),
  );

  return {
    readObjectWorkspace,
    reader: {
      readObjectWorkspace,
    },
  };
}
