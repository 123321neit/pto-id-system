import { Controller, Get } from '@nestjs/common';

import type { TechnicalHealthResponse } from '@pto/shared-types';

@Controller('health')
export class HealthController {
  @Get()
  check(): TechnicalHealthResponse {
    return {
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
