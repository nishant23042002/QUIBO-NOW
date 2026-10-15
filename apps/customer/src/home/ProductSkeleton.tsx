import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BRAND_TILE_HEIGHT,
  BRAND_TILE_WIDTH,
  BrandFooter,
  ProductCardSkeleton,
  RowTitleSkeleton,
  STAGE_RATIO,
  SeeAllButtonSkeleton,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  fontSize,
  leading,
  radius,
  space,
  useProductCardMetrics,
} from '@/ui';
import { rowCardContent } from './cardContent';
import { RAIL_CARD_WIDTH } from './ItemTile';
import type { HomeItem } from './items';
import { PDP_TRIAL } from './pdpTrial';
import { makePageStyles } from './productLayout';

const SHOP_ICON = 40;
/** The least width of a size option, as the picker has it. */
const OPTION_MIN = 104;
/** The "Add" button of the price row, as tall as the page's large stepper. */
const ADD_WIDTH = 128;
const ADD_HEIGHT = 48;
/** How many cards and brand tiles of a row the skeleton draws: as many as show before the screen's edge. */
const BRANDS_SHOWN = 4;
/** A fact chip's width runs from this to that, by its words; the strip's button is this wide. */
const CHIP_MIN = 88;
const CHIP_MAX = 168;
const ACTION_WIDTH = 72;

/** A row of items or of brands under the card: its title, what it holds and, for the first, a "See all" button. */
export type ProductSkeletonRail =
  | { kind: 'cards'; title: string; items: readonly HomeItem[]; seeAll: boolean }
  | { kind: 'brands'; title: string };

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ...makePageStyles(c),
    clip: { flex: 1, overflow: 'hidden' },
    strip: { padding: space[3] },
    chipsRow: { flexDirection: 'row', alignItems: 'stretch', gap: space[2] },
    chipsScroll: { flex: 1, minWidth: 0, flexDirection: 'row', gap: space[2], overflow: 'hidden' },
    group: { gap: space[2] },
    divider: { height: 1 },
    left: { gap: space[1] },
    pair: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    between: { alignItems: 'center', justifyContent: 'space-between' },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: { flexGrow: 1, flexBasis: OPTION_MIN, minWidth: OPTION_MIN },
    // A row under the card and the title and cards inside it: 12 between, and a little room under it.
    rail: { gap: space[3], paddingBottom: space[2] },
    head: { paddingHorizontal: space[4] },
    cards: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * The product page while it loads, drawn from the page's own numbers: the same side gutter, the same gap between blocks, and
 * inside each card the same lines at the same heights (the full-width picture stage, the strip of facts, the title card with its
 * meta line, name, size picker and price, the shop, brand and promise rows, and the rows of items), so nothing moves when the real
 * page replaces it. It follows the product it stands in for: the sizes it has, whether they show what they save, whether the shop
 * has other branches, and which rows the page ends with.
 */
