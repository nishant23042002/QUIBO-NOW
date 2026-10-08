import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface ShopRowProps {
  name: string;
  /** What the shop sells, for example "Milk, curd, paneer, eggs". One line. */
  type: string;
  /** "Open now" or "Closed now". */
  statusLabel: string;
  open: boolean;
  /** For example "Verified by Quibo". Shown as the shield after the name; read out in full. */
  verifiedLabel: string;
  onPress: () => void;
}

const CIRCLE = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.8 },
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accentSubtle,
    },
    text: { flex: 1, minWidth: 0 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    name: { flexShrink: 1 },
  });

/** A shop as one tappable row, for lists such as search results: its mark, name with the shield, what it sells and whether it is open. */
export function ShopRow({ name, type, statusLabel, open, verifiedLabel, onPress }: ShopRowProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={`${name}. ${statusLabel}. ${type}. ${verifiedLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.circle}>
        <Icon name="store" color={colors.accentInk} size={22} />
      </View>
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <View style={styles.name}>
            <Text variant="strong" numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Icon name="shield" color={colors.accentInk} size={16} />
        </View>
        <Text variant="small" color="inkMuted" numberOfLines={1}>
          {type}
        </Text>
        <Text variant="small" color={open ? 'accentInk' : 'inkMuted'} numberOfLines={1}>
          {statusLabel}
        </Text>
      </View>
      <Icon name="chevronRight" color={colors.inkMuted} size={18} />
    </Pressable>
  );
}
