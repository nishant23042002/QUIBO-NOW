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
      borderRadius: radius.full,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.accentSubtle },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
  });

/** A small pill for filters and tabs. It is 36 dp tall and has a 48 dp touch area. */
export function Chip({ label, selected = false, disabled = false, onPress, icon }: ChipProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled || onPress === undefined}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
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