export function ProductSkeleton({
  label,
  item,
  chips,
  rails,
}: {
  label: string;
  item: HomeItem;
  /** The facts the strip shows as chips, so each is as wide as its real one. */
  chips: readonly { label: string; value: string }[];
  /** The rows the real page ends with, in order. */
  rails: readonly ProductSkeletonRail[];
}) {
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const { locale } = useLanguage();
  const { priceHeight } = useProductCardMetrics();
  const rhythm = leading[locale === 'en' ? 'latin' : 'devanagari'];
  const line = (size: number, kind: 'tight' | 'normal' = 'normal') =>
    Math.round(size * rhythm[kind]);
  const small = line(fontSize.sm);
  const body = line(fontSize.base);
  const quiet = line(fontSize.xs);

  /** One text line of the real page: a row as tall as the line, with a grey bar in its middle. */
  const bar = (key: string | number, height: number, width: `${number}%` | number) => (
    <View key={key} style={{ height, justifyContent: 'center' }}>
      <Skeleton width={width} height={Math.round(height * 0.6)} />
    </View>
  );
  // The picture stage is as wide as the screen, with no gutter and no card, and as tall as the real stage.
  const picture = Math.round(screen / STAGE_RATIO);
  // A size option: its border and padding, the size and the price (the price line sits two shorter than its tallest text), what
  // buying it saves when the page shows that, and the price per unit. The options of a row are as tall as the tallest.
  const saves =
    PDP_TRIAL.sizeSavings &&
    item.packs.some((pack) => pack.mrp !== undefined && pack.mrp > pack.price);
  const optionHeight =
    3 + space[3] + space[2] + small + 2 + (body - 2) + (saves ? 2 + quiet : 0) + 2 + small;
  // A fact chip is a quiet line over a strong one, with its padding.
  const chipHeight = quiet + small + space[2] * 2;
  // The rows after the title card, as tall as the real ones: the icon or the text, whichever is taller, with the card's padding.
  const rows = [
    Math.max(SHOP_ICON, small * 2 + (item.otherShops !== undefined ? body + 4 : 0)),
    ...(item.brand !== undefined ? [Math.max(SHOP_ICON, small * 2)] : []),
    Math.max(SHOP_ICON, small),
  ];
  const across = Math.ceil((screen - space[4]) / (RAIL_CARD_WIDTH + space[3]));
  const chipWidth = (chip: { label: string; value: string }) =>
    Math.round(
      Math.min(
        CHIP_MAX,
        Math.max(
          CHIP_MIN,
          space[3] * 2 + Math.max([...chip.label].length * 6, [...chip.value].length * 7.4),
        ),
      ),
    );
  const gutterSpan = (height: number) => height + space[4] * 2;

  return (
    // Only the first screenful is ever seen (the page cannot be scrolled while it loads), so the rest is cut off.
    <View style={styles.clip}>
      <SkeletonScope label={label}>
        <View style={styles.content}>
          <Skeleton height={picture} rounded={0} />

          <View style={styles.gutter}>
            <View style={[styles.card, styles.strip]}>
              {/* As the strip is: the chips slide inside what the button leaves, so they are clipped, never pushed out. */}
              <View style={styles.chipsRow}>
                <View style={styles.chipsScroll}>
                  {chips.map((chip, index) => (
                    <Skeleton
                      key={`${chip.label}-${index}`}
                      width={chipWidth(chip)}
                      height={chipHeight}
                      rounded={radius.md}
                    />
                  ))}
                </View>
                <Skeleton width={ACTION_WIDTH} height={chipHeight} rounded={radius.md} />
              </View>
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              {bar('meta', quiet + 6, '52%')}
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
                  <Skeleton width={96} height={priceHeight} rounded={radius.md} />
                  {item.mrp !== undefined && item.mrp > item.price ? bar('save', quiet, 92) : null}
                  {bar('taxes', quiet, 130)}
                </View>
                <Skeleton width={ADD_WIDTH} height={ADD_HEIGHT} rounded={radius.md} />
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
                      rows.reduce((sum, height) => sum + gutterSpan(height), 0) +
                      (rows.length - 1) +
                      2,
                    padding: 0,
                    gap: 0,
                  },
                ]}
              >
                <Skeleton
                  height={
                    rows.reduce((sum, height) => sum + gutterSpan(height), 0) + (rows.length - 1)
                  }
                  rounded={radius.lg}
                />
              </View>
            </View>
          ) : (
            rows.map((height, row) => (
              <View key={row} style={styles.gutter}>
                <View style={[styles.card, { height: gutterSpan(height) + 2, padding: 0, gap: 0 }]}>
                  <Skeleton height={gutterSpan(height)} rounded={radius.lg} />
                </View>
              </View>
            ))
          )}

          {rails.map((rail, index) => (
            <View key={index} style={styles.rail}>
              <View style={styles.head}>
                <RowTitleSkeleton title={rail.title} />
              </View>
              <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
                <View style={styles.cards}>
                  {rail.kind === 'brands'
                    ? Array.from({ length: BRANDS_SHOWN }, (_, tile) => (
                        <View key={tile} style={{ width: BRAND_TILE_WIDTH, gap: space[2] }}>
                          <Skeleton
                            width={BRAND_TILE_WIDTH}
                            height={BRAND_TILE_HEIGHT}
                            rounded={radius.md}
                          />
                          <SkeletonLine size="xs" width={52} align="center" />
                        </View>
                      ))
                    : Array.from(
                        { length: Math.max(1, Math.min(across, rail.items.length)) },
                        (_, card) => (
                          <ProductCardSkeleton
                            key={card}
                            width={RAIL_CARD_WIDTH}
                            {...rowCardContent(rail.items)}
                          />
                        ),
                      )}
                </View>
              </ScrollView>
              {rail.kind === 'cards' && rail.seeAll ? <SeeAllButtonSkeleton /> : null}
            </View>
          ))}
          <BrandFooter />
        </View>
      </SkeletonScope>
    </View>
  );
}
