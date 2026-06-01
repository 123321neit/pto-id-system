import { config as loadDotenvFlow } from 'dotenv-flow';

import { apiEnvSchema, parseEnv, type ApiEnv } from '@pto/shared-config';

const apiEnvKeys = [
  'API_PORT',
  'APP_BASE_URL',
  'CORS_ORIGINS',
  'DATABASE_URL',
  'NODE_ENV',
  'OBJECT_STORAGE_BUCKET',
  'OBJECT_STORAGE_ENDPOINT',
  'OBJECT_STORAGE_REGION',
  'PUBLIC_API_BASE_URL',
  'REDIS_URL',
  'SESSION_SECRET',
  'SYSTEM_ADMIN_ACTOR_ID',
] as const satisfies readonly (keyof ApiEnv)[];

type ApiEnvKey = (typeof apiEnvKeys)[number];

export function loadApiEnv(): ApiEnv {
  loadDotenvFlow({ silent: true });

  return parseEnv(apiEnvSchema, readApiEnvInput(process.env));
}

export function readApiEnvInput(env: NodeJS.ProcessEnv): Record<ApiEnvKey, string | undefined> {
  const input = {} as Record<ApiEnvKey, string | undefined>;

  for (const key of apiEnvKeys) {
    input[key] = env[key];
  }

  return input;
}
