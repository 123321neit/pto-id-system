export const DOCUMENT_CREATION_CONTEXT_DENIAL = {
  notFoundOrNotAuthorized: 'NOT_FOUND_OR_NOT_AUTHORIZED',
} as const;

export type ApprovedDocumentTypeId = string & {
  readonly __approvedDocumentTypeId: 'ApprovedDocumentTypeId';
};

export type DocumentFolderId = string & {
  readonly __documentFolderId: 'DocumentFolderId';
};

export type DocumentObjectId = string & {
  readonly __documentObjectId: 'DocumentObjectId';
};

export type DocumentSectionId = string & {
  readonly __documentSectionId: 'DocumentSectionId';
};

export type DocumentWorkspaceId = string & {
  readonly __documentWorkspaceId: 'DocumentWorkspaceId';
};

export type DocumentCreationWorkspaceAccessDecision =
  | {
      readonly status: 'allowed';
      readonly workspaceId: DocumentWorkspaceId;
    }
  | {
      readonly reason: DocumentCreationContextDenialReason;
      readonly status: 'denied';
    };

export interface UserDefinedDocumentFolder {
  readonly folderId: DocumentFolderId;
  readonly sectionId: DocumentSectionId;
  readonly title: string;
}

export interface ApprovedDocumentType {
  readonly documentTypeId: ApprovedDocumentTypeId;
  readonly lifecycle: 'approved' | 'deferred';
  readonly registryCode: string;
  readonly title: string;
}

export interface SectionTemplateCreationSummary {
  readonly organizationAssignmentCount: number;
  readonly repeatedTextKeys: readonly string[];
  readonly representativeAssignmentCount: number;
  readonly sectionTemplateId: string;
  readonly version: number;
}

export interface DocumentNumberingPolicy {
  readonly nextSequenceMinimum: number;
  readonly prefix: string;
  readonly scope: 'folder' | 'section';
  readonly suffix: string;
}

export interface ExistingDocumentNumber {
  readonly automaticSequence: number | null;
  readonly documentTypeId: ApprovedDocumentTypeId;
  readonly folderId: DocumentFolderId;
  readonly sectionId: DocumentSectionId;
}

export interface DocumentCreationSectionWorkspaceRead {
  readonly approvedDocumentTypes: readonly ApprovedDocumentType[];
  readonly existingDocumentNumbers: readonly ExistingDocumentNumber[];
  readonly folders: readonly UserDefinedDocumentFolder[];
  readonly numberingPolicy: DocumentNumberingPolicy;
  readonly object: {
    readonly objectId: DocumentObjectId;
    readonly title: string;
    readonly workspaceId: DocumentWorkspaceId;
  };
  readonly section: {
    readonly objectId: DocumentObjectId;
    readonly sectionId: DocumentSectionId;
    readonly title: string;
    readonly workspaceId: DocumentWorkspaceId;
  };
  readonly sectionTemplate: SectionTemplateCreationSummary;
}

export interface DocumentCreationContextReader {
  readSectionWorkspace(input: {
    readonly objectId: DocumentObjectId;
    readonly sectionId: DocumentSectionId;
    readonly workspaceId: DocumentWorkspaceId;
  }): DocumentCreationSectionWorkspaceRead | null;
}

export interface ReadDocumentCreationContextInput {
  readonly folderId: DocumentFolderId;
  readonly objectId: DocumentObjectId;
  readonly reader: DocumentCreationContextReader;
  readonly requestedDocumentTypeId?: ApprovedDocumentTypeId;
  readonly sectionId: DocumentSectionId;
  readonly workspaceAccess: DocumentCreationWorkspaceAccessDecision;
}

export interface DocumentCreationNumberingProposal {
  readonly documentTypeId: ApprovedDocumentTypeId;
  readonly formattedNumber: string;
  readonly reservation: 'none';
  readonly sequence: number;
  readonly source: 'proposal_only';
}

export interface DocumentCreationContextReadModel {
  readonly actions: readonly ('create_document' | 'select_document_type')[];
  readonly approvedDocumentTypes: readonly ApprovedDocumentType[];
  readonly folder: UserDefinedDocumentFolder;
  readonly idPackageScope: {
    readonly finalId: 'section';
    readonly intermediateId: 'folder';
  };
  readonly liveResolutionChain: readonly [
    'global_libraries',
    'section_template',
    'linked_working_document',
  ];
  readonly numberingProposal: DocumentCreationNumberingProposal | null;
  readonly object: {
    readonly objectId: DocumentObjectId;
    readonly title: string;
  };
  readonly queryEffects: {
    readonly createsDraft: false;
    readonly mutatesSequence: false;
    readonly reservesNumber: false;
  };
  readonly section: {
    readonly sectionId: DocumentSectionId;
    readonly title: string;
  };
  readonly sectionTemplate: SectionTemplateCreationSummary;
  readonly selectedDocumentType: ApprovedDocumentType | null;
}

export type DocumentCreationContextDenialReason =
  (typeof DOCUMENT_CREATION_CONTEXT_DENIAL)[keyof typeof DOCUMENT_CREATION_CONTEXT_DENIAL];

export type ReadDocumentCreationContextResult =
  | {
      readonly context: DocumentCreationContextReadModel;
      readonly status: 'allowed';
    }
  | {
      readonly reason: DocumentCreationContextDenialReason;
      readonly status: 'denied';
    };

