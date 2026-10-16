import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { jumpVisible, scrolledPast } from './logic/jumpToTop';
import { useChromeScroll } from './useChromeScroll';
import { useReduceMotion } from './useReduceMotion';

/**
 * Everything a long page needs for its "Back to top" pill: a ref and scroll handler to spread on the vertical scroll view (the
 * handler also keeps telling the bottom bar how far the page has scrolled, as `useChromeScroll` does), whether the pill shows, and
 * a way to glide back to the top (straight there when the phone asks for reduced motion).
 */
export function useJumpToTop() {
  const chromeScroll = useChromeScroll();
  const reduceMotion = useReduceMotion();
  const ref = useRef<ScrollView>(null);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      chromeScroll.onScroll(event);
      const offset = event.nativeEvent.contentOffset.y;
      setScrolled((was) => scrolledPast(offset, was));
      setVisible((was) => {
        const next = jumpVisible(offset, was);
        return next === was ? was : next;
      });
    },
    [chromeScroll],
  );

  const toTop = useCallback(() => {
    ref.current?.scrollTo({ y: 0, animated: !reduceMotion });
  }, [reduceMotion]);

  return {
    ref,
    visible,
    /** The page has moved a little: a header may bring its picture in. */
    scrolled,
    toTop,
    scrollProps: { ref, scrollEventThrottle: chromeScroll.scrollEventThrottle, onScroll },
  };
}
