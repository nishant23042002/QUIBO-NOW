import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadEnv, publicEnvSchema, serverEnvSchema } from './env';

/** Parse a .env file: KEY=value lines, ignoring comments and blank lines. */
function parseDotenv(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match?.[1] !== undefined) values[match[1]] = match[2] ?? '';
  }
  return values;
}

const example = parseDotenv(
  readFileSync(new URL('../../../.env.example', import.meta.url), 'utf8'),
);

describe('.env.example', () => {
  it('is accepted by the env loader as it is', () => {
    expect(() => loadEnv(publicEnvSchema, example)).not.toThrow();
    expect(() => loadEnv(serverEnvSchema, example)).not.toThrow();
  });

  it('documents every variable the schemas read', () => {
    const read = [
      ...Object.keys(publicEnvSchema.shape),
      ...Object.keys(serverEnvSchema.shape).filter((name) => name !== 'NODE_ENV'),
    ];
    expect(Object.keys(example)).toEqual(expect.arrayContaining(read));
  });

  it('holds no secrets: every password, token, key or secret is left blank', () => {
    const sensitive = Object.entries(example).filter(([name]) =>
      /PASSWORD|SECRET|TOKEN|KEY/.test(name),
    );
    expect(sensitive.length).toBeGreaterThan(0);
    for (const [name, value] of sensitive) expect(value, name).toBe('');
  });

  it('holds no credentials inside connection strings', () => {
    for (const name of ['DATABASE_URL', 'REDIS_URL']) {
      expect(example[name], name).toBe('');
    }
  });
});
