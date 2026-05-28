import { config as loadDotenvFlow } from 'dotenv-flow';

import { apiEnvSchema, parseEnv, type ApiEnv } from '@pto/shared-config';

export function loadApiEnv(): ApiEnv {
  loadDotenvFlow({ silent: true });

  return parseEnv(apiEnvSchema, process.env);
}
