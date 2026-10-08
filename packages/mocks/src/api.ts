import type { HealthResponse } from '@quibo/contracts';

/**
 * What an app asks of the API. It is the same whether the answer comes from here (UI phases) or
 * from the real API (live phases), so going live is a swap of where the call goes.
 */
export interface MockRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** The path, with an optional query string: "/health" or "/stores?town=1". */
  path: string;
  body?: unknown;
}

export interface MockResponse<Body = unknown> {
  status: number;
  body: Body;
}

/**
 * Thrown for any request nobody mocked. A screen must never quietly depend on an endpoint that
 * does not exist, so an unmocked call fails loudly.
 */
export class UnmockedRequestError extends Error {
  constructor(request: Pick<MockRequest, 'method' | 'path'>) {
    super(
      `No mock for ${request.method} ${request.path}. Add the route in packages/mocks/src/api.ts.`,
    );
    this.name = 'UnmockedRequestError';
  }
}

type Route = (request: MockRequest) => MockResponse;

// Every route builds its body from a type in @quibo/contracts, so a mock cannot drift from the contract.
const routes: Readonly<Record<string, Route>> = {
  'GET /health': () => {
    const body = { status: 'ok' } satisfies HealthResponse;
    return { status: 200, body };
  },
};

/** The routes that are mocked, written as "METHOD /path". */
export const mockRoutes: readonly string[] = Object.keys(routes);

/** Answer one request, or throw UnmockedRequestError. */
export function handleMockRequest(request: MockRequest): MockResponse {
  const path = request.path.split('?')[0] ?? request.path;
  const route = routes[`${request.method} ${path}`];
  if (route === undefined) throw new UnmockedRequestError(request);
  return route(request);
}
