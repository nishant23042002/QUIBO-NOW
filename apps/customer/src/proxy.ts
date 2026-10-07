import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 calls this file proxy.ts (it was middleware.ts before).
export default createMiddleware(routing);

export const config = {
  // Everything except api routes, Next.js internals, and any path with a file extension
  // (manifest.webmanifest, /pwa-icons/192.png, favicon.ico), which must not get a locale prefix.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
