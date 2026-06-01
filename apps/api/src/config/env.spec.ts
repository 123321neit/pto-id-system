import { describe, expect, it } from 'vitest';

import { apiEnvSchema, parseEnv } from '@pto/shared-config';

import { readApiEnvInput } from './env.js';

describe('api env input', () => {
  it('keeps process-level noise out of the strict API env schema', () => {
    const parsed = parseEnv(
      apiEnvSchema,
      readApiEnvInput({
        NODE_ENV: 'development',
        SYSTEM_ADMIN_ACTOR_ID: 'configured_admin',
        UNRELATED_PROCESS_KEY: 'ignored',
      }),
    );

    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.API_PORT).toBe(3001);
    expect(parsed.SYSTEM_ADMIN_ACTOR_ID).toBe('configured_admin');
  });
});
