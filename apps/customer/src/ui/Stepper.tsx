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
    pressed: { opacity: 0.8 },
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

  if (value === 0) {
    return (
      <Animated.View style={{ transform: [{ scale: bounce }] }}>
        <Pressable
          role="button"
          aria-label={addAriaLabel ?? addLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => {
            onChange(stepQuantity(0, 1, rule));
          }}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        >
          <Text variant="strong" color="action" maxFontSizeMultiplier={CONTROL_SCALE_MAX}>
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
    <Animated.View style={[styles.stepper, { transform: [{ scale: bounce }] }]}>
      <Pressable
        role="button"
        aria-label={decreaseLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => {
          onChange(stepQuantity(value, -1, rule));
        }}
        style={({ pressed }) => [styles.side, pressed && styles.pressed]}
      >
        <Icon name="minus" color={colors.onAction} size={14} />
      </Pressable>
      <View style={styles.value} aria-live="polite">
        <Text variant="strong" color="onAction" maxFontSizeMultiplier={CONTROL_SCALE_MAX}>
          {shown}
        </Text>
      </View>
      <Pressable
        role="button"
        aria-label={atMax ? (maxLabel ?? increaseLabel) : increaseLabel}
        aria-disabled={atMax}
        disabled={atMax}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => {
          onChange(stepQuantity(value, 1, rule));
        }}
        style={({ pressed }) => [styles.side, atMax && styles.atMax, pressed && styles.pressed]}
      >
        <Icon name="plus" color={colors.onAction} size={14} />
      </Pressable>
    </Animated.View>
  );
}
