import { formatRupees, type Money } from '@quibo/contracts';
import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { freeDeliveryProgress } from './logic/money';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface BillRow {
  label: string;
  /** An amount in paise. */
  amount: Money;
  /** Shown instead of the amount, for example "Free". Pass a translated string. */
  valueLabel?: string;
}

export interface FreeDeliveryHint {
  /** What the items add up to, before delivery. */
  basket: Money;
  /** Basket value at which delivery is free. */
  threshold: Money;
  /** Builds the line under the bar from what is left, for example "Add ₹40 more for free delivery". */
  remainingLabel: (remaining: Money) => string;
  /** The line once reached, for example "You get free delivery". */
  reachedLabel: string;
}

export interface BillSummaryProps {
  rows: readonly BillRow[];
  totalLabel: string;
  total: Money;
  freeDelivery?: FreeDeliveryHint;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    box: { gap: space[2] },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
    rowLabel: { flexShrink: 1 },
    total: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: space[3],
      marginTop: space[1],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    hint: { gap: space[1], marginBottom: space[2] },
    track: { height: 8, borderRadius: radius.full, overflow: 'hidden', backgroundColor: c.muted },
    fill: { height: '100%', borderRadius: radius.full, backgroundColor: c.action },
  });

/** The bill at checkout and in the cart: each charge, the total, and progress to free delivery. */
export function BillSummary({ rows, totalLabel, total, freeDelivery }: BillSummaryProps) {
  const styles = useStyles(makeStyles);
  const progress =
    freeDelivery === undefined
      ? null
      : freeDeliveryProgress(freeDelivery.basket, freeDelivery.threshold);

  return (
    <View style={styles.box}>
      {freeDelivery !== undefined && progress !== null ? (
        <View style={styles.hint}>
          <Text variant="strong" color={progress.reached ? 'success' : 'ink'}>
            {progress.reached
              ? freeDelivery.reachedLabel
              : freeDelivery.remainingLabel(progress.remaining)}
          </Text>
          <View
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.ratio * 100)}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${Math.round(progress.ratio * 100)}%` }]} />
          </View>
        </View>
      ) : null}
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <View style={styles.rowLabel}>
            <Text variant="body" color="inkMuted">
              {row.label}
            </Text>
          </View>
          <Text variant="body">{row.valueLabel ?? formatRupees(row.amount)}</Text>
        </View>
      ))}
      <View style={styles.total}>
        <Text variant="heading">{totalLabel}</Text>
        <Text variant="heading">{formatRupees(total)}</Text>
      </View>
    </View>
  );
}
