import { describe, expect, it } from 'vitest';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns technical health status only', () => {
    const response = new HealthController().check();

    expect(response).toEqual({
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: expect.any(String) as string,
    });
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });
});
