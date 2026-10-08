import { formatRupees, type Money } from '@quibo/contracts';
import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';
import { space } from './tokens';

export interface CartBarProps {
  /** How many items, already worded and pluralised, for example "3 items". */
  itemsLabel: string;
  total: Money;
  /** The shop the cart is from, or a count such as "2 shops". A cart can hold items from several shops. */
  shopName: string;
  /** The button text, for example "View cart". */
  actionLabel: string;
  onPress: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      backgroundColor: c.chrome,
    },
    summary: { flex: 1, minWidth: 0 },
  });

/** The bar pinned above the bottom edge once the cart has items. Dark in both themes. */
export function CartBar({ itemsLabel, total, shopName, actionLabel, onPress }: CartBarProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.bar}>
      <View style={styles.summary}>
        <Text variant="label" color="onChrome">
          {`${itemsLabel} · ${formatRupees(total)}`}
        </Text>
        <Text variant="small" color="onChromeMuted" numberOfLines={1}>
          {shopName}
        </Text>
      </View>
      <Button variant="accent" label={actionLabel} onPress={onPress} />
    </View>
  );
}
