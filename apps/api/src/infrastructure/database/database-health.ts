import type {
  DatabaseConnectivityAdapter,
  DatabaseHealthResult,
  DatabaseHealthStatus,
} from './database-health.port.js';

export interface DatabaseHealthCheckInput {
  readonly createAdapter: () => DatabaseConnectivityAdapter;
  readonly databaseUrl: string | undefined;
}

export function getDatabaseConfigurationStatus(
  databaseUrl: string | undefined,
): Extract<DatabaseHealthStatus, 'configured' | 'unconfigured'> {
  return isConfigured(databaseUrl) ? 'configured' : 'unconfigured';
}

export async function checkDatabaseHealth(
  input: DatabaseHealthCheckInput,
): Promise<DatabaseHealthResult> {
  if (getDatabaseConfigurationStatus(input.databaseUrl) === 'unconfigured') {
    return { status: 'unconfigured' };
  }

  const adapter = input.createAdapter();
  let status: DatabaseHealthStatus = 'ok';

  try {
    await adapter.executeConnectivityCheck();
  } catch {
    status = 'error';
  }

  try {
    await adapter.disconnect();
  } catch {
    status = 'error';
  }

  return { status };
}

function isConfigured(databaseUrl: string | undefined): boolean {
  return databaseUrl !== undefined && databaseUrl.trim().length > 0;
}
