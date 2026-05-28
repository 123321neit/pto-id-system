export const AI_BOUNDARY_TOKENS = {
  findingProposalPort: Symbol('pto.ai.finding-proposal-port'),
  reviewDecisionPort: Symbol('pto.ai.review-decision-port'),
} as const;

export type AiBoundaryTokenName = keyof typeof AI_BOUNDARY_TOKENS;
