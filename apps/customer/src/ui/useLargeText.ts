import { useWindowDimensions } from 'react-native';

/** The phone's text size, as a multiple of normal, from which names and addresses are given more lines instead of being cut off. */
const LARGE_FROM = 1.3;

/**
 * Whether the phone's text size is set well above normal. Text always grows with it (up to twice as big); this is for the few
 * places that cut a long name or address short with "…" at normal size, which should wrap instead when text is large.
 */
export function useLargeText(): boolean {
  return useWindowDimensions().fontScale >= LARGE_FROM;
}
