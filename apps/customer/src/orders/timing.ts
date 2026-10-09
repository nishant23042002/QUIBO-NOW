/**
 * How long the mock order steps take. With no server in Phase 1 these stand in for the network, so the buttons have something
 * real to show while they wait.
 */

/** Saving the order. */
export const PLACE_MS = 900;
/** The test UPI payment. */
export const PAY_MS = 1100;

/** The "Order placed" screen: long enough to read, then it fades onto the Orders tab. */
export const PLACED_MS = 1700;
/** With "reduce motion" on it only covers the change of screen. */
export const PLACED_REDUCED_MS = 600;
export const PLACED_FADE_MS = 400;
