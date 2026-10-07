import type { HealthResponse } from '@quibo/contracts';
import { http, HttpResponse } from 'msw';

// `*/` matches any origin, so the same handlers work in the browser (relative URLs) and in
// Node tests (absolute URLs), and keep working when the API base URL becomes configurable.
const health = http.get('*/health', () => {
  const body: HealthResponse = { status: 'ok' };
  return HttpResponse.json(body);
});

/** Every mocked endpoint. Each response is built from a type in @quibo/contracts. */
export const handlers = [health];
