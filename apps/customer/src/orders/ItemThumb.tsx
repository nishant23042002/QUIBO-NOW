import { formatRupees, type OrderItem } from '@quibo/contracts';
import { Text as NativeText, StyleSheet, View } from 'react-native';
import { useTintOf } from '@/home/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, Text, formatQuantity, radius, space } from '@/ui';
import { THUMBS_FIT, thumbRow } from './split';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
    row: { flexDirection: 'row', alignItems: 'center' },
    more: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.muted,
    },
    line: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    lineText: { flex: 1, minWidth: 0 },
  });

/**
 * The picture of something that was ordered: its emoji on the colour of its category, the same tile the cart shows. A real photo
 * will take its place here when there are photos. The tile is a picture, so a screen reader skips it: the name beside it says it.
 */
export function ItemThumb({
  emoji,
  category,
  size = 44,
}: {
  emoji: string;
  category: string;
  size?: number;
}) {
  const styles = useStyles(makeStyles);
  const tintOf = useTintOf();
  const fontSize = Math.round(size * 0.55);
  return (
    <View
      style={[styles.tile, { width: size, height: size, backgroundColor: tintOf(category) }]}
      aria-hidden
    >
      <NativeText
        allowFontScaling={false}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.25) }}
      >
        {emoji}
      </NativeText>
    </View>
  );
}

/**
 * A row of small overlapping pictures: the first few things in an order, and how many more there are. `ring` is the colour of
 * what the row sits on, so each picture is cut cleanly from the one beside it.
 */
export function ThumbRow({
  items,
  fit = THUMBS_FIT,
  size = 36,
  ring,
}: {
  items: readonly OrderItem[];
  fit?: number;
  size?: number;
  ring: string;
}) {
  const styles = useStyles(makeStyles);
  const { shown, more } = thumbRow(items, fit);
  return (
    <View style={styles.row} aria-hidden>
      {shown.map((item, index) => (
        <View
          key={item.packId}
          style={{
            marginLeft: index === 0 ? 0 : -size * 0.28,
            borderRadius: radius.md + 2,
            borderWidth: 2,
            borderColor: ring,
          }}
        >
          <ItemThumb emoji={item.emoji} category={item.category} size={size} />
        </View>
      ))}
      {more > 0 ? (
        <View
          style={[
            styles.more,
            {
              width: size,
              height: size,
              marginLeft: -size * 0.28,
              borderWidth: 2,
              borderColor: ring,
            },
          ]}
        >
          <Text variant="caption" color="ink">
            {`+${more}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The place of a `ThumbRow` while its page loads: one block as wide and tall as the row of pictures will be (each picture and its
 * ring, overlapping the next, and the "+N" tile when there are more). Put it inside a `SkeletonScope`.
 */
export function ThumbRowSkeleton({
  items,
  fit = THUMBS_FIT,
  size = 36,
}: {
  items: readonly OrderItem[];
  fit?: number;
  size?: number;
}) {
  const { shown, more } = thumbRow(items, fit);
  const tiles = shown.length + (more > 0 ? 1 : 0);
  const overlap = size * 0.28;
  const width =
    shown.length * (size + 4) + (more > 0 ? size : 0) - Math.max(0, tiles - 1) * overlap;
  return <Skeleton width={Math.round(width)} height={size + 4} rounded={radius.md + 2} />;
}

/** What was bought, in one line: the pack and how many, or how many kilograms for a loose item. */
export function quantityLineOf(item: OrderItem, kg: string): string {
  return item.loose === true
    ? `${formatQuantity(item.quantity)} ${kg}`
    : `${item.pack} × ${item.quantity}`;
}

/** One thing in an order: its picture, its name and how much, and what it came to. */
export function ItemLine({ item }: { item: OrderItem }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.line}>
      <ItemThumb emoji={item.emoji} category={item.category} />
      <View style={styles.lineText}>
        <Text numberOfLines={2}>{item.name}</Text>
        <Text variant="fine" color="inkMuted">
          {quantityLineOf(item, t('weights.kg'))}
        </Text>
      </View>
      <Text variant="strong">
        {item.loose === true ? `≈ ${formatRupees(item.lineTotal)}` : formatRupees(item.lineTotal)}
      </Text>
    </View>
  );
}
