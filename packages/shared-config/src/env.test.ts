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
      SYSTEM_ADMIN_ACTOR_ID: '',
      NODE_ENV: 'development',
    });

    expect(parsed.DATABASE_URL).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_BUCKET).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_ENDPOINT).toBeUndefined();
    expect(parsed.OBJECT_STORAGE_REGION).toBeUndefined();
    expect(parsed.SYSTEM_ADMIN_ACTOR_ID).toBeUndefined();
  });

  it('accepts exactly one optional system admin actor id', () => {
    const parsed = parseEnv(apiEnvSchema, {
      NODE_ENV: 'development',
      SYSTEM_ADMIN_ACTOR_ID: ' configured_admin ',
    });

    expect(parsed.SYSTEM_ADMIN_ACTOR_ID).toBe('configured_admin');
  });

  it('rejects multiple system admin actor ids', () => {
    expect(() =>
      parseEnv(apiEnvSchema, {
        NODE_ENV: 'development',
        SYSTEM_ADMIN_ACTOR_ID: 'admin_one,admin_two',
      }),
    ).toThrow(/SYSTEM_ADMIN_ACTOR_ID/);
  });

  it('fails closed for production infrastructure configuration', () => {
    expect(() =>
      parseEnv(apiEnvSchema, {
        NODE_ENV: 'production',
      }),
    ).toThrow(/DATABASE_URL/);
  });
});
