import { z } from 'zod';

/** One invalid variable. Holds the name and the reason, never the supplied value. */
export interface EnvIssue {
  readonly variable: string;
  readonly message: string;
}

export class EnvValidationError extends Error {
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    super(
      `Invalid environment variables:\n${issues.map((i) => `  - ${i.variable}: ${i.message}`).join('\n')}`,
    );
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

export type EnvSource = Record<string, string | undefined>;

/**
 * Validate an environment against a Zod schema and return the parsed, typed result.
 *
 * - An empty string counts as unset, so `DATABASE_URL=` in a .env file behaves like a
 *   missing variable and falls back to the schema default or optional.
 * - On failure it throws one EnvValidationError listing every bad variable by name and
 *   reason. Values are never included: they may be secrets.
 */
export function loadEnv<S extends z.ZodType>(
  schema: S,
  source: EnvSource = process.env,
): z.output<S> {
  const cleaned: EnvSource = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== '') cleaned[key] = value;
  }

  const result = schema.safeParse(cleaned);
  if (result.success) return result.data;

  throw new EnvValidationError(
    result.error.issues.map((issue) => ({
      variable: issue.path.length > 0 ? issue.path.join('.') : '(environment)',
      message: issue.message,
    })),
  );
}

/** Variables the browser may see. Next.js only exposes names starting with NEXT_PUBLIC_. */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
});

/** Variables that must stay on the server. DATABASE_URL and REDIS_URL are used from Phase 2. */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }).optional(),
});

export type PublicEnv = z.output<typeof publicEnvSchema>;
export type ServerEnv = z.output<typeof serverEnvSchema>;
