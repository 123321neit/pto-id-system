import { Controller, Get, Inject } from '@nestjs/common';

import type { TechnicalHealthResponse } from '@pto/shared-types';

import {
  DATABASE_HEALTH_PORT,
  type DatabaseHealthPort,
} from '../shared-kernel/interfaces/database-health.js';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_HEALTH_PORT)
    private readonly databaseHealth: DatabaseHealthPort,
  ) {}

  @Get()
  async check(): Promise<TechnicalHealthResponse> {
    const database = await this.databaseHealth.check();

    return {
      dependencies: {
        database,
      },
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
