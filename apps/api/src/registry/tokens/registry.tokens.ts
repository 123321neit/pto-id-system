export const REGISTRY_BOUNDARY_TOKENS = {
  presentationOverridePort: Symbol('pto.registry.presentation-override-port'),
  projectionReadPort: Symbol('pto.registry.projection-read-port'),
  projectionRefreshPort: Symbol('pto.registry.projection-refresh-port'),
} as const;

export type RegistryBoundaryTokenName = keyof typeof REGISTRY_BOUNDARY_TOKENS;
