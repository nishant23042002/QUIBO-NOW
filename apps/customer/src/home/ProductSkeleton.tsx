import { Fragment } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BRAND_TILE_HEIGHT,
  BRAND_TILE_WIDTH,
  ProductCardSkeleton,
  STAGE_RATIO,
  Skeleton,
  SkeletonScope,
  fontSize,
  leading,
  radius,
  space,
  useProductCardMetrics,
} from '@/ui';
import { RAIL_CARD_WIDTH } from './ItemTile';
import type { HomeItem } from './items';
import { PDP_TRIAL } from './pdpTrial';
import { makePageStyles } from './productLayout';

const OPTION_MIN = 104;
const SHOP_ICON = 40;
const RAIL_CARDS = 3;
const RAIL_BRANDS = 4;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ...makePageStyles(c),
    clip: { flex: 1, overflow: 'hidden' },
    row: { justifyContent: 'center' },
    strip: { padding: space[3] },
    chipsRow: { flexDirection: 'row', gap: space[2] },
    group: { gap: space[2] },
    divider: { height: 1 },
    left: { gap: space[1] },
    pair: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    between: { alignItems: 'center', justifyContent: 'space-between' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: { flexGrow: 1, flexBasis: OPTION_MIN, minWidth: OPTION_MIN },
    rail: { gap: space[3], paddingBottom: space[2] },
    head: {
      height: space[10],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    cards: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * The product page while it loads, drawn from the same numbers as the real page: the same side gutter, the same
 * gap between blocks, and inside each card the same lines at the same heights (the full-width picture stage, the title card, the size picker, the trust tiles, the highlights and information, the shop card and the
 * rows of items), so nothing moves when the real page replaces it. It follows the product it stands in for:
 * the size card only when it has several sizes.
 */
export function ProductSkeleton({
  label,
  item,
  rails,
}: {
  label: string;
  item: HomeItem;
  /** The rows the real page ends with: a row of item cards or of brand tiles, and whether it has a "See all" link. */
  rails: readonly { kind: 'cards' | 'brands'; seeAll: boolean }[];
}) {
  const styles = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const { locale } = useLanguage();
  const { priceHeight } = useProductCardMetrics();
  const rhythm = leading[locale === 'en' ? 'latin' : 'devanagari'];
  const line = (size: number, kind: 'tight' | 'normal' = 'normal') =>
    Math.round(size * rhythm[kind]);
  const small = line(fontSize.sm);
  const body = line(fontSize.base);

  /** One text line of the real page: a row as tall as the line, with a grey bar in its middle. */
  const bar = (key: string | number, height: number, bar: `${number}%` | number) => (
    <View key={key} style={[styles.row, { height }]}>
      <Skeleton width={bar} height={Math.round(height * 0.6)} />
    </View>
  );
  // The picture stage is as wide as the screen, with no gutter and no card, and as tall as the real stage.
  const picture = Math.round(width / STAGE_RATIO);
  const optionHeight = space[3] + space[2] + 3 + small * 2 + body + 4;
  // A chip is a quiet line over a strong one, with its padding.
  const chip = line(fontSize.xs) + small + space[2] * 2;
  // The rows after the info card, as tall as the real ones: the icon or the text, whichever is taller, with the card's padding.
  const rows = [
    Math.max(SHOP_ICON, small * 2 + (item.otherShops !== undefined ? line(fontSize.xs) : 0)),
    ...(item.brand !== undefined ? [Math.max(SHOP_ICON, small * 2)] : []),
    Math.max(SHOP_ICON, small),
  ];

  return (
    // Only the first screenful is ever seen (the page cannot be scrolled while it loads), so the rest is cut off.
    <View style={styles.clip}>
      <SkeletonScope label={label}>
        <View style={styles.content}>
          <Skeleton height={picture} rounded={0} />

          <View style={styles.gutter}>
            <View style={[styles.card, styles.strip]}>
              <View style={styles.chipsRow}>
                {[0, 1, 2].map((chip) => (
                  <Skeleton key={chip} width={96} height={chip} rounded={radius.md} />
                ))}
                <Skeleton width={72} height={chip} rounded={radius.md} />
              </View>
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              {bar('meta', line(fontSize.xs), '52%')}
              {bar('name', line(fontSize.xl, 'tight'), '66%')}
              <View style={styles.group}>
                {bar('size', small, 90)}
                <View style={styles.options}>
                  {Array.from({ length: Math.max(item.packs.length, 2) }, (_, option) => (
                    <View key={option} style={styles.option}>
                      <Skeleton height={optionHeight} rounded={radius.lg} />
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />
              <View style={[styles.pair, styles.between]}>
                <View style={styles.left}>
                  <Skeleton width={84} height={priceHeight - 4} rounded={radius.md} />
                  {item.mrp !== undefined && item.mrp > item.price
                    ? bar('save', line(fontSize.xs), 96)
                    : null}
                  {bar('taxes', line(fontSize.xs), 130)}
                </View>
                <Skeleton width={78} height={32} rounded={radius.md} />
              </View>
              {item.stock?.kind === 'low' ? bar('stock', small, '40%') : null}
            </View>
          </View>

          {PDP_TRIAL.groupedRows ? (
            <View style={styles.gutter}>
              <View
                style={[
                  styles.card,
                  {
                    height:
                      rows.reduce((sum, height) => sum + height + space[4] * 2, 0) +
                      (rows.length - 1) +
                      2,
                    padding: 0,
                    gap: 0,
                  },
                ]}
              >
                <Skeleton
                  height={
                    rows.reduce((sum, height) => sum + height + space[4] * 2, 0) + (rows.length - 1)
                  }
                  rounded={radius.lg}
                />
              </View>
            </View>
          ) : (
            rows.map((height, row) => (
              <View key={row} style={styles.gutter}>
                <View
                  style={[styles.card, { height: height + space[4] * 2 + 2, padding: 0, gap: 0 }]}
                >
                  <Skeleton height={height + space[4] * 2} rounded={radius.lg} />
                </View>
              </View>
            ))
          )}

          {rails.map(({ kind, seeAll }, rail) => (
            <Fragment key={rail}>
              <View style={styles.rail}>
                <View style={styles.head}>
                  <Skeleton width={rail === 0 ? 180 : 150} height={20} />
                  {seeAll ? <Skeleton width={56} height={16} /> : null}
                </View>
                <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
                  <View style={styles.cards}>
                    {Array.from(
                      { length: kind === 'brands' ? RAIL_BRANDS : RAIL_CARDS },
                      (_, card) =>
                        kind === 'brands' ? (
                          <Skeleton
                            key={card}
                            width={BRAND_TILE_WIDTH}
                            height={BRAND_TILE_HEIGHT + space[2] + line(fontSize.xs)}
                            rounded={radius.md}
                          />
                        ) : (
                          <ProductCardSkeleton key={card} width={RAIL_CARD_WIDTH} />
                        ),
                    )}
                  </View>
                </ScrollView>
              </View>
            </Fragment>
          ))}
        </View>
      </SkeletonScope>
    </View>
  );
}
