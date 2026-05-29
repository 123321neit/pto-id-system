import { describe, expect, it } from 'vitest';

import {
  checkObjectStorageHealth,
  getObjectStorageConfigurationStatus,
} from './object-storage-health.js';
import type { ObjectStorageConnectivityAdapter } from './object-storage-health.port.js';
import {
  readObjectStorageHealthConfig,
  S3ObjectStorageHealthAdapter,
} from './s3-object-storage-health.adapter.js';

describe('object storage health utility', () => {
  it('reports unconfigured when required storage config is absent and does not touch an adapter', async () => {
    let adapterWasCreated = false;

    await expect(
      checkObjectStorageHealth({
        config: {
          bucket: undefined,
          endpoint: 'endpoint',
          region: 'region',
        },
        createAdapter: () => {
          adapterWasCreated = true;
          return createAdapter();
        },
      }),
    ).resolves.toEqual({ status: 'unconfigured' });
    expect(adapterWasCreated).toBe(false);
  });

  it('reports configured status from endpoint, bucket, and region presence only', () => {
    expect(
      getObjectStorageConfigurationStatus({
        bucket: undefined,
        endpoint: undefined,
        region: undefined,
      }),
    ).toBe('unconfigured');
    expect(
      getObjectStorageConfigurationStatus({
        bucket: '',
        endpoint: 'endpoint',
        region: 'region',
      }),
    ).toBe('unconfigured');
    expect(
      getObjectStorageConfigurationStatus({
        bucket: 'bucket',
        endpoint: 'endpoint',
        region: 'region',
      }),
    ).toBe('configured');
  });

  it('reports configured without a network adapter so runtime health stays non-brittle', async () => {
    await expect(
      checkObjectStorageHealth({
        config: {
          bucket: 'bucket',
          endpoint: 'endpoint',
          region: 'region',
        },
      }),
    ).resolves.toEqual({ status: 'configured' });
  });

  it('can run a mocked lightweight adapter check when one is supplied', async () => {
    const calls: string[] = [];

    await expect(
      checkObjectStorageHealth({
        config: {
          bucket: 'bucket',
          endpoint: 'endpoint',
          region: 'region',
        },
        createAdapter: () => createAdapter({ calls }),
      }),
    ).resolves.toEqual({ status: 'ok' });
    expect(calls).toEqual(['check']);
  });

  it('reports error when the mocked adapter check fails', async () => {
    await expect(
      checkObjectStorageHealth({
        config: {
          bucket: 'bucket',
          endpoint: 'endpoint',
          region: 'region',
        },
        createAdapter: () => createAdapter({ shouldFailCheck: true }),
      }),
    ).resolves.toEqual({ status: 'error' });
  });

  it('keeps the S3-compatible adapter config-driven and status-only', async () => {
    const adapter = new S3ObjectStorageHealthAdapter(
      readObjectStorageHealthConfig({
        OBJECT_STORAGE_BUCKET: 'bucket',
        OBJECT_STORAGE_ENDPOINT: 'endpoint',
        OBJECT_STORAGE_REGION: 'region',
      }),
    );

    await expect(adapter.check()).resolves.toEqual({ status: 'configured' });
  });
});

function createAdapter(options?: {
  readonly calls?: string[];
  readonly shouldFailCheck?: boolean;
}): ObjectStorageConnectivityAdapter {
  const calls = options?.calls;

  return {
    executeConnectivityCheck() {
      calls?.push('check');

      if (options?.shouldFailCheck === true) {
        return Promise.reject(new Error('Object storage unavailable.'));
      }

      return Promise.resolve();
    },
  };
}
