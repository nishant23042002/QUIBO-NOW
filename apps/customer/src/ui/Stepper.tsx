import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { COUNT_RULE, formatQuantity, stepQuantity, type QuantityRule } from './logic/quantity';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** A stepper's text grows with the phone's text size only this far: it is a control, and the item beside it needs room too. */
const CONTROL_SCALE_MAX = 1.3;

export interface StepperProps {
  /** How much is in the cart. 0 shows the ADD button. */
  value: number;
  onChange: (next: number) => void;
  /** COUNT_RULE for items sold by the piece, WEIGHT_RULE for loose items sold by weight. */
  rule?: QuantityRule;
  /** The text on the ADD button. Pass a translated string. */
  addLabel: string;
  /** What a screen reader says for ADD when it should name the item, for example "Add Toned milk". Defaults to `addLabel`. */
  addAriaLabel?: string;
  /** Names of the two buttons for screen readers. */
  decreaseLabel: string;
  increaseLabel: string;
  /** Name of the plus button once the limit in the rule is reached, for example "No more available". */
  maxLabel?: string;
  /**
   * A few words shown above the control, with a small shake, when + is pressed at the limit, for example "Limit reached". Give it
   * where a shopper would otherwise wonder why + does nothing. Without it, + is simply dimmed and cannot be pressed at the limit.
   */
  maxNotice?: string;
  /** Written after the number for a weight, for example "kg". */
  unitLabel?: string;
  /** A smaller control for a compact card: 28 dp tall with 14 text, and slop around it that still makes a 48 dp touch target. */
  compact?: boolean;
  /**
   * A large, solid form for the one control a page is built around (the product page): 48 dp tall, filled, with 18 text, so it is plain
   * what to press and the press is plainly seen.
   */
  large?: boolean;
  /** ADD is filled with the accent colour (pistachio) and not outlined. Once the item is in the cart the stepper looks as usual. */
  accent?: boolean;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    add: {
      minHeight: 32,
      paddingHorizontal: space[4],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: radius.md,
      borderColor: c.action,
      backgroundColor: c.surface,
    },
    stepper: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      backgroundColor: c.action,
    },
    // 32 wide with 8 of reach on each side makes the 48 dp a thumb needs.
    side: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    value: { minWidth: 22, alignItems: 'center' },
    addCompact: {
      minHeight: 28,
      paddingHorizontal: space[3],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.action,
      backgroundColor: c.surface,
    },
    stepperCompact: {
      minHeight: 28,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      backgroundColor: c.action,
    },
    addLarge: {
      minHeight: 48,
      minWidth: 128,
      paddingHorizontal: space[5],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: radius.md,
      borderColor: c.action,
      backgroundColor: c.action,
    },
    stepperLarge: {
      minHeight: 48,
      minWidth: 128,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radius.md,
      backgroundColor: c.action,
    },
    sideLarge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    valueLarge: { minWidth: 32, alignItems: 'center' },
    pressedAddLarge: { transform: [{ scale: 0.96 }], opacity: 0.85 },
    addAccent: { borderColor: c.accent, backgroundColor: c.accent },
    sideCompact: { width: 26, height: 28, alignItems: 'center', justifyContent: 'center' },
    valueCompact: { minWidth: 18, alignItems: 'center' },
    // The press is seen the moment the finger lands: ADD dips and takes the lilac, and a - or + dips and dims, so the control
    // plainly answers before the cart has done anything.
    pressedAdd: { transform: [{ scale: 0.92 }], backgroundColor: c.lilac },
    pressedSide: { transform: [{ scale: 0.82 }], opacity: 0.6 },
    atMax: { opacity: 0.35 },
    // The few words that rise above the control when + is pressed at the limit.
    notice: {
      position: 'absolute',
      right: 0,
      bottom: '100%',
      marginBottom: space[1] + 2,
      paddingHorizontal: space[2],
      paddingVertical: space[1],
      borderRadius: radius.sm,
      backgroundColor: c.chrome,
    },
    // The ring that goes out from the control the instant it is pressed. It is only an outline over the control, so it costs nothing
    // to lay out, and it moves by transform and opacity on the animation thread.
    ripple: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 2,
      borderRadius: radius.md,
      borderColor: c.action,
    },
  });

