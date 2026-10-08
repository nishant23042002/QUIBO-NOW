import { createContext, useContext } from 'react';
import type { Animated } from 'react-native';

/**
 * What the home page tells the things inside it about its scrolling, so a row's title can stick under the
 * tabs while its row scrolls past.
 */
export interface HomeScrollValue {
  /**
   * How far the page has scrolled, never below 0, less how far the open shops row has pushed it down, so a
   * row's title sticks in the right place with the row open or shut. Moves on the phone's animation thread.
   */
  scroll: Pick<Animated.AnimatedInterpolation<number>, 'interpolate'>;
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
