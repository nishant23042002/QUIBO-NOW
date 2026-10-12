import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface OtherBrandsButtonProps {
  /** How many other brands of this product there are: shown on the button. */
  count: number;
  /** The button's name for a screen reader, for example "Other brands: 3". */
  label: string;
  onPress: () => void;
}

const BUTTON = 40;
/** The same room from the picture's edge as the insight button has on the other side. */
const INSET = space[4];
const BADGE = 20;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      right: INSET,
      bottom: INSET,
      width: BUTTON,
      height: BUTTON,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.overlay,
    },
    pressed: { opacity: 0.8 },
    // The number sits on the button's upper right corner, so the icon stays clear.
    badge: {
      position: 'absolute',
      top: -space[2],
      right: -space[2],
      minWidth: BADGE,
      height: BADGE,
      paddingHorizontal: space[1],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
  });

/**
 * The button in the picture's lower right corner that takes the shopper to this product's other brands further down the page. It
 * is a round-cornered square in the same dark glass as the insight button on the other side, with the number of other brands on its
 * corner. The page decides where it goes and glides there.
 */
export function OtherBrandsButton({ count, label, onPress }: OtherBrandsButtonProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name="layers" color={colors.onOverlay} size={22} />
      <View style={styles.badge} aria-hidden>
        <Text variant="caption" color="onAccent">
          {String(count)}
        </Text>
      </View>
    </Pressable>
  );
}
