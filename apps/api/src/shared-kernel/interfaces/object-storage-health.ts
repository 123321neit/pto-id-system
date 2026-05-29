export type ObjectStorageHealthStatus = 'configured' | 'unconfigured' | 'ok' | 'error';

export interface ObjectStorageHealthResult {
  readonly status: ObjectStorageHealthStatus;
}

export interface ObjectStorageHealthPort {
  check(): Promise<ObjectStorageHealthResult>;
}

export interface ObjectStorageConnectivityAdapter {
  executeConnectivityCheck(): Promise<void>;
}

export const OBJECT_STORAGE_HEALTH_PORT = Symbol('pto.infrastructure.object-storage-health-port');
