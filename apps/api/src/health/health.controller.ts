import { Controller, Get, Inject } from '@nestjs/common';

import type { TechnicalHealthResponse } from '@pto/shared-types';

import {
  DATABASE_HEALTH_PORT,
  type DatabaseHealthPort,
} from '../shared-kernel/interfaces/database-health.js';
import {
  OBJECT_STORAGE_HEALTH_PORT,
  type ObjectStorageHealthPort,
} from '../shared-kernel/interfaces/object-storage-health.js';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_HEALTH_PORT)
    private readonly databaseHealth: DatabaseHealthPort,
    @Inject(OBJECT_STORAGE_HEALTH_PORT)
    private readonly objectStorageHealth: ObjectStorageHealthPort,
  ) {}

  @Get()
  async check(): Promise<TechnicalHealthResponse> {
    const [database, storage] = await Promise.all([
      this.databaseHealth.check(),
      this.objectStorageHealth.check(),
    ]);

    return {
      dependencies: {
        database,
        storage,
      },
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
