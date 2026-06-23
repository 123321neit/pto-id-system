export const DOCUMENTS_BOUNDARY_TOKENS = {
  documentCommandPort: Symbol('pto.documents.command-port'),
  documentCreationContextReadPort: Symbol('pto.documents.document-creation-context-read-port'),
  documentReadPort: Symbol('pto.documents.read-port'),
  revisionLifecyclePort: Symbol('pto.documents.revision-lifecycle-port'),
} as const;

export type DocumentsBoundaryTokenName = keyof typeof DOCUMENTS_BOUNDARY_TOKENS;
