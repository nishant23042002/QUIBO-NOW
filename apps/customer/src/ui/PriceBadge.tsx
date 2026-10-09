import { formatRupees, type Money } from '@quibo/contracts';
import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface PriceBadgeProps {
  amount: Money;
  /** The printed price, shown struck through beside the badge when it is higher than the amount. */
  mrp?: Money;
}

/** How far the hard edge sticks out below and to the right of the badge. */
const EDGE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Room for the edge, so the badge and its edge together are what the row measures. The room is the same above and below, so
    // the badge's face sits on the row's centre line and lines up with whatever is beside it.
    wrap: { marginRight: EDGE, marginVertical: EDGE },
    edge: {
      position: 'absolute',
      top: EDGE,
      left: EDGE,
      right: -EDGE,
      bottom: -EDGE,
      borderRadius: radius.md,
      backgroundColor: c.accentEdge,
    },
    face: {
      paddingHorizontal: space[2],
      paddingVertical: 1,
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
  });

/**
 * The price as a pistachio badge with a deeper olive edge cut under its lower right corner, like a stamped
 * tag, and the printed price struck through beside it. Money is always integer paise.
 */
export function PriceBadge({ amount, mrp }: PriceBadgeProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.row}>
      <View style={styles.wrap}>
        <View style={styles.edge} />
        <View style={styles.face}>
          <Text variant="label" color="onAccent" numberOfLines={1}>
            {formatRupees(amount)}
          </Text>
        </View>
      </View>
      {mrp !== undefined && mrp > amount ? (
        <Text variant="small" color="inkMuted" strike numberOfLines={1}>
          {formatRupees(mrp)}
        </Text>
      ) : null}
    </View>
  );
}
