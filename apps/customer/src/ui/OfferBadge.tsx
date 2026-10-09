import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { radius } from './tokens';
import { useReduceMotion } from './useReduceMotion';
import { useScreenFocused } from './useScreenFocused';

export interface OfferBadgeProps {
  /**
   * idle: nothing to save right now, so the badge sits still. offer: a coupon would save money, so the badge asks for a
   * look. applied: a coupon is in use, so the badge turns pistachio with a check.
   */
  state: 'idle' | 'offer' | 'applied';
  /** The thing it sits in is being pressed: the badge squeezes in with it. */
  pressed?: boolean;
  size?: number;
}

/** One round of the attention loop lasts this long, whatever happens inside it, so its parts stay in step. */
const ROUND_MS = 2400;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    box: { alignItems: 'center', justifyContent: 'center' },
    // The ring that opens out from the badge and fades.
    ring: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: 2,
      borderColor: c.accentEdge,
    },
    tile: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    idle: { backgroundColor: c.surface, borderColor: c.line },
    offer: { backgroundColor: c.accentSubtle, borderColor: c.accentEdge },
    applied: { backgroundColor: c.accent, borderColor: c.accentEdge },
    // The little star that blinks on the badge's corner.
    spark: { position: 'absolute', top: -5, right: -5 },
  });

/**
 * The picture for coupons on the cart: a price tag in a rounded tile. While a coupon would save money it keeps asking
 * for a look, gently: a ring opens out and fades, the tag gives a quick wiggle, and a small star blinks on its corner,
 * then everything rests until the next round. Pressing the row it sits in squeezes it. When a coupon is applied the tile
 * turns pistachio, the tag becomes a check, and it pops once. Everything runs on the phone's animation thread, and with
 * "reduce motion" on it stays still.
 */
export function OfferBadge({ state, pressed = false, size = 40 }: OfferBadgeProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const focused = useScreenFocused();
  const [ring] = useState(() => new Animated.Value(0));
  const [wiggle] = useState(() => new Animated.Value(0));
  const [blink] = useState(() => new Animated.Value(0));
  const [squeeze] = useState(() => new Animated.Value(1));
  const [pop] = useState(() => new Animated.Value(1));
  const before = useRef(state);

  // The attention loop, only while there is something to save.
  useEffect(() => {
    if (state !== 'offer' || reduceMotion || !focused) {
      ring.setValue(0);
      wiggle.setValue(0);
      blink.setValue(0);
      return undefined;
    }
    const step = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(ROUND_MS - 1400),
        ]),
        Animated.sequence([
          Animated.delay(250),
          step(wiggle, 1, 110),
          step(wiggle, -1, 150),
          step(wiggle, 0.6, 120),
          step(wiggle, -0.6, 120),
          step(wiggle, 0, 100),
          Animated.delay(ROUND_MS - 250 - 600),
        ]),
        Animated.sequence([
          Animated.delay(700),
          step(blink, 1, 260),
          step(blink, 0, 260),
          Animated.delay(ROUND_MS - 700 - 520),
        ]),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [state, reduceMotion, focused, ring, wiggle, blink]);

  // Applying a coupon pops the badge once. Starting out applied (the cart was reopened) does not.
  useEffect(() => {
    const was = before.current;
    before.current = state;
    if (state !== 'applied' || was === 'applied' || reduceMotion) return undefined;
    pop.setValue(0.6);
    const spring = Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    });
    spring.start();
    return () => {
      spring.stop();
    };
  }, [state, reduceMotion, pop]);

  // The squeeze while the row is pressed, and the release back.
  useEffect(() => {
    if (reduceMotion) {
      squeeze.setValue(1);
      return undefined;
    }
    const spring = Animated.spring(squeeze, {
      toValue: pressed ? 0.88 : 1,
      friction: 5,
      tension: 220,
      useNativeDriver: true,
    });
    spring.start();
    return () => {
      spring.stop();
    };
  }, [pressed, reduceMotion, squeeze]);

  const corner = size <= 40 ? radius.md : radius.lg;

  return (
    <View style={[styles.box, { width: size, height: size }]} aria-hidden>
      {state === 'offer' ? (
        <Animated.View
          style={[
            styles.ring,
            {
              borderRadius: corner,
              opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
              transform: [
                { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
              ],
            },
          ]}
        />
      ) : null}
      <Animated.View
        style={[
          styles.tile,
          state === 'applied' ? styles.applied : state === 'offer' ? styles.offer : styles.idle,
          {
            width: size,
            height: size,
            borderRadius: corner,
            transform: [{ scale: squeeze }, { scale: pop }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: wiggle.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-16deg', '16deg'],
                }),
              },
            ],
          }}
        >
          {state === 'applied' ? (
            <Icon name="check" color={colors.onAccent} size={22} />
          ) : (
            <Icon name="tag" color={colors.accentInk} size={22} />
          )}
        </Animated.View>
      </Animated.View>
      {state === 'offer' ? (
        <Animated.View
          style={[
            styles.spark,
            {
              opacity: blink,
              transform: [
                { scale: blink.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            },
          ]}
        >
          <Icon name="sparkle" color={colors.accentEdge} size={14} />
        </Animated.View>
      ) : null}
    </View>
  );
}
