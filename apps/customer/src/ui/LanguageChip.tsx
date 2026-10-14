import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface LanguageChipProps {
  /** The language now in use, in its own short form: "EN", "हिं" or "मरा". */
  code: string;
  /** What a screen reader says, for example "Change language". */
  label: string;
  onPress: () => void;
}

const HEIGHT = 40;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chip: {
      minHeight: HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingHorizontal: space[2],
      borderRadius: radius.md,
      backgroundColor: c.headerControl,
    },
    pressed: { opacity: 0.85 },
  });

/**
 * A small chip on the header that shows the language in use and opens the place to change it. It sits beside the profile button on
 * the header's own control colour, so it reads on the aubergine in both themes.
 */
export function LanguageChip({ code, label, onPress }: LanguageChipProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <View aria-hidden>
        <Icon name="globe" color={colors.onHeaderControl} size={18} />
      </View>
      <Text variant="caption" color="onHeaderControl" numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {code}
      </Text>
    </Pressable>
  );
}
