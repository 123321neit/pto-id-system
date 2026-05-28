import { parseEnv, webEnvSchema } from '@pto/shared-config';

export const webEnv = parseEnv(webEnvSchema, {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
});
