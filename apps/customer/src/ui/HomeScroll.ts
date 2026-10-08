import { createContext, useContext } from 'react';
import type { Animated } from 'react-native';

/**
 * What the home page tells the things inside it about its scrolling, so a row's title can stick under the
 * tabs while its row scrolls past.
 */
export interface HomeScrollValue {
  /** How far the page has scrolled, never below 0. Moves on the phone's animation thread. */
  scroll: Animated.AnimatedInterpolation<number>;
  /** Where the page's own content begins, measured from the top of what scrolls. */
  childrenTop: number;
  /** The height at which a sticky title stops: just under the tabs, once they have risen to the top. */
  pin: number;
}

export const HomeScrollContext = createContext<HomeScrollValue | null>(null);

/** The page's scroll position, or null when the component is not inside the home page. */
export function useHomeScroll(): HomeScrollValue | null {
  return useContext(HomeScrollContext);
}
