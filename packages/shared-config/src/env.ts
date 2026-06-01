import { z } from 'zod';

const runtimeEnvironmentSchema = z.enum(['development', 'test', 'production']);

type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

const portSchema = z.coerce.number().int().min(1).max(65_535);

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal('').transform(() => undefined));

const optionalTextSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal('').transform(() => undefined));

const optionalSingleActorIdSchema = optionalTextSchema.superRefine((value, context) => {
  if (value?.includes(',') === true) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'must configure exactly one actor id',
    });
  }
});

const csvListSchema = z
  .string()
  .optional()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );

const productionRequiredKeys = [
  'APP_BASE_URL',
  'CORS_ORIGINS',
  'DATABASE_URL',
  'OBJECT_STORAGE_BUCKET',
  'OBJECT_STORAGE_ENDPOINT',
  'OBJECT_STORAGE_REGION',
  'REDIS_URL',
  'SESSION_SECRET',
] as const;

export const apiEnvSchema = z
  .object({
    API_PORT: portSchema.default(3001),
    APP_BASE_URL: optionalUrlSchema,
    CORS_ORIGINS: csvListSchema,
    DATABASE_URL: optionalTextSchema,
    NODE_ENV: runtimeEnvironmentSchema.default('development'),
    OBJECT_STORAGE_BUCKET: optionalTextSchema,
    OBJECT_STORAGE_ENDPOINT: optionalUrlSchema,
    OBJECT_STORAGE_REGION: optionalTextSchema,
    PUBLIC_API_BASE_URL: optionalUrlSchema,
    REDIS_URL: optionalTextSchema,
    SESSION_SECRET: optionalTextSchema,
    SYSTEM_ADMIN_ACTOR_ID: optionalSingleActorIdSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') {
      return;
    }

    for (const key of productionRequiredKeys) {
      const currentValue = value[key];

      if (Array.isArray(currentValue) && currentValue.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required in production`,
          path: [key],
        });
        continue;
      }

      if (currentValue === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required in production`,
          path: [key],
        });
      }
    }
  });

export const webEnvSchema = z
  .object({
    VITE_API_BASE_URL: optionalUrlSchema,
    VITE_APP_ENV: runtimeEnvironmentSchema.default('development'),
  })
  .strict();

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export type WebEnv = z.infer<typeof webEnvSchema>;

interface SafeEnvSchema<TOutput> {
  safeParse(input: unknown): z.SafeParseReturnType<unknown, TOutput>;
}

export function parseEnv<TOutput>(
  schema: SafeEnvSchema<TOutput>,
  env: Record<string, unknown>,
): TOutput {
  const result = schema.safeParse(env);

  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${formatIssues(result.error)}`);
  }

  return result.data;
}

export function isRuntimeEnvironment(value: string): value is RuntimeEnvironment {
  return runtimeEnvironmentSchema.safeParse(value).success;
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'env';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
