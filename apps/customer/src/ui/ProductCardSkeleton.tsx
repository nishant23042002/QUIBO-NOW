import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useProductCardMetrics } from './ProductCard';
import { Skeleton } from './Skeleton';
import { fontSize, leading, radius, space } from './tokens';

const styles = StyleSheet.create({
  text: { gap: space[1], paddingHorizontal: space[1] },
  // One line of the real card's text is this tall; the grey bar sits in the middle of it, like the letters would.
  row: { justifyContent: 'center' },
});

/**
 * A product card while items load, built from the same numbers as `ProductCard`: a square picture with the same rounding, then a
 * text block the card's own height holding the price badge, a two-line name, the pack and, when its row has one, the line under it
 * (`reserveNote`, as the real card). The rows and the gaps between them are the real card's, so a row is the height of the row that
 * replaces it. Put it inside a `SkeletonScope`.
 *
 * The real card is never shorter than its text block's minimum but grows past it when its content is taller: a two-line name, and
 * the extra line (low stock, or "10 to 15 mins") a little taller than the pack line it was reserved as. Pass `content`, as the
 * row's items make it, and the skeleton grows the same way.
 */
export function ProductCardSkeleton({
  width,
  reserveNote = true,
  content,
}: {
  width: number;
  reserveNote?: boolean;
  /** What the tallest card of the row holds: how many lines its name takes, and whether it has the extra line. */
  content?: { nameLines: 1 | 2; extraLine: boolean };
}) {
  const { locale } = useLanguage();
  const { compact, line, nameLine, priceHeight, textHeight } = useProductCardMetrics(
    width,
    reserveNote,
  );
  const bar = Math.round(nameLine * 0.6);
  const script = locale === 'en' ? 'latin' : 'devanagari';
  // The extra line is set in the caption style (not tight), the price badge has its stamped edge, and the gaps are the text block's.
  const extra = Math.round((compact ? fontSize.xs : fontSize.sm) * leading[script].normal);
  const made =
    content === undefined
      ? 0
      : priceHeight +
        2 +
        nameLine * content.nameLines +
        line +
        (content.extraLine ? extra : 0) +
        space[1] * (content.extraLine ? 3 : 2);
  const minHeight = Math.max(textHeight, made);

  return (
    <View style={{ width, gap: space[2] }}>
      <Skeleton width={width} height={width} rounded={radius.md} />
      <View style={[styles.text, { minHeight }]}>
        <View style={[styles.row, { height: priceHeight }]}>
          <Skeleton width={64} height={priceHeight - 6} rounded={radius.md} />
        </View>
        <View>
          <View style={[styles.row, { height: nameLine }]}>
            <Skeleton width="92%" height={bar} />
          </View>
          <View style={[styles.row, { height: nameLine }]}>
            <Skeleton width="62%" height={bar} />
          </View>
        </View>
        <View style={[styles.row, { height: line }]}>
          <Skeleton width="36%" height={Math.round(bar * 0.85)} />
        </View>
        {reserveNote ? (
          <View style={[styles.row, { height: line }]}>
            <Skeleton width="50%" height={Math.round(bar * 0.85)} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
