import { Pressable, StyleSheet } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface SeeAllButtonProps {
  /** The button's text, for example "See all". */
  label: string;
  /** The row it belongs to, so a screen reader says which one: "See all: Fresh vegetables". */
  title: string;
  onPress: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Under the row, the width of the page: the way into the whole category.
    more: {
      marginHorizontal: space[4],
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    pressed: { backgroundColor: c.muted },
  });

/** The full-width "See all" button that sits under a row of items or tiles on Home. */
export function SeeAllButton({ label, title, onPress }: SeeAllButtonProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={`${label}: ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.more, pressed && styles.pressed]}
    >
      <Text variant="strong">{label}</Text>
      <Icon name="chevronRight" color={colors.ink} size={16} />
    </Pressable>
  );
}
