import { Animated, Easing } from 'react-native';
import { INITIAL_TRACK, trackScroll, type ScrollTrack } from './logic/chromeScroll';

/**
 * The bottom bar's coming and going, as one number every part of the screen can follow: 0 with the bar in place, 1 with it out of
 * the way. The bar slides down by it, the cart bar sinks and turns into a small pill by it, and nothing is laid out while it moves:
 * it runs on the phone's animation thread. It is one shared value because there is one bar for the whole app.
 */
const progress = new Animated.Value(0);
let track: ScrollTrack = INITIAL_TRACK;
let running: Animated.CompositeAnimation | null = null;

const HIDE_MS = 280;
const SHOW_MS = 260;
/** The standard "ease in and out" curve: a soft start and a long, gentle landing, so nothing seems to snap. */
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

function moveTo(hidden: boolean): void {
  running?.stop();
  running = Animated.timing(progress, {
    toValue: hidden ? 1 : 0,
    duration: hidden ? HIDE_MS : SHOW_MS,
    easing: EASE,
    useNativeDriver: true,
  });
  running.start();
}

/** A screen tells the app how far it has scrolled. The bar hides and shows from what these say. */
export function reportChromeScroll(offset: number): void {
  const next = trackScroll(track, offset);
  const changed = next.hidden !== track.hidden;
  track = next;
  if (changed) moveTo(next.hidden);
}

/** Brings the bar back and forgets how far anything had scrolled, for a new screen. */
export function showChrome(): void {
  const wasHidden = track.hidden;
  track = INITIAL_TRACK;
  if (wasHidden) moveTo(false);
}

/** 0 with the bottom bar in place, 1 with it hidden. */
export function useChromeProgress(): Animated.Value {
  return progress;
}
