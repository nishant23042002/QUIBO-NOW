import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReduceMotion } from './useReduceMotion';

export interface ShineSweepProps {
  /** How wide the thing it sweeps across is. Nothing is drawn until that is known. */
  width: number;
  /** The band of light's colour: a light one on a dark button, and the other way round. */
  color: string;
  /** It only moves while this is true, for example while the screen is in front and the button can be pressed. */
  active: boolean;
  /** Sweeps again and again, resting this many milliseconds between. Leave out to sweep only when `trigger` changes. */
  loopPauseMs?: number;
  /** When this changes, it sweeps once. */
  trigger?: string | number;
  /** In `trigger` mode, also sweeps once shortly after it first appears. */
  onAppear?: boolean;
  /** How strong the band is, from 0 to 1. */
  intensity?: number;
}

const SWEEP_MS = 850;
const FIRST_DELAY_MS = 700;

const styles = StyleSheet.create({
  // Taller than what it crosses, and turned a little, so the band is a slant and never shows a top or bottom edge.
  band: { position: 'absolute', top: -24, bottom: -24, left: 0, flexDirection: 'row' },
});

/**
 * A slanted band of light that crosses whatever it is placed over, which must clip it (`overflow: 'hidden'` with its own
 * rounded corners). It is how the app says "this is the thing to press" or "this just changed", on the phone's animation
 * thread and only for as long as it is `active`. With "reduce motion" on it does not move at all.
 */
export function ShineSweep({
  width,
  color,
  active,
  loopPauseMs,
  trigger,
  onAppear = false,
  intensity = 1,
}: ShineSweepProps) {
  const reduceMotion = useReduceMotion();
  const [sweep] = useState(() => new Animated.Value(0));
  const last = useRef(trigger);
  const appeared = useRef(false);
  const looping = loopPauseMs !== undefined;
  const ready = active && !reduceMotion && width > 0;

  // Looping: cross, rest, again.
  useEffect(() => {
    if (!looping || !ready) return undefined;
    sweep.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(FIRST_DELAY_MS),
        Animated.timing(sweep, {
          toValue: 1,
          duration: SWEEP_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(loopPauseMs),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [looping, ready, loopPauseMs, sweep]);

  // Once, when the trigger changes (and, if asked, when it first appears).
  useEffect(() => {
    if (looping || !ready) return undefined;
    const changed = last.current !== trigger;
    last.current = trigger;
    const first = !appeared.current;
    appeared.current = true;
    if (!changed && !(first && onAppear)) return undefined;
    sweep.setValue(0);
    const once = Animated.sequence([
      Animated.delay(first ? FIRST_DELAY_MS : 0),
      Animated.timing(sweep, {
        toValue: 1,
        duration: SWEEP_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    once.start();
    return () => {
      once.stop();
    };
  }, [looping, ready, trigger, onAppear, sweep]);

  if (!ready) return null;

  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      style={[
        styles.band,
        {
          opacity: sweep.interpolate({ inputRange: [0, 0.08, 0.92, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            {
              translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-50, width + 30] }),
            },
            { rotate: '18deg' },
          ],
        },
      ]}
    >
      <View style={{ width: 8, backgroundColor: color, opacity: 0.3 * intensity }} />
      <View style={{ width: 14, backgroundColor: color, opacity: 0.95 * intensity }} />
      <View style={{ width: 8, backgroundColor: color, opacity: 0.3 * intensity }} />
    </Animated.View>
  );
}
