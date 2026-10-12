import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { TAP_MIN, space } from './tokens';

/** The profile button's round fill is 38 dp inside a 48 dp touch target, so 5 dp of the target is empty on each side. */
const BUTTON_INSET = (TAP_MIN - 38) / 2;
/** The heading's first line is 30 dp tall (24 dp text); lifting the button by this much centres it on that line. */
const BUTTON_LIFT = (TAP_MIN - 30) / 2;

export interface HeaderIdentityProps {
  /** The delivery promise as a clock window or an estimate range, already worded. Never a guarantee. */
  deliveryLine: string;
  /** Where the order is going, for example "Home - 12, Station Road, Roha". */
  address: string;
  /** Names the address row for a screen reader, for example "Deliver to". */
  addressCaption: string;
  profileLabel: string;
  onAddressPress: () => void;
  onProfilePress: () => void;
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
    text: { flex: 1, minWidth: 0 },
    address: {
      minHeight: space[10],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    addressText: { flexShrink: 1 },
    button: { marginTop: -BUTTON_LIFT },
    pressed: { opacity: 0.7 },
  });

/**
 * The top of the header on Home and on the tabs that share it: the delivery promise, where it is going, and the profile
 * button. One piece, so the tabs can never drift from Home. It sits on the dark top of the header's gradient, so its text is
 * white in both themes.
 */
export function HeaderIdentity({
  deliveryLine,
  address,
  addressCaption,
  profileLabel,
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
          <Text variant="heading" color="onChrome" numberOfLines={2}>
            {deliveryLine}
          </Text>
          <Pressable
            role="button"
            aria-label={`${addressCaption}: ${address}`}
            onPress={onAddressPress}
            hitSlop={6}
            style={({ pressed }) => [styles.address, pressed && styles.pressed]}
          >
            <Icon name="pin" color={colors.onChrome} size={16} />
            <View style={styles.addressText}>
              <Text variant="strong" color="onChrome" numberOfLines={1}>
                {address}
              </Text>
            </View>
            <Icon name="chevron" color={colors.onChrome} size={16} />
          </Pressable>
        </View>
        <View style={styles.button}>
          <IconButton icon="user" label={profileLabel} onPress={onProfilePress} ground="header" />
        </View>
      </View>
    </View>
  );
}
