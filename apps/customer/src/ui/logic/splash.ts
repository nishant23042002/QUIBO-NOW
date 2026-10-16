/** How long the splash stays at least, so the logo is seen and the app never flashes past it. */
const SPLASH_MIN_MS = 1200;
/** With "reduce motion" on there is nothing to watch, so the splash only covers the loading. */
const SPLASH_MIN_REDUCED_MS = 300;
/**
 * How long the app must have been ready before the splash leaves: the first screen shows its loading skeleton for a moment (see
 * `TAB_LOAD_MS`) and the splash should fade onto the finished page, never onto the skeleton.
 */
export const SPLASH_SETTLE_MS = 450;
/** The fade from the splash into the app. */
export const SPLASH_FADE_MS = 350;

export function splashMinimumMs(reduceMotion: boolean): number {
  return reduceMotion ? SPLASH_MIN_REDUCED_MS : SPLASH_MIN_MS;
}

/**
 * The splash stays "holding" until the app is ready, its minimum time is up and the app has had time to draw its first screen, then it
 * fades away.
 */
export function splashPhase(state: {
  appReady: boolean;
  minimumElapsed: boolean;
  settled: boolean;
}) {
  return state.appReady && state.minimumElapsed && state.settled ? 'leaving' : 'holding';
}
