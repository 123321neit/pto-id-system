export const WORKSPACE_BOUNDARY_TOKENS = {
  membershipScopePort: Symbol('pto.workspace.membership-scope-port'),
  workspaceIsolationPort: Symbol('pto.workspace.isolation-port'),
} as const;

export type WorkspaceBoundaryTokenName = keyof typeof WORKSPACE_BOUNDARY_TOKENS;
