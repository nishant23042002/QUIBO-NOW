import { HealthResponseSchema } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { handleMockRequest, mockRoutes, UnmockedRequestError } from './api';

describe('GET /health', () => {
  it('answers with a body that satisfies the HealthResponse contract', () => {
    const response = handleMockRequest({ method: 'GET', path: '/health' });
    expect(response.status).toBe(200);
    expect(HealthResponseSchema.parse(response.body)).toEqual({ status: 'ok' });
  });

  it('ignores a query string', () => {
    const response = handleMockRequest({ method: 'GET', path: '/health?verbose=1' });
    expect(response.status).toBe(200);
  });

  it('is the only route in Phase 0b', () => {
    expect(mockRoutes).toEqual(['GET /health']);
  });
});

describe('a request nobody mocked', () => {
  it('throws instead of answering, and says what to add', () => {
    expect(() => handleMockRequest({ method: 'GET', path: '/not-mocked' })).toThrow(
      UnmockedRequestError,
    );
    expect(() => handleMockRequest({ method: 'GET', path: '/not-mocked' })).toThrow(
      /GET \/not-mocked.*packages\/mocks\/src\/api\.ts/,
    );
  });

  it('counts the method as part of the route', () => {
    expect(() => handleMockRequest({ method: 'POST', path: '/health' })).toThrow(
      UnmockedRequestError,
    );
  });

  it('does not match a longer path that merely starts like a mocked one', () => {
    expect(() => handleMockRequest({ method: 'GET', path: '/health/deep' })).toThrow(
      UnmockedRequestError,
    );
  });
});
