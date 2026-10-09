import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { alignSelf: 'flex-start' },
    flash: {
      position: 'absolute',
      top: -space[1],
      bottom: -space[1],
      left: -space[2],
      right: -space[2],
      borderRadius: radius.sm,
      backgroundColor: c.accent,
    },
  });

/**
 * Wraps a value, such as a price. Each time `value` changes (but not when it first appears) it gives a quick pop, so the
 * eye is drawn to the number that just moved. With "reduce motion" on it does nothing.
 */
export function PopOnChange({ value, children }: { value: string | number; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const last = useRef(value);

  useEffect(() => {
    if (last.current === value) return undefined;
    last.current = value;
    if (reduceMotion) return undefined;
    scale.setValue(1.14);
    const settle = Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    });
    settle.start();
    return () => {
      settle.stop();
    };
  }, [value, reduceMotion, scale]);

  return (
    <Animated.View
      style={[styles.wrap, { transform: [{ scale }], transformOrigin: 'left center' }]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Wraps a value, such as a charge in the bill. Each time `value` changes (but not when it first appears) a soft pistachio
 * highlight shows behind it and fades, so a shopper who changed something sees exactly which numbers it moved. With
 * "reduce motion" on it does nothing.
 */
export function FlashOnChange({
  value,
  children,
}: {
  value: string | number;
  children: ReactNode;
}) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [glow] = useState(() => new Animated.Value(0));
  const last = useRef(value);

  useEffect(() => {
    if (last.current === value) return undefined;
    last.current = value;
    if (reduceMotion) return undefined;
    glow.setValue(0.55);
    const fade = Animated.timing(glow, {
      toValue: 0,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    fade.start();
    return () => {
      fade.stop();
    };
  }, [value, reduceMotion, glow]);

  return (
    <View>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: glow }]} aria-hidden />
      {children}
    </View>
  );
}
