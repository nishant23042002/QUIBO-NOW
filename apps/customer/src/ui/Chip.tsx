import { Pressable, StyleSheet } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  /** Without a handler the chip is a plain label. */
  onPress?: () => void;
  icon?: IconName;
  /** The same light border the cards have, for a row of filters on Home, instead of the stronger control border. */
  light?: boolean;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chip: {
      minHeight: 36,
      paddingHorizontal: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.lilac },
    light: { borderColor: c.line },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
  });

/** A small, square-cornered button for filters and tabs. It is 36 dp tall and has a 48 dp touch area. */
export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  icon,
  light = false,
}: ChipProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled || onPress === undefined}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        light && styles.light,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {icon !== undefined ? <Icon name={icon} color={colors.ink} size={14} /> : null}
      <Text variant="strong">{label}</Text>
    </Pressable>
  );
}
