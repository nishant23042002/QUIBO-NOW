import { describe, expect, it, vi } from 'vitest';
import { EnvValidationError, loadEnv, publicEnvSchema, serverEnvSchema } from './env';

describe('loadEnv', () => {
  it('applies defaults when nothing is set', () => {
    expect(loadEnv(serverEnvSchema, {})).toEqual({ NODE_ENV: 'development', APP_ENV: 'local' });
    expect(loadEnv(publicEnvSchema, {})).toEqual({ NEXT_PUBLIC_APP_URL: 'http://localhost:3000' });
  });

  it('returns valid values as given', () => {
    const env = loadEnv(serverEnvSchema, {
      NODE_ENV: 'production',
      APP_ENV: 'staging',
      DATABASE_URL: 'postgresql://app:pw@localhost:5432/quibo',
      REDIS_URL: 'redis://localhost:6379',
    });
    expect(env.APP_ENV).toBe('staging');
    expect(env.DATABASE_URL).toBe('postgresql://app:pw@localhost:5432/quibo');
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('treats an empty string as unset', () => {
    const env = loadEnv(serverEnvSchema, { DATABASE_URL: '', APP_ENV: '' });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.APP_ENV).toBe('local');
  });

  it('throws one error naming every invalid variable', () => {
    const run = () =>
      loadEnv(serverEnvSchema, { APP_ENV: 'prod', DATABASE_URL: 'mysql://u:p@h/db' });
    expect(run).toThrow(EnvValidationError);
    try {
      run();
    } catch (error) {
      const names = (error as EnvValidationError).issues.map((i) => i.variable);
      expect(names).toEqual(expect.arrayContaining(['APP_ENV', 'DATABASE_URL']));
    }
  });

  it('rejects a database URL that is not postgres', () => {
    expect(() => loadEnv(serverEnvSchema, { DATABASE_URL: 'mysql://u:p@h/db' })).toThrow(
      EnvValidationError,
    );
  });

  it('rejects a Redis URL that is not redis or rediss', () => {
    expect(() => loadEnv(serverEnvSchema, { REDIS_URL: 'http://localhost:6379' })).toThrow(
      EnvValidationError,
    );
  });

  it('never puts a supplied value in the error, so secrets cannot leak into logs', () => {
    const secrets = ['hunter2-secret', 'TopSecretToken', 'prod-LEAK'];
    try {
      loadEnv(serverEnvSchema, {
        APP_ENV: 'prod-LEAK',
        DATABASE_URL: 'mysql://admin:hunter2-secret@host/db',
        REDIS_URL: 'TopSecretToken',
      });
      expect.unreachable('loadEnv should have thrown');
    } catch (error) {
      const text = `${(error as Error).message} ${JSON.stringify((error as EnvValidationError).issues)}`;
      for (const secret of secrets) expect(text).not.toContain(secret);
      expect(text).toContain('APP_ENV');
    }
  });

  it('reads process.env when no source is given', () => {
    vi.stubEnv('APP_ENV', 'production');
    try {
      expect(loadEnv(serverEnvSchema).APP_ENV).toBe('production');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
