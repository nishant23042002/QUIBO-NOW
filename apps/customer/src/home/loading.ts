import type { LoadPolicy } from '@/ui';

/**
 * How long a page's pretend load takes while the app runs on mock data (it stands in for asking the server), and what a bad
 * connection does to it.
 */

/** The cart lives on the phone, so with no network it still shows (with its notice); a failed load does not. */
export const CART_LOAD_MS = 500;
export const CART_POLICY: LoadPolicy = { offline: 'allow', failure: 'block' };

/** The cart's steps need the server (which delivery windows are full, which coupons are on offer), so they need a network. */
export const STEP_LOAD_MS = 450;
export const STEP_POLICY: LoadPolicy = { offline: 'block', failure: 'block' };

/**
 * The settings are on the phone and cannot fail. They must stay reachable offline: the switch that brings the network back
 * is on this screen.
 */
export const SETTINGS_LOAD_MS = 350;
export const SETTINGS_POLICY: LoadPolicy = { offline: 'allow', failure: 'ignore' };
