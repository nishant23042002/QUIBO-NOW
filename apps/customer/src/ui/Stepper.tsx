import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { COUNT_RULE, formatQuantity, stepQuantity, type QuantityRule } from './logic/quantity';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface StepperProps {
  /** How much is in the cart. 0 shows the ADD button. */
  value: number;
  onChange: (next: number) => void;
  /** COUNT_RULE for items sold by the piece, WEIGHT_RULE for loose items sold by weight. */
  rule?: QuantityRule;
  /** The text on the ADD button. Pass a translated string. */
  addLabel: string;
  /** Names of the two buttons for screen readers. */
  decreaseLabel: string;
  increaseLabel: string;
  /** Written after the number for a weight, for example "kg". */
  unitLabel?: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    add: {
      minHeight: 36,
      paddingHorizontal: space[4],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: radius.md,
      borderColor: c.action,
    },
    stepper: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      backgroundColor: c.action,
    },
    side: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    value: { minWidth: 40, alignItems: 'center' },
    pressed: { opacity: 0.8 },
  });

/** ADD that turns into a - and + stepper once the item is in the cart. Every target has a 48 dp touch area. */
export function Stepper({
  value,
  onChange,
  rule = COUNT_RULE,
  addLabel,
  decreaseLabel,
  increaseLabel,
  unitLabel,
}: StepperProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  if (value === 0) {
    return (
      <Pressable
        role="button"
        aria-label={addLabel}
        hitSlop={6}
        onPress={() => {
          onChange(stepQuantity(0, 1, rule));
        }}
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
      >
        <Text variant="strong" color="action">
          {addLabel}
        </Text>
      </Pressable>
    );
  }

  const shown =
    unitLabel === undefined ? formatQuantity(value) : `${formatQuantity(value)} ${unitLabel}`;

  return (
    <View style={styles.stepper}>
      <Pressable
        role="button"
        aria-label={decreaseLabel}
        hitSlop={6}
        onPress={() => {
          onChange(stepQuantity(value, -1, rule));
        }}
        style={({ pressed }) => [styles.side, pressed && styles.pressed]}
      >
        <Icon name="minus" color={colors.onAction} size={16} />
      </Pressable>
      <View style={styles.value} aria-live="polite">
        <Text variant="strong" color="onAction">
          {shown}
        </Text>
      </View>
      <Pressable
        role="button"
        aria-label={increaseLabel}
        hitSlop={6}
        onPress={() => {
          onChange(stepQuantity(value, 1, rule));
        }}
        style={({ pressed }) => [styles.side, pressed && styles.pressed]}
      >
        <Icon name="plus" color={colors.onAction} size={16} />
      </Pressable>
    </View>
  );
}
