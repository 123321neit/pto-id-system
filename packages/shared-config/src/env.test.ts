import { describe, expect, it } from 'vitest';

import { apiEnvSchema, parseEnv } from './env.js';

describe('apiEnvSchema', () => {
  it('accepts minimal development environment values', () => {
    const parsed = parseEnv(apiEnvSchema, {
      NODE_ENV: 'development',
    });

    expect(parsed.API_PORT).toBe(3001);
    expect(parsed.CORS_ORIGINS).toEqual([]);
  });

  it('normalizes blank development DATABASE_URL as an unconfigured database', () => {
    const parsed = parseEnv(apiEnvSchema, {
      DATABASE_URL: '',
      OBJECT_STORAGE_BUCKET: '',
      OBJECT_STORAGE_ENDPOINT: '',
      OBJECT_STORAGE_REGION: '',
      NODE_ENV: 'development',
    });

    expect(parsed.DATABASE_URL).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_BUCKET).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_ENDPOINT).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_REGION).toBeUndefined();
  });

  it('fails closed for production infrastructure configuration', () => {
    expect(() =>
      parseEnv(apiEnvSchema, {
        NODE_ENV: 'production',
      }),
    ).toThrow(/DATABASE_URL/);
  });
});
