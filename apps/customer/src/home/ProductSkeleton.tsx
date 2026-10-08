import { Fragment } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  GALLERY_RATIO,
  ProductCardSkeleton,
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
import { makePageStyles } from './productLayout';

const THUMB = 52;
const THUMBS = 3;
const TILE_ICON = 36;
const TILE_PAD = space[3];
const TILE_GAP = space[1];
const OPTION_MIN = 104;
const SHOP_ICON = 40;
const PILL = 40;
const RAIL_CARDS = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ...makePageStyles(c),
    picture: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    clip: { flex: 1, overflow: 'hidden' },
    thumbs: { flexDirection: 'row', gap: space[2], padding: space[3] },
    row: { justifyContent: 'center' },
    pair: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: { flexGrow: 1, flexBasis: OPTION_MIN, minWidth: OPTION_MIN },
    tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    tile: { flexGrow: 1, flexBasis: '47%' },
    pillRow: { alignItems: 'center' },
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
 * gap between blocks, and inside each card the same lines at the same heights (the gallery's picture and thumbnail
 * strip, the title card, the size picker, the trust tiles, the highlights and information, the shop card and the
 * rows of items), so nothing moves when the real page replaces it. It follows the product it stands in for:
 * the strip only when it has several pictures, the size card only when it has several sizes.
 */
export function ProductSkeleton({
  label,
  item,
  rails,
}: {
  label: string;
  item: HomeItem;
  /** The rows of other items the real page ends with, each saying whether it has a "See all" link. */
  rails: readonly boolean[];
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
  /** Several lines of one paragraph; the last is shorter, like the end of a paragraph. */
  const paragraph = (key: string, lines: number, height: number) => (
    <View key={key}>
      {Array.from({ length: lines }, (_, index) =>
        bar(index, height, index === lines - 1 ? '60%' : '100%'),
      )}
    </View>
  );

  const picture = Math.round((width - space[3] * 2) / GALLERY_RATIO);
  const optionHeight = space[3] + space[2] + 3 + small * 2 + body + 4;
  const tileRows = [
    { title: 2, body: 2 },
    { title: 2, body: 3 },
  ];

  return (
    // Only the first screenful is ever seen (the page cannot be scrolled while it loads), so the rest is cut off.
    <View style={styles.clip}>
      <SkeletonScope label={label}>
        <View style={styles.content}>
          <View style={styles.gutter}>
            <View style={styles.picture}>
              <Skeleton height={picture} rounded={0} />
              {item.images.length > 1 ? (
                <View style={styles.thumbs}>
                  {Array.from({ length: Math.min(item.images.length, THUMBS) }, (_, index) => (
                    <Skeleton key={index} width={THUMB} height={THUMB} rounded={radius.md} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={styles.card}>
              {bar('diet', small, 90)}
              {bar('name', line(fontSize['3xl'], 'tight'), '70%')}
              {bar('net', body, '50%')}
              <View style={styles.pair}>
                <Skeleton width={84} height={priceHeight - 4} rounded={radius.md} />
                {item.mrp !== undefined && item.mrp > item.price ? (
                  <View style={{ flex: 1 }}>{bar('save', priceHeight - 4, '70%')}</View>
                ) : null}
              </View>
              {bar('taxes', small, '42%')}
              {item.stock?.kind === 'low' ? bar('stock', small, '40%') : null}
              {item.quickLabel !== undefined ? bar('quick', small, '55%') : null}
            </View>
          </View>

          {item.packs.length > 1 ? (
            <View style={styles.gutter}>
              <View style={styles.card}>
                {bar('size', small, 90)}
                <View style={styles.options}>
                  {item.packs.map((pack) => (
                    <View key={pack.id} style={styles.option}>
                      <Skeleton height={optionHeight} rounded={radius.lg} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.gutter}>
            <View style={styles.card}>
              <View style={styles.tiles}>
                {tileRows.flatMap((rowSpec, index) =>
                  [0, 1].map((side) => (
                    <View key={`${index}-${side}`} style={styles.tile}>
                      <Skeleton
                        height={
                          TILE_PAD * 2 +
                          TILE_ICON +
                          TILE_GAP * 2 +
                          small * rowSpec.title +
                          small * rowSpec.body
                        }
                        rounded={radius.lg}
                      />
                    </View>
                  )),
                )}
              </View>
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              {bar('highlights', line(fontSize.lg, 'tight'), '38%')}
              {[1, 1, 2, 1].map((lines, index) => (
                <View key={index} style={styles.pair}>
                  <View style={{ width: '32%' }}>{bar('k', small, '68%')}</View>
                  <View style={{ flex: 1 }}>{paragraph('v', lines, body)}</View>
                </View>
              ))}
              <View style={styles.pillRow}>
                <Skeleton width={120} height={PILL} rounded={radius.full} />
              </View>
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              {bar('information', line(fontSize.lg, 'tight'), '42%')}
              {[3, 2, 3].map((lines, index) => (
                <View key={index} style={styles.pair}>
                  <View style={{ width: '32%' }}>{bar('k', small, '80%')}</View>
                  <View style={{ flex: 1 }}>{paragraph('v', lines, body)}</View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.gutter}>
            <View
              style={[styles.card, { height: SHOP_ICON + space[4] * 2 + 2, padding: 0, gap: 0 }]}
            >
              <Skeleton height={SHOP_ICON + space[4] * 2} rounded={radius.lg} />
            </View>
          </View>

          {rails.map((seeAll, rail) => (
            <Fragment key={rail}>
              <View style={styles.rail}>
                <View style={styles.head}>
                  <Skeleton width={rail === 0 ? 180 : 150} height={20} />
                  {seeAll ? <Skeleton width={56} height={16} /> : null}
                </View>
                <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
                  <View style={styles.cards}>
                    {Array.from({ length: RAIL_CARDS }, (_, card) => (
                      <ProductCardSkeleton key={card} width={RAIL_CARD_WIDTH} />
                    ))}
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
