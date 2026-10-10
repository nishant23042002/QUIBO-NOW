import { formatRupees, type Money } from '@quibo/contracts';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { FlashOnChange } from './ChangeCue';
import { Icon } from './Icon';
import { freeDeliveryProgress } from './logic/money';
import { Popover } from './Popover';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface BillRow {
  label: string;
  /** An amount in paise. */
  amount: Money;
  /** Shown instead of the amount, for example "Free". Pass a translated string. */
  valueLabel?: string;
  /** The value is good news (free, or a saving), so it is shown in the success colour. */
  positive?: boolean;
  /** Gives the row a small (i) button that opens this in a popover beside it, to explain the amount. Needs `infoLabel`. */
  info?: ReactNode;
  /** Name of the (i) button and its popover for screen readers, for example "Why this price?". Pass a translated string. */
  infoLabel?: string;
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
  /** Name of the area that closes a row's popover, for example "Close". Needed when any row has `info`. */
  closeLabel?: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    box: { gap: space[1] },
    // One line per charge: the name on the left, the amount on the right, and nothing in between to read.
    row: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    rowLabel: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: space[1] },
    info: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    total: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: space[3],
      marginTop: space[2],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    hint: { gap: space[1], marginBottom: space[2] },
    track: { height: 8, borderRadius: radius.full, overflow: 'hidden', backgroundColor: c.muted },
    fill: { height: '100%', borderRadius: radius.full, backgroundColor: c.action },
  });

/** The bill at checkout and in the cart: each charge on its own line, the total, and progress to free delivery. */
export function BillSummary({
  rows,
  totalLabel,
  total,
  freeDelivery,
  closeLabel = '',
}: BillSummaryProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
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
            {row.info !== undefined && row.infoLabel !== undefined ? (
              <Popover
                content={row.info}
                label={row.infoLabel}
                triggerLabel={row.infoLabel}
                closeLabel={closeLabel}
                hitSlop={8}
                style={styles.info}
              >
                <Icon name="info" color={colors.inkMuted} size={18} />
              </Popover>
            ) : null}
          </View>
          <FlashOnChange value={row.valueLabel ?? row.amount}>
            <Text variant="body" color={row.positive === true ? 'success' : 'ink'}>
              {row.valueLabel ?? formatRupees(row.amount)}
            </Text>
          </FlashOnChange>
        </View>
      ))}
      <View style={styles.total}>
        <Text variant="heading" role={undefined}>
          {totalLabel}
        </Text>
        <FlashOnChange value={total}>
          <Text variant="heading" role={undefined}>
            {formatRupees(total)}
          </Text>
        </FlashOnChange>
      </View>
    </View>
  );
}
