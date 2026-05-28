export const INFRASTRUCTURE_BOUNDARY_TOKENS = {
  aiProviderAdapter: Symbol('pto.infrastructure.ai-provider-adapter'),
  artifactAdapter: Symbol('pto.infrastructure.artifact-adapter'),
  asyncWorkAdapter: Symbol('pto.infrastructure.async-work-adapter'),
  persistenceAdapter: Symbol('pto.infrastructure.persistence-adapter'),
  storageAdapter: Symbol('pto.infrastructure.storage-adapter'),
} as const;

export type InfrastructureBoundaryTokenName = keyof typeof INFRASTRUCTURE_BOUNDARY_TOKENS;
