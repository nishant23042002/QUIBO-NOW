import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { Text } from './Text';
import { TAP_MIN, colors, radius, space, type ColorName } from './tokens';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** The text on the button. Pass a translated string. */
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  /**
   * Busy: shows a spinner, announces busy and ignores presses. The label stays, so the button
   * does not change width.
   */
  loading?: boolean;
}

interface Look {
  background: ColorName | 'transparent';
  pressed: ColorName;
  text: ColorName;
  border: ColorName | 'transparent';
}

const LOOK = {
  primary: { background: 'brand', pressed: 'brandPressed', text: 'onBrand', border: 'brand' },
  secondary: { background: 'surface', pressed: 'surfaceMuted', text: 'ink', border: 'lineStrong' },
  ghost: {
    background: 'transparent',
    pressed: 'brandSubtle',
    text: 'brand',
    border: 'transparent',
  },
} as const satisfies Record<string, Look>;

const DISABLED = {
  background: 'disabledBg',
  pressed: 'disabledBg',
  text: 'disabledText',
  border: 'transparent',
} as const satisfies Look;

function paint(name: ColorName | 'transparent') {
  return name === 'transparent' ? 'transparent' : colors[name];
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true;
  const look: Look = isDisabled ? DISABLED : LOOK[variant];

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
        },
      ]}
    >
      {loading ? <ActivityIndicator color={colors[look.text]} /> : null}
      <Text variant="label" color={look.text}>
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
