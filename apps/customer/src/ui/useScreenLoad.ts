import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { loadOutcome, useOnline } from '@/network';
import {
  asksNetwork,
  phaseAfter,
  settle,
  type LoadPhase,
  type LoadPolicy,
} from './logic/screenLoad';
import { useReduceMotion } from './useReduceMotion';

/** How long the skeleton takes to give way to the page. */
const FADE_MS = 200;

export interface ScreenLoadOptions {
  /** How long the pretend load takes while the app runs on mock data. */
  loadMs: number;
  /** What a bad connection does to this page. Pass a constant. */
  policy: LoadPolicy;
  /** Keep the skeleton up while something the page needs (such as the saved cart) has not been read yet. */
  hold?: boolean;
  /**
   * Asked each time the screen comes to the front. When it says yes, and the page has loaded before, the page stays as it
   * is instead of showing its skeleton again (a return from a step opened from it). Pass a constant function.
   */
  quietReturn?: () => boolean;
  /**
   * For a screen whose data is on the phone and that is built early, while another screen is in front: it is ready at once, with no
   * pretend wait, because nobody is looking at it. The first time it comes to the front it then shows straight away. Does nothing
   * for a screen built as it opens.
   */
  backgroundReady?: boolean;
}

export interface ScreenLoad {
  phase: LoadPhase;
  /** The page is ready to be shown and used. */
  loaded: boolean;
  /** There is nothing to show but a message: no network where it is needed, or a failed load. */
  blocked: boolean;
  /** 0 while the skeleton shows, 1 once the page has faded in over it. */
  reveal: Animated.Value;
  /** The skeleton is still on screen (it stays until the fade is done). */
  skeletonOn: boolean;
  /** Load again from the start. */
  retry: () => void;
}

/**
 * Loads a screen each time it opens: first the skeleton, then, after a short pause that stands in for the server, the page
 * fading in over it; or a message when there is no network where it is needed, or the load failed, with a way to try again.
 * It loads by itself once the network is back. With "reduce motion" the page simply appears.
 */
export function useScreenLoad({
  loadMs,
  policy,
  hold = false,
  quietReturn,
  backgroundReady = false,
}: ScreenLoadOptions): ScreenLoad {
  const online = useOnline();
  const reduceMotion = useReduceMotion();
  const navigation = useNavigation();
  const [readyAtStart] = useState(() => backgroundReady && !hold && !navigation.isFocused());
  const [phase, setPhase] = useState<LoadPhase>(() => (readyAtStart ? 'ready' : 'loading'));
  const [attempt, setAttempt] = useState(0);
  const [reveal] = useState(() => new Animated.Value(readyAtStart ? 1 : 0));
  const [skeletonOn, setSkeletonOn] = useState(!readyAtStart);
  const everLoaded = useRef(readyAtStart);
  const seenBefore = useRef(false);

  const restart = useCallback(() => {
    reveal.setValue(0);
    setSkeletonOn(true);
    setPhase('loading');
    setAttempt((count) => count + 1);
  }, [reveal]);

  // The first time the screen is in front, the load that began with it is the one. After that, each time it comes back to
  // the front it loads again, unless it is a quiet return.
  useFocusEffect(
    useCallback(() => {
      const quiet = quietReturn?.() ?? false;
      if (seenBefore.current && !(quiet && everLoaded.current)) restart();
      seenBefore.current = true;
      return undefined;
    }, [quietReturn, restart]),
  );

  useEffect(() => {
    // Ready from the start, built in the background: there is nothing to wait for until it is loaded again.
    if (readyAtStart && attempt === 0) return undefined;
    const timer = setTimeout(() => {
      const result = asksNetwork(policy) ? loadOutcome() : 'ok';
      setPhase((current) => settle(current, phaseAfter(result, policy)));
    }, loadMs);
    return () => {
      clearTimeout(timer);
    };
  }, [attempt, online, loadMs, policy, readyAtStart]);

  const loaded = phase === 'ready' && !hold;

  // The page is drawn under the skeleton from the first frame, so it is ready when it fades in, and the swap is a
  // cross-fade instead of one frame where the skeleton vanishes and the page pops in.
  useEffect(() => {
    if (!loaded) return undefined;
    everLoaded.current = true;
    const fade = Animated.timing(reveal, {
      toValue: 1,
      duration: reduceMotion ? 0 : FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    fade.start(({ finished }) => {
      if (finished) setSkeletonOn(false);
    });
    return () => {
      fade.stop();
    };
  }, [loaded, reduceMotion, reveal]);

  return {
    phase,
    loaded,
    blocked: phase === 'offline' || phase === 'failed',
    reveal,
    skeletonOn,
    retry: restart,
  };
}
