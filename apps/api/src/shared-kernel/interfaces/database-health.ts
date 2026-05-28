export type DatabaseHealthStatus = 'configured' | 'unconfigured' | 'ok' | 'error';

export interface DatabaseHealthResult {
  readonly status: DatabaseHealthStatus;
}

export interface DatabaseHealthPort {
  check(): Promise<DatabaseHealthResult>;
}

export interface DatabaseConnectivityAdapter {
  disconnect(): Promise<void>;
  executeConnectivityCheck(): Promise<void>;
}

export const DATABASE_HEALTH_PORT = Symbol('pto.infrastructure.database-health-port');
