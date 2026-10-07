import { HealthResponseSchema } from '@quibo/contracts';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { handlers } from './handlers';
import { server } from './server';

// Any request without a handler must fail loudly, so a screen can never quietly depend on an
// endpoint nobody mocked.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe('GET /health', () => {
  it('answers with a body that satisfies the HealthResponse contract', async () => {
    const response = await fetch('http://localhost:4000/health');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(HealthResponseSchema.parse(await response.json())).toEqual({ status: 'ok' });
  });

  it('matches whatever origin the API is later served from', async () => {
    const response = await fetch('https://api.example.test/health');
    expect(response.status).toBe(200);
  });

  it('is the only handler in Phase 0', () => {
    expect(handlers).toHaveLength(1);
  });
});

describe('an endpoint nobody mocked', () => {
  it('is stopped by MSW, not passed through to the network', async () => {
    const failure = await fetch('http://localhost:4000/not-mocked').then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(TypeError);
    // The cause must be MSW's own refusal. A refused connection would also reject fetch, and
    // would hide a broken setup.
    expect(String((failure as Error).cause)).toContain('[MSW]');
  });
});
