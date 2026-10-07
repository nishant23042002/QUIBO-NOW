import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Browser request interception through a service worker. Import from `@quibo/mocks/browser`.
 * Starting it needs `mockServiceWorker.js` in the app's public folder, which Phase 1 adds.
 */
export const worker = setupWorker(...handlers);
