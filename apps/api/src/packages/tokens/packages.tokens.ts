export const PACKAGES_BOUNDARY_TOKENS = {
  generatedArtifactPort: Symbol('pto.packages.generated-artifact-port'),
  packageBuildPort: Symbol('pto.packages.build-port'),
  packageSnapshotPort: Symbol('pto.packages.snapshot-port'),
} as const;

export type PackagesBoundaryTokenName = keyof typeof PACKAGES_BOUNDARY_TOKENS;
