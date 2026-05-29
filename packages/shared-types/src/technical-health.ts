export type TechnicalHealthStatus = 'ok';

export type TechnicalHealthScope = 'technical';

export type TechnicalHealthService = 'api';

export type TechnicalDependencyStatus = 'configured' | 'unconfigured' | 'ok' | 'error';

export interface TechnicalDependencyHealth {
  readonly status: TechnicalDependencyStatus;
}

export interface TechnicalHealthDependencies {
  readonly database?: TechnicalDependencyHealth;
  readonly storage?: TechnicalDependencyHealth;
}

export interface TechnicalHealthResponse {
  readonly dependencies?: TechnicalHealthDependencies;
  readonly scope: TechnicalHealthScope;
  readonly service: TechnicalHealthService;
  readonly status: TechnicalHealthStatus;
  readonly timestamp: string;
}
