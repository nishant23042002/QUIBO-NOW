import { formatRupees, type Money } from '@quibo/contracts';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { space } from './tokens';

export interface PriceProps {
  amount: Money;
  /** The printed price, shown struck through when it is higher than the amount. */
  mrp?: Money;
  /** Written after the amount, for example "/ kg". Pass a translated string. */
  unitLabel?: string;
  size?: 'md' | 'lg';
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: space[1] },
});

/** A price in rupees with Indian digit grouping, always from integer paise. */
export function Price({ amount, mrp, unitLabel, size = 'md' }: PriceProps) {
  return (
    <View style={styles.row}>
      <Text variant={size === 'lg' ? 'heading' : 'label'}>{formatRupees(amount)}</Text>
      {unitLabel !== undefined ? (
        <Text variant="small" color="inkMuted">
          {unitLabel}
        </Text>
      ) : null}
      {mrp !== undefined && mrp > amount ? (
        <Text variant="small" color="inkMuted" strike>
          {formatRupees(mrp)}
        </Text>
      ) : null}
    </View>
  );
}
