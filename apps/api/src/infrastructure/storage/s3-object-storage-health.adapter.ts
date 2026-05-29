import type { ApiEnv } from '@pto/shared-config';

import {
  checkObjectStorageHealth,
  type ObjectStorageHealthConfig,
} from './object-storage-health.js';
import type {
  ObjectStorageHealthPort,
  ObjectStorageHealthResult,
} from './object-storage-health.port.js';

type ObjectStorageEnv = Pick<
  ApiEnv,
  'OBJECT_STORAGE_BUCKET' | 'OBJECT_STORAGE_ENDPOINT' | 'OBJECT_STORAGE_REGION'
>;

export class S3ObjectStorageHealthAdapter implements ObjectStorageHealthPort {
  constructor(private readonly config: ObjectStorageHealthConfig) {}

  check(): Promise<ObjectStorageHealthResult> {
    return checkObjectStorageHealth({
      config: this.config,
    });
  }
}

export function readObjectStorageHealthConfig(env: ObjectStorageEnv): ObjectStorageHealthConfig {
  return {
    bucket: env.OBJECT_STORAGE_BUCKET,
    endpoint: env.OBJECT_STORAGE_ENDPOINT,
    region: env.OBJECT_STORAGE_REGION,
  };
}
