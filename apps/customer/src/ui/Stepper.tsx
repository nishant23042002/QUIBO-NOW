import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
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
  /** Written after the number for a weight, for example "kg". */
  unitLabel?: string;
  /** A smaller control for a compact card: 28 dp tall with 14 text, and slop around it that still makes a 48 dp touch target. */
  compact?: boolean;
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
    sideCompact: { width: 26, height: 28, alignItems: 'center', justifyContent: 'center' },
    valueCompact: { minWidth: 18, alignItems: 'center' },
    // The press is seen the moment the finger lands: ADD dips and takes the lilac, and a - or + dips and dims, so the control
    // plainly answers before the cart has done anything.
    pressedAdd: { transform: [{ scale: 0.92 }], backgroundColor: c.lilac },
    pressedSide: { transform: [{ scale: 0.82 }], opacity: 0.6 },
    atMax: { opacity: 0.35 },
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
  unitLabel,
  compact = false,
}: StepperProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [bounce] = useState(() => new Animated.Value(1));
  const before = useRef(value);

  // A quick bounce each time the count changes, including when ADD turns into the stepper.
  useEffect(() => {
    if (before.current === value) return;
    before.current = value;
    if (reduceMotion) return;
    bounce.setValue(0.82);
    Animated.spring(bounce, {
      toValue: 1,
      friction: 3.5,
      tension: 260,
      useNativeDriver: true,
    }).start();
  }, [value, reduceMotion, bounce]);

  // Extra reach on each side of a control: 8 on a full one (32 tall), 10 on a compact one (28 tall), to make 48 dp.
  const slop = compact ? 10 : 8;
  const reach = { top: slop, bottom: slop, left: slop, right: slop };

  if (value === 0) {
    return (
      <Animated.View style={{ transform: [{ scale: bounce }] }}>
        <Pressable
          role="button"
          aria-label={addAriaLabel ?? addLabel}
          hitSlop={reach}
          onPress={() => {
            onChange(stepQuantity(0, 1, rule));
          }}
          style={({ pressed }) => [
            compact ? styles.addCompact : styles.add,
            pressed && styles.pressedAdd,
          ]}
        >
          <Text
            variant={compact ? 'caption' : 'strong'}
            color="action"
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
      style={[compact ? styles.stepperCompact : styles.stepper, { transform: [{ scale: bounce }] }]}
    >
      <Pressable
        role="button"
        aria-label={decreaseLabel}
        hitSlop={reach}
        onPress={() => {
          onChange(stepQuantity(value, -1, rule));
        }}
        style={({ pressed }) => [
          compact ? styles.sideCompact : styles.side,
          pressed && styles.pressedSide,
        ]}
      >
        <Icon name="minus" color={colors.onAction} size={compact ? 12 : 14} />
      </Pressable>
      <View style={compact ? styles.valueCompact : styles.value} aria-live="polite">
        <Text
          variant={compact ? 'caption' : 'strong'}
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
        disabled={atMax}
        hitSlop={reach}
        onPress={() => {
          onChange(stepQuantity(value, 1, rule));
        }}
        style={({ pressed }) => [
          compact ? styles.sideCompact : styles.side,
          atMax && styles.atMax,
          pressed && styles.pressedSide,
        ]}
      >
        <Icon name="plus" color={colors.onAction} size={compact ? 12 : 14} />
      </Pressable>
    </Animated.View>
  );
}
