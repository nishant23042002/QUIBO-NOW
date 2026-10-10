/** How long the splash stays at least, so the logo is seen and the app never flashes past it. */
const SPLASH_MIN_MS = 1200;
/** With "reduce motion" on there is nothing to watch, so the splash only covers the loading. */
const SPLASH_MIN_REDUCED_MS = 300;
/** The fade from the splash into the app. */
export const SPLASH_FADE_MS = 350;

export function splashMinimumMs(reduceMotion: boolean): number {
  return reduceMotion ? SPLASH_MIN_REDUCED_MS : SPLASH_MIN_MS;
}

/** The splash stays "holding" until the app is ready and its minimum time is up, then it fades away. */
export function splashPhase(state: { appReady: boolean; minimumElapsed: boolean }) {
  return state.appReady && state.minimumElapsed ? 'leaving' : 'holding';
}
