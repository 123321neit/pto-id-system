import { describe, expect, it } from 'vitest';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns technical health status only', () => {
    const response = new HealthController().check();

    expect(response.scope).toBe('technical');
    expect(response.service).toBe('api');
    expect(response.status).toBe('ok');
  });
});
