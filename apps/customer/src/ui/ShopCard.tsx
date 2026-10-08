import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { initialOf } from './logic/initial';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface ShopCardProps {
  name: string;
  /** What the shop sells, for example "Milk, curd, eggs". */
  type: string;
  /** Open: the delivery window, for example "Today 4–6 PM". Closed: when it opens, for example "Opens 7 AM". */
  statusLabel: string;
  open: boolean;
  onPress: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: 156,
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    closed: { opacity: 0.7 },
    top: { height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: c.muted },
    body: { padding: space[3], gap: space[1], alignItems: 'flex-start' },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingHorizontal: space[2],
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    openPill: { backgroundColor: c.successBg },
    closedPill: { backgroundColor: c.muted },
    pressed: { opacity: 0.85 },
  });

/** A shop on home. An open shop shows its delivery window; a closed one says when it opens. */
export function ShopCard({ name, type, statusLabel, open, onPress }: ShopCardProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={`${name}. ${statusLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, !open && styles.closed, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text variant="heading" color="inkMuted">
          {initialOf(name)}
        </Text>
      </View>
      <View style={styles.body}>
        <Text variant="strong" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="small" color="inkMuted" numberOfLines={1}>
          {type}
        </Text>
        <View style={[styles.pill, open ? styles.openPill : styles.closedPill]}>
          {open ? <Icon name="clock" color={colors.success} size={14} /> : null}
          <Text variant="strong" color={open ? 'success' : 'inkMuted'}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
