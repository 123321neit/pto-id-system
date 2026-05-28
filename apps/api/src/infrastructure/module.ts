import { Module } from '@nestjs/common';

import { loadApiEnv } from '../config/env.js';
import { DATABASE_HEALTH_PORT } from './database/database-health.port.js';
import { PrismaDatabaseHealthAdapter } from './database/prisma-database-health.adapter.js';

@Module({
  exports: [DATABASE_HEALTH_PORT],
  providers: [
    {
      provide: DATABASE_HEALTH_PORT,
      useFactory: () => new PrismaDatabaseHealthAdapter(loadApiEnv().DATABASE_URL),
    },
  ],
})
export class InfrastructureModule {}
