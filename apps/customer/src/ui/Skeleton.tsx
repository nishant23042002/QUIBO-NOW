import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { radius } from './tokens';
import { useReduceMotion } from './useReduceMotion';

const PulseContext = createContext<Animated.Value | null>(null);

const PULSE_LOW = 0.45;
const PULSE_MS = 750;

export interface SkeletonScopeProps {
  /** What a screen reader says for the whole group, for example "Loading". Pass a translated string. */
  label: string;
  /** For a skeleton that fills its page and pins something to the bottom, such as the checkout bar: `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Wraps a group of skeleton blocks. They breathe together on one shared animation (a slow fade, which is
 * cheap on a low-end phone), the group is announced once as "loading", and with "reduce motion" on they
 * stay still.
 */
export function SkeletonScope({ label, style, children }: SkeletonScopeProps) {
  const reduceMotion = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: PULSE_LOW,
          duration: PULSE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [reduceMotion, pulse]);

  return (
    <PulseContext value={pulse}>
      <View accessible aria-busy aria-label={label} style={style}>
        {children}
      </View>
    </PulseContext>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({ block: { backgroundColor: c.line } });

export interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  /** Corner radius; defaults to a small rounding. */
  rounded?: number;
}

/** A grey block standing in for something that is still loading. Put it inside a `SkeletonScope`. */
export function Skeleton({ width = '100%', height, rounded = radius.sm }: SkeletonProps) {
  const styles = useStyles(makeStyles);
  const pulse = useContext(PulseContext);

  return (
    <Animated.View
      aria-hidden
      style={[styles.block, { width, height, borderRadius: rounded, opacity: pulse ?? 1 }]}
    />
  );
}