/** ADD that turns into a - and + stepper once the item is in the cart. Every target has a 48 dp touch area. */
export function Stepper({
  value,
  onChange,
  rule = COUNT_RULE,
  addLabel,
  addAriaLabel,
  decreaseLabel,
  increaseLabel,
  maxLabel,
  maxNotice,
  unitLabel,
  compact = false,
  large = false,
  accent = false,
}: StepperProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [bounce] = useState(() => new Animated.Value(1));
  const [ripple] = useState(() => new Animated.Value(1));
  // The limit reached: the notice (0 hidden, 1 shown) and the small shake of the control (0 to 1 across its length).
  const [notice] = useState(() => new Animated.Value(0));
  const [shake] = useState(() => new Animated.Value(0));
  const before = useRef(value);

  // The press shows at the first instant, before the cart has done anything: a ring goes out from the control and fades. It runs
  // from the press's start, on the animation thread, and does nothing at all with "reduce motion" on.
  const press = () => {
    if (reduceMotion) return;
    ripple.setValue(0);
    Animated.timing(ripple, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  // + was pressed with nothing more to add: say so, once, and let go of it again. Transform and opacity only.
  const limitHit = () => {
    if (reduceMotion) {
      notice.setValue(1);
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(notice, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]).start();
      return;
    }
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    Animated.sequence([
      Animated.timing(notice, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(notice, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  const noticeView =
    maxNotice === undefined ? null : (
      <Animated.View
        pointerEvents="none"
        aria-hidden
        style={[
          styles.notice,
          {
            opacity: notice,
            transform: [
              { translateY: notice.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) },
            ],
          },
        ]}
      >
        <Text variant="caption" color="onChrome" numberOfLines={1}>
          {maxNotice}
        </Text>
      </Animated.View>
    );
  const shakeX = shake.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [0, -4, 4, -3, 2, 0],
  });
  const ring = (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      style={[
        styles.ripple,
        {
          opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
        },
      ]}
    />
  );

  // A quick bounce each time the count changes, including when ADD turns into the stepper.
  useEffect(() => {
    if (before.current === value) return;
    before.current = value;
    if (reduceMotion) return;
    bounce.setValue(0.86);
    Animated.spring(bounce, {
      toValue: 1,
      friction: 5,
      tension: 320,
      useNativeDriver: true,
    }).start();
  }, [value, reduceMotion, bounce]);

  // Extra reach on each side of a control: 8 on a full one (32 tall), 10 on a compact one (28 tall), to make 48 dp.
  const slop = large ? 0 : compact ? 10 : 8;
  const reach = { top: slop, bottom: slop, left: slop, right: slop };

  if (value === 0) {
    return (
      <Animated.View style={{ transform: [{ scale: bounce }] }}>
        {ring}
        <Pressable
          role="button"
          aria-label={addAriaLabel ?? addLabel}
          hitSlop={reach}
          onPressIn={press}
          onPress={() => {
            onChange(stepQuantity(0, 1, rule));
          }}
          style={({ pressed }) => [
            large ? styles.addLarge : compact ? styles.addCompact : styles.add,
            accent && !large && styles.addAccent,
            pressed && (large ? styles.pressedAddLarge : styles.pressedAdd),
          ]}
        >
          <Text
            variant={large ? 'label' : compact ? 'caption' : 'strong'}
            color={large ? 'onAction' : accent ? 'onAccent' : 'action'}
            maxFontSizeMultiplier={CONTROL_SCALE_MAX}
          >
            {addLabel}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  const atMax = value >= rule.max;
  const shown =
    unitLabel === undefined ? formatQuantity(value) : `${formatQuantity(value)} ${unitLabel}`;

  return (
    <Animated.View
      style={[
        large ? styles.stepperLarge : compact ? styles.stepperCompact : styles.stepper,
        { transform: [{ translateX: shakeX }, { scale: bounce }] },
      ]}
    >
      {ring}
      {noticeView}
      <Pressable
        role="button"
        aria-label={decreaseLabel}
        hitSlop={reach}
        onPressIn={press}
        onPress={() => {
          onChange(stepQuantity(value, -1, rule));
        }}
        style={({ pressed }) => [
          large ? styles.sideLarge : compact ? styles.sideCompact : styles.side,
          pressed && styles.pressedSide,
        ]}
      >
        <Icon name="minus" color={colors.onAction} size={large ? 18 : compact ? 12 : 14} />
      </Pressable>
      <View
        style={large ? styles.valueLarge : compact ? styles.valueCompact : styles.value}
        aria-live="polite"
      >
        <Text
          variant={large ? 'label' : compact ? 'caption' : 'strong'}
          color="onAction"
          maxFontSizeMultiplier={CONTROL_SCALE_MAX}
        >
          {shown}
        </Text>
      </View>
      <Pressable
        role="button"
        aria-label={atMax ? (maxLabel ?? increaseLabel) : increaseLabel}
        aria-disabled={atMax}
        disabled={atMax && maxNotice === undefined}
        hitSlop={reach}
        onPressIn={atMax ? undefined : press}
        onPress={() => {
          if (atMax) limitHit();
          else onChange(stepQuantity(value, 1, rule));
        }}
        style={({ pressed }) => [
          large ? styles.sideLarge : compact ? styles.sideCompact : styles.side,
          atMax && styles.atMax,
          pressed && styles.pressedSide,
        ]}
      >
        <Icon name="plus" color={colors.onAction} size={large ? 18 : compact ? 12 : 14} />
      </Pressable>
    </Animated.View>
  );
}
