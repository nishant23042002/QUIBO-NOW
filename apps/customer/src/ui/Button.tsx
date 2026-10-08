import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useTheme, type ThemeColors } from '@/theme';
import { Text, type TextColor } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** The text on the button. Pass a translated string. */
  label: string;
  /**
   * primary: the main action on a page. secondary: a quieter one. ghost: a text-only action.
   * accent: the pistachio button, only for dark bars such as the cart bar.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'md' | 'lg';
  /**
   * Busy: shows a spinner, announces busy and ignores presses. The label stays, so the button
   * does not change width.
   */
  loading?: boolean;
}

type Paint = keyof ThemeColors | 'transparent';

interface Look {
  background: Paint;
  pressed: Paint;
  label: TextColor;
  border: Paint;
}

const LOOK: Record<NonNullable<ButtonProps['variant']>, Look> = {
  primary: { background: 'action', pressed: 'action', label: 'onAction', border: 'action' },
  secondary: { background: 'surface', pressed: 'muted', label: 'ink', border: 'ctl' },
  ghost: {
    background: 'transparent',
    pressed: 'accentSubtle',
    label: 'accentInk',
    border: 'transparent',
  },
  accent: { background: 'accent', pressed: 'accentPressed', label: 'onAccent', border: 'accent' },
};

const DISABLED: Look = {
  background: 'muted',
  pressed: 'muted',
  label: 'inkMuted',
  border: 'transparent',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled === true;
  const look = isDisabled ? DISABLED : LOOK[variant];
  const paint = (name: Paint) => (name === 'transparent' ? 'transparent' : colors[name]);

  return (
    <Pressable
      role="button"
      aria-busy={loading}
      {...rest}
      disabled={isDisabled}
      // A busy button must not act twice.
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.large,
        {
          backgroundColor: paint(pressed && !loading ? look.pressed : look.background),
          borderColor: paint(look.border),
          opacity: pressed && !loading && variant === 'primary' && !isDisabled ? 0.85 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={colors[look.label]} /> : null}
      <Text variant="label" color={look.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TAP_MIN,
    paddingHorizontal: space[5],
    borderWidth: 2,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  large: { minHeight: 56 },
});
