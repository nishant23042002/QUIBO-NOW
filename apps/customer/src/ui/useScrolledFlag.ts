import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { scrolledPast } from './logic/jumpToTop';

/**
 * Whether a page has been scrolled a little, for a screen whose scroll view is not wired through `useJumpToTop`. Spread
 * `scrollEventThrottle={16}` and `onScroll` on the scroll view and read `scrolled` (a header brings its picture in from it).
 */
export function useScrolledFlag() {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrolled((was) => scrolledPast(offset, was));
  }, []);
  return { scrolled, onScroll };
}
