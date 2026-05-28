import { describe, expect, it } from 'vitest';

import { checkDatabaseHealth, getDatabaseConfigurationStatus } from './database-health.js';
import type { DatabaseConnectivityAdapter } from './database-health.port.js';

describe('database health utility', () => {
  it('reports unconfigured when DATABASE_URL is absent and does not touch an adapter', async () => {
    let adapterWasCreated = false;

    await expect(
      checkDatabaseHealth({
        createAdapter: () => {
          adapterWasCreated = true;
          return createAdapter();
        },
        databaseUrl: undefined,
      }),
    ).resolves.toEqual({ status: 'unconfigured' });
    expect(adapterWasCreated).toBe(false);
  });

  it('reports configured status from DATABASE_URL presence only', () => {
    expect(getDatabaseConfigurationStatus(undefined)).toBe('unconfigured');
    expect(getDatabaseConfigurationStatus('')).toBe('unconfigured');
    expect(getDatabaseConfigurationStatus('postgresql://user:pass@localhost:5432/db')).toBe(
      'configured',
    );
  });

  it('runs the lightweight adapter check when DATABASE_URL is configured', async () => {
    const calls: string[] = [];

    await expect(
      checkDatabaseHealth({
        createAdapter: () =>
          createAdapter({
            calls,
          }),
        databaseUrl: 'postgresql://user:pass@localhost:5432/db',
      }),
    ).resolves.toEqual({ status: 'ok' });
    expect(calls).toEqual(['check', 'disconnect']);
  });

  it('reports error when the adapter check fails and still disconnects', async () => {
    const calls: string[] = [];

    await expect(
      checkDatabaseHealth({
        createAdapter: () =>
          createAdapter({
            calls,
            shouldFailCheck: true,
          }),
        databaseUrl: 'postgresql://user:pass@localhost:5432/db',
      }),
    ).resolves.toEqual({ status: 'error' });
    expect(calls).toEqual(['check', 'disconnect']);
  });
});

function createAdapter(options?: {
  readonly calls?: string[];
  readonly shouldFailCheck?: boolean;
}): DatabaseConnectivityAdapter {
  const calls = options?.calls;

  return {
    disconnect() {
      calls?.push('disconnect');
      return Promise.resolve();
    },
    executeConnectivityCheck() {
      calls?.push('check');

      if (options?.shouldFailCheck === true) {
        return Promise.reject(new Error('Database unavailable.'));
      }

      return Promise.resolve();
    },
  };
}
