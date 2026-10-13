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
  /**
   * `outline` (the usual): the chosen chip is lilac with a dark outline. `solid`: the chosen chip is filled with the action colour,
   * and the others sit on the surface with a hairline; used for the quick filters under Home's banner.
   */
  tone?: 'outline' | 'solid';
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
    selected: { borderColor: c.action, backgroundColor: c.lilac },
    // The solid tone is a button you can see: a little taller, with a hard edge under it (the same stamped look as the price badge)
    // that pistachio-lines the chosen one.
    solid: {
      minHeight: 40,
      borderWidth: 1,
      borderBottomWidth: 3,
      borderColor: c.line,
      borderBottomColor: c.ctl,
    },
    solidSelected: {
      borderColor: c.action,
      borderBottomColor: c.accent,
      backgroundColor: c.action,
    },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
  });

/** A small pill for filters and tabs. It is 36 dp tall and has a 48 dp touch area. */
export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  icon,
  tone = 'outline',
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
        tone === 'solid' && styles.solid,
        selected && (tone === 'solid' ? styles.solidSelected : styles.selected),
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {icon !== undefined ? (
        <Icon
          name={icon}
          color={tone === 'solid' && selected ? colors.onAction : colors.ink}
          size={tone === 'solid' ? 16 : 14}
        />
      ) : null}
      <Text variant="strong" color={tone === 'solid' && selected ? 'onAction' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
