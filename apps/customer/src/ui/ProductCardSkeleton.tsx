import { StyleSheet, View } from 'react-native';
import { useProductCardMetrics } from './ProductCard';
import { Skeleton } from './Skeleton';
import { radius, space } from './tokens';

const styles = StyleSheet.create({
  text: { gap: space[1], paddingHorizontal: space[1] },
  // One line of the real card's text is this tall; the grey bar sits in the middle of it, like the letters would.
  row: { justifyContent: 'center' },
});

/**
 * A product card while items load, built from the same numbers as `ProductCard`: a square picture with the same
 * rounding, then a text block the card's own height holding the price badge, a two-line name and the pack. Put it
 * inside a `SkeletonScope`.
 */
export function ProductCardSkeleton({ width }: { width: number }) {
  const { line, priceHeight, textHeight } = useProductCardMetrics();
  const bar = Math.round(line * 0.6);

  return (
    <View style={{ width, gap: space[2] }}>
      <Skeleton width={width} height={width} rounded={radius.lg} />
      <View style={[styles.text, { minHeight: textHeight }]}>
        <View style={[styles.row, { height: priceHeight }]}>
          <Skeleton width={64} height={priceHeight - 6} rounded={radius.md} />
        </View>
        <View style={[styles.row, { height: line }]}>
          <Skeleton width="92%" height={bar} />
        </View>
        <View style={[styles.row, { height: line }]}>
          <Skeleton width="62%" height={bar} />
        </View>
        <View style={[styles.row, { height: line }]}>
          <Skeleton width="36%" height={Math.round(bar * 0.85)} />
        </View>
      </View>
    </View>
  );
}
