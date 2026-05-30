export const WORKSPACE_BOUNDARY_TOKENS = {
  currentActorResolverPort: Symbol('pto.workspace.current-actor-resolver-port'),
  membershipScopePort: Symbol('pto.workspace.membership-scope-port'),
  workspaceIsolationPort: Symbol('pto.workspace.isolation-port'),
} as const;

export type WorkspaceBoundaryTokenName = keyof typeof WORKSPACE_BOUNDARY_TOKENS;
