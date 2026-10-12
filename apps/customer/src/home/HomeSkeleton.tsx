import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  CategoryTileGridSkeleton,
  ProductCardSkeleton,
  RowTitleSkeleton,
  BRAND_TILE_HEIGHT,
  BRAND_TILE_WIDTH,
  SeeAllButtonSkeleton,
  Skeleton,
  SkeletonScope,
  fontSize,
  leading,
  radius,
  space,
} from '@/ui';
import { FEATURED_CARD_WIDTH, useFeaturedCardHeight } from './Featured';
import { FEATURED } from './featuredPicks';
import { HOME_RAIL_ORDER, anyCardNote, useHomeListing } from './items';
import { RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import { MOST_SHOWN, PRICE_TIERS, pickUnder } from './priceTiers';
import { QUIETER_NOTE_HEIGHT } from './QuieterNote';
import type { HomeItem } from './items';
import { useHomeCategoryTiles } from './useCategoryTiles';

/** How many cards of a rail show before the edge of the screen, and how many a grid shows when it is not known. */
const RAIL_CARDS = 3;
const GRID_CARDS = 4;
const GRID_CARDS_MAX = 8;
/** How many brand tiles show before the edge of the screen. */
const BRAND_TILES = 4;
/** The chip of the price tabs: as tall as the real one, about as wide as "Under ₹30". */
const CHIP_WIDTH = 96;
const CHIP_HEIGHT = 36;

// These mirror `HomeFeed`, `ProductRail` and the sections Home keeps above the rows: the same gaps, gutters and heights, so nothing
// jumps when the real sections replace the grey ones.
const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  rails: { gap: space[6], paddingVertical: space[5] },
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  tabs: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  sectionTitle: { justifyContent: 'center', paddingHorizontal: space[4] },
  note: { marginHorizontal: space[4] },
});

/** A row that does not scroll while it is only a skeleton. */
function StaticRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>{children}</View>
    </ScrollView>
  );
}

/**
 * What Home shows while items load. With "All" chosen it is the page's own sections in order (Shop by category with its eight named
 * tiles, the shops strip, Small prices with its three tabs, Featured, a row under each category's title, the quieter-times note),
 * each with its real title's length and the same gaps and heights. With one category chosen (or on a shop page, with `titled`) it
 * is the two-column grid, as many cards as the category has (up to eight). The cards are `ProductCardSkeleton`, drawn from the
 * same measurements as the real cards.
 */
export function HomeSkeleton({
  label,
  grid = false,
  titled = false,
  cards,
}: {
  label: string;
  /** The two-column grid instead of the sections. */
  grid?: boolean;
  /** With the grid: a section title above it, as a shop page has. */
  titled?: boolean;
  /** With the grid: how many cards the page will have, when that is known. */
  cards?: number;
}) {
  const { t, locale } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const tiles = useHomeCategoryTiles();
  const items = useHomeListing();
  const featuredHeight = useFeaturedCardHeight();
  // A brand tile's name is one line of the caption text style, under its mark.
  const brandNameLine = Math.round(
    fontSize.xs * leading[locale === 'en' ? 'latin' : 'devanagari'].normal,
  );
  // As tall as the section title it stands in for (the `subheading` text style), so the cards start at the same place.
  const titleLine = Math.round(
    fontSize.lg * leading[locale === 'en' ? 'latin' : 'devanagari'].tight,
  );

  if (grid) {
    const width = gridCardWidth(screen);
    const count = cards === undefined ? GRID_CARDS : Math.min(GRID_CARDS_MAX, Math.max(2, cards));
    return (
      <SkeletonScope label={label}>
        <View style={titled ? { gap: space[3] } : styles.feed}>
          {titled ? (
            <View style={[styles.sectionTitle, { height: titleLine }]}>
              <Skeleton width={150} height={20} />
            </View>
          ) : null}
          <View style={styles.grid}>
            {Array.from({ length: count }, (_, index) => (
              <ProductCardSkeleton key={index} width={width} />
            ))}
          </View>
        </View>
      </SkeletonScope>
    );
  }

  // A row of the cards the real row will hold (as many as it has, up to a screenful), tall as the real row: room for the low-stock
  // line only when one of them has it.
  const railCards = (row: readonly HomeItem[]) => (
    <StaticRow>
      {Array.from({ length: Math.min(RAIL_CARDS, row.length) }, (_, card) => (
        <ProductCardSkeleton key={card} width={RAIL_CARD_WIDTH} reserveNote={anyCardNote(row)} />
      ))}
    </StaticRow>
  );
  const cheap = pickUnder(items, PRICE_TIERS[1] ?? 0).slice(0, MOST_SHOWN);

  return (
    <SkeletonScope label={label}>
      <View style={styles.rails}>
        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitleSkeleton title={t('home.shopByCategory.title')} />
          </View>
          <CategoryTileGridSkeleton count={tiles.length} names={tiles.map((tile) => tile.label)} />
          <SeeAllButtonSkeleton />
        </View>

        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitleSkeleton title={t('home.shopByBrand.title')} />
          </View>
          <StaticRow>
            {Array.from({ length: BRAND_TILES }, (_, tile) => (
              <Skeleton
                key={tile}
                width={BRAND_TILE_WIDTH}
                height={BRAND_TILE_HEIGHT + space[2] + brandNameLine}
                rounded={radius.md}
              />
            ))}
          </StaticRow>
        </View>

        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitleSkeleton title={t('home.smallPrices.title')} />
          </View>
          <View style={styles.tabs}>
            {PRICE_TIERS.map((tier) => (
              <Skeleton key={tier} width={CHIP_WIDTH} height={CHIP_HEIGHT} rounded={radius.full} />
            ))}
          </View>
          {railCards(cheap)}
        </View>

        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitleSkeleton title={t('home.featured.title')} />
          </View>
          <StaticRow>
            {FEATURED.map((pick) => (
              <Skeleton
                key={pick.title}
                width={FEATURED_CARD_WIDTH}
                height={featuredHeight}
                rounded={radius.md}
              />
            ))}
          </StaticRow>
        </View>

        {HOME_RAIL_ORDER.map((key) => (
          <View key={key} style={styles.section}>
            <View style={styles.pad}>
              <RowTitleSkeleton title={t(`home.rails.${key}`)} />
            </View>
            {railCards(items.filter((item) => item.category === key))}
            <SeeAllButtonSkeleton />
          </View>
        ))}

        <View style={styles.note}>
          <Skeleton height={QUIETER_NOTE_HEIGHT} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}
