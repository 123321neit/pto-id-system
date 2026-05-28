export type ProviderBoundaryKind =
  | 'persistence'
  | 'storage'
  | 'async-work'
  | 'artifact-rendering'
  | 'ai-provider';

export interface ProviderBoundaryPort {
  readonly adapterKind: ProviderBoundaryKind;
  readonly adapterName: string;
}
