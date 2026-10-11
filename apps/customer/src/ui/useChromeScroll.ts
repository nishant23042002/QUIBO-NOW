import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { reportChromeScroll } from './chrome';

/**
 * A way to tell the bottom bar how far this screen has scrolled, that only counts while the screen is the one in front.
 * The tab screens stay mounted once they are left, and a page that was still gliding when its tab was left would otherwise
 * keep reporting and hide the bar on the screen the shopper has just opened.
 */
export function useChromeReport(): (offset: number) => void {
  const inFront = useRef(true);

  useFocusEffect(
    useCallback(() => {
      inFront.current = true;
      return () => {
        inFront.current = false;
      };
    }, []),
  );

  return useCallback((offset: number) => {
    if (inFront.current) reportChromeScroll(offset);
  }, []);
}

/** Spread on a vertical scroll view whose scrolling should hide the bar. */
export function useChromeScroll() {
  const report = useChromeReport();
  return useMemo(
    () => ({
      scrollEventThrottle: 16,
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        report(event.nativeEvent.contentOffset.y);
      },
    }),
    [report],
  );
}