export function createApprovedDocumentTypeId(value: string): ApprovedDocumentTypeId {
  return createNonEmptyId(value, 'Approved document type id') as ApprovedDocumentTypeId;
}

export function createDocumentFolderId(value: string): DocumentFolderId {
  return createNonEmptyId(value, 'Document folder id') as DocumentFolderId;
}

export function createDocumentObjectId(value: string): DocumentObjectId {
  return createNonEmptyId(value, 'Document object id') as DocumentObjectId;
}

export function createDocumentSectionId(value: string): DocumentSectionId {
  return createNonEmptyId(value, 'Document section id') as DocumentSectionId;
}

export function createDocumentWorkspaceId(value: string): DocumentWorkspaceId {
  return createNonEmptyId(value, 'Document workspace id') as DocumentWorkspaceId;
}

export function readDocumentCreationContext(
  input: ReadDocumentCreationContextInput,
): ReadDocumentCreationContextResult {
  if (input.workspaceAccess.status === 'denied') {
    return denyDocumentCreationContext();
  }

  const sectionWorkspace = input.reader.readSectionWorkspace({
    objectId: input.objectId,
    sectionId: input.sectionId,
    workspaceId: input.workspaceAccess.workspaceId,
  });

  if (sectionWorkspace?.object.workspaceId !== input.workspaceAccess.workspaceId) {
    return denyDocumentCreationContext();
  }

  if (
    sectionWorkspace.object.objectId !== input.objectId ||
    sectionWorkspace.section.objectId !== input.objectId ||
    sectionWorkspace.section.sectionId !== input.sectionId ||
    sectionWorkspace.section.workspaceId !== input.workspaceAccess.workspaceId
  ) {
    return denyDocumentCreationContext();
  }

  const folder = sectionWorkspace.folders.find(
    (candidateFolder) =>
      candidateFolder.folderId === input.folderId && candidateFolder.sectionId === input.sectionId,
  );

  if (folder === undefined) {
    return denyDocumentCreationContext();
  }

  const approvedDocumentTypes = sectionWorkspace.approvedDocumentTypes.filter(
    (documentType) => documentType.lifecycle === 'approved',
  );
  const selectedDocumentType =
    input.requestedDocumentTypeId === undefined
      ? null
      : (approvedDocumentTypes.find(
          (documentType) => documentType.documentTypeId === input.requestedDocumentTypeId,
        ) ?? null);

  if (input.requestedDocumentTypeId !== undefined && selectedDocumentType === null) {
    return denyDocumentCreationContext();
  }

  const proposalDocumentType = selectedDocumentType ?? approvedDocumentTypes[0] ?? null;

  return {
    context: {
      actions:
        proposalDocumentType === null
          ? []
          : selectedDocumentType === null
            ? ['select_document_type']
            : ['select_document_type', 'create_document'],
      approvedDocumentTypes,
      folder,
      idPackageScope: {
        finalId: 'section',
        intermediateId: 'folder',
      },
      liveResolutionChain: ['global_libraries', 'section_template', 'linked_working_document'],
      numberingProposal:
        proposalDocumentType === null
          ? null
          : createNumberingProposal({
              documentTypeId: proposalDocumentType.documentTypeId,
              existingNumbers: sectionWorkspace.existingDocumentNumbers,
              folderId: folder.folderId,
              policy: sectionWorkspace.numberingPolicy,
              sectionId: input.sectionId,
            }),
      object: {
        objectId: sectionWorkspace.object.objectId,
        title: sectionWorkspace.object.title,
      },
      queryEffects: {
        createsDraft: false,
        mutatesSequence: false,
        reservesNumber: false,
      },
      section: {
        sectionId: sectionWorkspace.section.sectionId,
        title: sectionWorkspace.section.title,
      },
      sectionTemplate: sectionWorkspace.sectionTemplate,
      selectedDocumentType,
    },
    status: 'allowed',
  };
}

function createNumberingProposal(input: {
  readonly documentTypeId: ApprovedDocumentTypeId;
  readonly existingNumbers: readonly ExistingDocumentNumber[];
  readonly folderId: DocumentFolderId;
  readonly policy: DocumentNumberingPolicy;
  readonly sectionId: DocumentSectionId;
}): DocumentCreationNumberingProposal {
  const existingSequences = input.existingNumbers
    .filter((existingNumber) => existingNumber.documentTypeId === input.documentTypeId)
    .filter((existingNumber) => existingNumber.sectionId === input.sectionId)
    .filter(
      (existingNumber) =>
        input.policy.scope === 'section' || existingNumber.folderId === input.folderId,
    )
    .map((existingNumber) => existingNumber.automaticSequence)
    .filter((sequence): sequence is number => sequence !== null);
  const nextSequence = Math.max(
    input.policy.nextSequenceMinimum,
    ...existingSequences.map((n) => n + 1),
  );

  return {
    documentTypeId: input.documentTypeId,
    formattedNumber: `${input.policy.prefix}${String(nextSequence)}${input.policy.suffix}`,
    reservation: 'none',
    sequence: nextSequence,
    source: 'proposal_only',
  };
}

function denyDocumentCreationContext(): Extract<
  ReadDocumentCreationContextResult,
  { status: 'denied' }
> {
  return {
    reason: DOCUMENT_CREATION_CONTEXT_DENIAL.notFoundOrNotAuthorized,
    status: 'denied',
  };
}

function createNonEmptyId(value: string, label: string): string {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value;
}
