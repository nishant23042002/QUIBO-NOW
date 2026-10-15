import { Pressable, StyleSheet } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface FilterButtonProps {
  label: string;
  /** Drawn chosen when it is doing something (a sort other than the first, a filter that is on). */
  selected?: boolean;
  /** A small picture before the label: the sliders for Filters, the arrows for Sort. */
  icon?: IconName;
  /** A chevron after the label, for a button that opens a sheet. */
  dropdown?: boolean;
  /** The name for a screen reader when the label alone is not enough. */
  accessibilityLabel?: string;
  onPress: () => void;
}

/** One height for every button in a toolbar, so a row of them lines up whatever is on it. */
export const FILTER_BUTTON_HEIGHT = 36;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    button: {
      height: FILTER_BUTTON_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1] + 2,
      paddingHorizontal: space[2] + 2,
      // Squarer than a chip, so it reads as a button that does something, not a label.
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.lilac },
    pressed: { opacity: 0.8 },
  });

/**
 * A button of a toolbar that opens a choice (Sort, Filters, Type, Price): a square-cornered bordered button with an optional icon in
 * front and a chevron after, so it looks like something to press. The chosen look is the app's usual lilac with a green edge.
 */
export function FilterButton({
  label,
  selected = false,
  icon,
  dropdown = false,
  accessibilityLabel,
  onPress,
}: FilterButtonProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={accessibilityLabel ?? label}
      aria-pressed={selected}
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon !== undefined ? <Icon name={icon} color={colors.ink} size={16} /> : null}
      <Text variant="caption" color="ink" numberOfLines={1}>
        {label}
      </Text>
      {dropdown ? <Icon name="chevron" color={colors.ink} size={14} /> : null}
    </Pressable>
  );
}
