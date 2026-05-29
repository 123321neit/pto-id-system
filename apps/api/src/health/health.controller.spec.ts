import { describe, expect, it } from 'vitest';

import type { DatabaseHealthPort } from '../shared-kernel/interfaces/database-health.js';
import type { ObjectStorageHealthPort } from '../shared-kernel/interfaces/object-storage-health.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns technical health status with unconfigured infrastructure dependencies', async () => {
    const response = await new HealthController(
      createDatabaseHealthPort('unconfigured'),
      createObjectStorageHealthPort('unconfigured'),
    ).check();

    expect(response).toEqual({
      dependencies: {
        database: {
          status: 'unconfigured',
        },
        storage: {
          status: 'unconfigured',
        },
      },
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: expect.any(String) as string,
    });
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });

  it('does not turn dependency errors into domain readiness semantics', async () => {
    const response = await new HealthController(
      createDatabaseHealthPort('error'),
      createObjectStorageHealthPort('error'),
    ).check();

    expect(response.status).toBe('ok');
    expect(response.dependencies?.database?.status).toBe('error');
    expect(response.dependencies?.storage?.status).toBe('error');
  });
});

function createDatabaseHealthPort(status: 'unconfigured' | 'error'): DatabaseHealthPort {
  return {
    check: () => Promise.resolve({ status }),
  };
}

function createObjectStorageHealthPort(status: 'unconfigured' | 'error'): ObjectStorageHealthPort {
  return {
    check: () => Promise.resolve({ status }),
  };
}
