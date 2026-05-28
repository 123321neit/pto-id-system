import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../infrastructure/module.js';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
  imports: [InfrastructureModule],
})
export class HealthModule {}
