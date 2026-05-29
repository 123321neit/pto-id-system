import type {
  ObjectStorageConnectivityAdapter,
  ObjectStorageHealthResult,
  ObjectStorageHealthStatus,
} from './object-storage-health.port.js';

export interface ObjectStorageHealthConfig {
  readonly bucket: string | undefined;
  readonly endpoint: string | undefined;
  readonly region: string | undefined;
}

export interface ObjectStorageHealthCheckInput {
  readonly config: ObjectStorageHealthConfig;
  readonly createAdapter?: () => ObjectStorageConnectivityAdapter;
}

export function getObjectStorageConfigurationStatus(
  config: ObjectStorageHealthConfig,
): Extract<ObjectStorageHealthStatus, 'configured' | 'unconfigured'> {
  return isConfigured(config.bucket) && isConfigured(config.endpoint) && isConfigured(config.region)
    ? 'configured'
    : 'unconfigured';
}

export async function checkObjectStorageHealth(
  input: ObjectStorageHealthCheckInput,
): Promise<ObjectStorageHealthResult> {
  const configurationStatus = getObjectStorageConfigurationStatus(input.config);

  if (configurationStatus === 'unconfigured') {
    return { status: 'unconfigured' };
  }

  if (input.createAdapter === undefined) {
    return { status: 'configured' };
  }

  try {
    const adapter = input.createAdapter();
    await adapter.executeConnectivityCheck();
  } catch {
    return { status: 'error' };
  }

  return { status: 'ok' };
}

function isConfigured(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}
