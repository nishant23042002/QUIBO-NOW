/**
 * How long the mock sign-in takes at each step. With no server in Phase 1 these stand in for the network, so the buttons have
 * something real to show while they wait (a spinner, a changed label) instead of jumping straight on.
 */

/** Asking for a code. */
export const SEND_MS = 900;
/** Checking a code. */
export const CHECK_MS = 800;
/** The "Verified" button, held a moment so the success is seen before the screen changes. */
export const VERIFIED_MS = 650;

/** The welcome screen after signing in: long enough to read, and for Home to finish loading underneath it. */
export const WELCOME_MS = 1700;
/** With "reduce motion" on there is nothing to watch, so it only covers Home while it loads. */
export const WELCOME_REDUCED_MS = 500;
/** The fade from the welcome screen into Home. */
export const WELCOME_FADE_MS = 400;
