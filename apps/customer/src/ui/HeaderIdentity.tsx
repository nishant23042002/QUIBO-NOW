import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { LanguageChip } from './LanguageChip';
import { Text } from './Text';
import { TAP_MIN, space } from './tokens';

/** The profile button's round fill is 38 dp inside a 48 dp touch target, so 5 dp of the target is empty on each side. */
const BUTTON_INSET = (TAP_MIN - 38) / 2;

export interface HeaderIdentityProps {
  /** The small line over the estimate, for example "Estimated delivery" or "Scheduled delivery". */
  deliveryLabel: string;
  /** The estimate itself, big: a range such as "15–20 mins" or a window such as "Today, 5–6 PM". Never a guarantee. */
  deliveryValue: string;
  /** Where the order is going, for example "Home - 12, Station Road, Roha". */
  address: string;
  addressCaption: string;
  profileLabel: string;
  /** The language in use, short ("EN", "हिं", "मरा"), and what a screen reader says for the chip. */
  languageCode: string;
  languageLabel: string;
  onLanguagePress: () => void;
  onAddressPress: () => void;
  onProfilePress: () => void;
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
    text: { flex: 1, minWidth: 0 },
    // As tall as its text, so it sits closer under the estimate than it did (4 dp, where it was 8); the room below it, before the next
    // piece of the header, is what it was (8 dp). The touch area is made up to 48 dp with the pressable's hit slop.
    address: {
      marginTop: space[1],
      marginBottom: space[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    addressText: { flexShrink: 1 },
    // The chip and the profile button, side by side at the top right. The profile button's empty touch margin is pulled up so its
    // circle lines up with the first line.
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      marginTop: -BUTTON_INSET,
    },
    pressed: { opacity: 0.7 },
  });

/**
 * The top of the header on Home and on the tabs that share it. The delivery estimate leads: a small label, then the range in big
 * type, then where it is going, with the language chip and the profile button at the right. One piece, so the tabs can never
 * drift from Home. It sits on the header's tint and uses its text colours.
 */
export function HeaderIdentity({
  deliveryLabel,
  deliveryValue,
  address,
  addressCaption,
  profileLabel,
  languageCode,
  languageLabel,
  onLanguagePress,
  onAddressPress,
  onProfilePress,
}: HeaderIdentityProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingLeft: insets.left + space[4],
        paddingRight: insets.right + space[4] - BUTTON_INSET,
      }}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <Text variant="caption" color="onHeaderMuted" numberOfLines={1}>
            {deliveryLabel}
          </Text>
          <Text variant="hero" color="onHeader" numberOfLines={2}>
            {deliveryValue}
          </Text>
          <Pressable
            role="button"
            aria-label={`${addressCaption}: ${address}`}
            onPress={onAddressPress}
            hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            style={({ pressed }) => [styles.address, pressed && styles.pressed]}
          >
            <Icon name="pin" color={colors.onHeader} size={16} />
            <View style={styles.addressText}>
              <Text variant="strong" color="onHeader" numberOfLines={1}>
                {address}
              </Text>
            </View>
            <Icon name="chevron" color={colors.onHeader} size={16} />
          </Pressable>
        </View>
        <View style={styles.actions}>
          <LanguageChip code={languageCode} label={languageLabel} onPress={onLanguagePress} />
          <IconButton icon="user" label={profileLabel} onPress={onProfilePress} ground="header" />
        </View>
      </View>
    </View>
  );
}
