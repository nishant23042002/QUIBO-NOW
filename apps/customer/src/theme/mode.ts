import type { Scheme } from './palette';

/** What the person chose. "system" means follow the phone until they tap the toggle. */
export type Mode = 'system' | 'light' | 'dark';

/** Which theme to draw. An explicit choice wins; otherwise the phone's setting, and light if unknown. */
export function resolveScheme(mode: Mode, system: string | null | undefined): Scheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}

/** A stored value back into a Mode. Anything unexpected, or nothing, means "system". */
export function parseMode(stored: string | null | undefined): Mode {
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** What the toggle button switches to: the opposite of the theme being shown. */
export function toggledMode(current: Scheme): Exclude<Mode, 'system'> {
  return current === 'dark' ? 'light' : 'dark';
}
