import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Node request interception, for unit and integration tests. Import from `@quibo/mocks/node`. */
export const server = setupServer(...handlers);
