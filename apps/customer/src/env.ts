import { loadEnv, publicEnvSchema } from '@quibo/config';

// Next.js only inlines NEXT_PUBLIC_* when it sees the full `process.env.NAME` expression, so
// each variable is read by name here instead of passing the whole of process.env.
// Imported by the root layout, so an invalid value fails `next build` instead of production.
export const env = loadEnv(publicEnvSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
