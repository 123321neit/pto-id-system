export type TechnicalHealthStatus = 'ok';

export type TechnicalHealthScope = 'technical';

export type TechnicalHealthService = 'api';

export interface TechnicalHealthResponse {
  readonly scope: TechnicalHealthScope;
  readonly service: TechnicalHealthService;
  readonly status: TechnicalHealthStatus;
  readonly timestamp: string;
}
