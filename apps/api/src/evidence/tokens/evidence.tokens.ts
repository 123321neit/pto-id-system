export const EVIDENCE_BOUNDARY_TOKENS = {
  certificatePort: Symbol('pto.evidence.certificate-port'),
  executiveSchemePort: Symbol('pto.evidence.executive-scheme-port'),
  evidenceFileRequirementPort: Symbol('pto.evidence.file-requirement-port'),
} as const;

export type EvidenceBoundaryTokenName = keyof typeof EVIDENCE_BOUNDARY_TOKENS;
