export type BackendModuleName =
  | 'ai'
  | 'documents'
  | 'evidence'
  | 'health'
  | 'infrastructure'
  | 'packages'
  | 'registry'
  | 'shared-kernel'
  | 'workspace';

export interface ModuleBoundaryScope {
  readonly moduleName: BackendModuleName;
}

export interface WorkspaceBoundaryScope {
  readonly workspaceId: string;
}
