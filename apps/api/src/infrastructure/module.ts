import { Module } from '@nestjs/common';

import { loadApiEnv } from '../config/env.js';
import { DATABASE_HEALTH_PORT } from './database/database-health.port.js';
import { PrismaDatabaseHealthAdapter } from './database/prisma-database-health.adapter.js';
import { OBJECT_STORAGE_HEALTH_PORT } from './storage/object-storage-health.port.js';
import {
  readObjectStorageHealthConfig,
  S3ObjectStorageHealthAdapter,
} from './storage/s3-object-storage-health.adapter.js';

@Module({
  exports: [DATABASE_HEALTH_PORT, OBJECT_STORAGE_HEALTH_PORT],
  providers: [
    {
      provide: DATABASE_HEALTH_PORT,
      useFactory: () => new PrismaDatabaseHealthAdapter(loadApiEnv().DATABASE_URL),
    },
    {
      provide: OBJECT_STORAGE_HEALTH_PORT,
      useFactory: () =>
        new S3ObjectStorageHealthAdapter(readObjectStorageHealthConfig(loadApiEnv())),
    },
  ],
})
export class InfrastructureModule {}
