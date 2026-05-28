export type RuntimeEnvironment = 'development' | 'test' | 'production';

export type TechnicalHealthStatus = 'ok';

export interface TechnicalHealthResponse {
  readonly scope: 'technical';
  readonly service: string;
  readonly status: TechnicalHealthStatus;
  readonly timestamp: string;
}
