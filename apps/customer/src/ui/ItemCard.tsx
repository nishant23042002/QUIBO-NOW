import type { Money } from '@quibo/contracts';
import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Badge } from './Badge';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { Stepper, type StepperProps } from './Stepper';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface ItemCardProps {
  name: string;
  /** The name in the other script, shown small. */
  otherName?: string;
  /** Pack size or price basis, for example "500 ml" or "per kg". */
  pack: string;
  price: Money;
  mrp?: Money;
  /** A badge on the picture, for example "₹2 off". Pass a translated string. */
  tagLabel?: string;
  photoUri?: string;
  /** Set when the item cannot be ordered: shown instead of the stepper, for example "Out of stock". */
  unavailableLabel?: string;
  quantity: number;
  onQuantityChange: (next: number) => void;
  /** Text for the stepper's buttons, and the rule for count or weight. */
  stepper: Pick<
    StepperProps,
    'addLabel' | 'addAriaLabel' | 'decreaseLabel' | 'increaseLabel' | 'rule' | 'unitLabel'
  >;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      gap: space[1],
      padding: space[2],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    tag: {
      position: 'absolute',
      top: space[3],
      left: space[3],
      zIndex: 1,
      paddingHorizontal: space[2],
      paddingVertical: 1,
      borderRadius: radius.sm,
      backgroundColor: c.tagBg,
    },
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      marginTop: space[1],
    },
  });

/** An item in a shop's grid: picture, name, pack, price, and the ADD or stepper control. */
export function ItemCard({
  name,
  otherName,
  pack,
  price,
  mrp,
  tagLabel,
  photoUri,
  unavailableLabel,
  quantity,
  onQuantityChange,
  stepper,
}: ItemCardProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.card}>
      {tagLabel !== undefined ? (
        <View style={styles.tag}>
          <Text variant="strong" color="tagFg">
            {tagLabel}
          </Text>
        </View>
      ) : null}
      <ProductImage name={name} {...(photoUri !== undefined ? { uri: photoUri } : {})} />
      <Text variant="strong" numberOfLines={2}>
        {name}
      </Text>
      <Text variant="small" color="inkMuted" numberOfLines={1}>
        {otherName !== undefined ? `${pack} · ${otherName}` : pack}
      </Text>
      <View style={styles.footer}>
        <Price amount={price} {...(mrp !== undefined ? { mrp } : {})} />
        {unavailableLabel !== undefined ? (
          <Badge label={unavailableLabel} disabled />
        ) : (
          <Stepper value={quantity} onChange={onQuantityChange} {...stepper} />
        )}
      </View>
    </View>
  );
}
