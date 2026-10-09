import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useTheme, type ThemeColors } from '@/theme';
import { ShineSweep } from './ShineSweep';
import { Text, type TextColor } from './Text';
import { TAP_MIN, radius, space } from './tokens';
import { useScreenFocused } from './useScreenFocused';

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
  /**
   * Draws the eye to the button with a band of light across it: for the one button on a screen that moves the shopper
   * forward. It repeats with a rest between, or, when `shineKey` is given, sweeps once whenever that changes (and once on
   * arrival), so a button whose meaning just changed says so. It only moves while the screen is in front and the button
   * can be pressed.
   */
  shine?: boolean;
  shineKey?: string;
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
  shine = false,
  shineKey,
  onLayout,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const isDisabled = disabled === true;
  const look = isDisabled ? DISABLED : LOOK[variant];
  const paint = (name: Paint) => (name === 'transparent' ? 'transparent' : colors[name]);

  return (
    <Pressable
      role="button"
      aria-busy={loading}
      {...rest}
      disabled={isDisabled}
      onLayout={(event) => {
        if (shine) setWidth(Math.round(event.nativeEvent.layout.width));
        onLayout?.(event);
      }}
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
      {shine && !isDisabled ? (
        <ButtonShine
          width={width}
          color={colors[look.label]}
          {...(shineKey !== undefined ? { shineKey } : {})}
        />
      ) : null}
    </Pressable>
  );
}

/** How long a button rests between glints: often enough to be noticed, rarely enough never to nag. */
const SHINE_REST_MS = 1500;

/** The shine, as its own piece so only a button that asks for it needs to know which screen is in front. */
function ButtonShine({
  width,
  color,
  shineKey,
}: {
  width: number;
  color: string;
  shineKey?: string;
}) {
  const focused = useScreenFocused();
  return (
    <ShineSweep
      width={width}
      color={color}
      active={focused}
      intensity={0.4}
      {...(shineKey === undefined
        ? { loopPauseMs: SHINE_REST_MS }
        : { trigger: shineKey, onAppear: true })}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
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
