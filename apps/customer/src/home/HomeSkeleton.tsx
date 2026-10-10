import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ProductCardSkeleton, Skeleton, SkeletonScope, fontSize, leading, space } from '@/ui';
import { RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';

/** The widths of the five rails' titles, so they do not all look alike. */
const RAIL_TITLES = [150, 130, 70, 160, 110] as const;
/** How many cards of a rail show before the edge of the screen, and how many a grid shows. */
const RAIL_CARDS = 3;
const GRID_CARDS = 4;
/** The rail's title row is as tall as its "See all" button. */
const HEAD_HEIGHT = space[10];

// These mirror `HomeFeed` and `ProductRail`: the same gaps, gutters and row heights, so nothing jumps when
// the real cards replace the grey ones.
const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  rails: { gap: space[6], paddingVertical: space[5] },
  rail: { gap: space[3] },
  head: {
    height: HEAD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    paddingHorizontal: space[4],
  },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  sectionTitle: { justifyContent: 'center', paddingHorizontal: space[4] },
});

/**
 * What Home shows while items load. With "All" chosen it is a row of cards under each category's title, as the
 * feed has them; with one category chosen (or on a shop page, with `titled`) it is the two-column grid. The cards
 * are `ProductCardSkeleton`, drawn from the same measurements as the real cards.
 */
export function HomeSkeleton({
  label,
  grid = false,
  titled = false,
}: {
  label: string;
  /** The two-column grid instead of the category rows. */
  grid?: boolean;
  /** With the grid: a section title above it, as a shop page has. */
  titled?: boolean;
}) {
  const { width: screen } = useWindowDimensions();
  const { locale } = useLanguage();
  // As tall as the section title it stands in for (the `subheading` text style), so the cards start at the same place.
  const titleLine = Math.round(
    fontSize.lg * leading[locale === 'en' ? 'latin' : 'devanagari'].tight,
  );

  if (grid) {
    const width = gridCardWidth(screen);
    return (
      <SkeletonScope label={label}>
        <View style={titled ? { gap: space[3] } : styles.feed}>
          {titled ? (
            <View style={[styles.sectionTitle, { height: titleLine }]}>
              <Skeleton width={150} height={20} />
            </View>
          ) : null}
          <View style={styles.grid}>
            {Array.from({ length: GRID_CARDS }, (_, index) => (
              <ProductCardSkeleton key={index} width={width} />
            ))}
          </View>
        </View>
      </SkeletonScope>
    );
  }

  return (
    <SkeletonScope label={label}>
      <View style={styles.rails}>
        {RAIL_TITLES.map((title) => (
          <View key={title} style={styles.rail}>
            <View style={styles.head}>
              <Skeleton width={title} height={20} />
              <Skeleton width={56} height={16} />
            </View>
            <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {Array.from({ length: RAIL_CARDS }, (_, card) => (
                  <ProductCardSkeleton key={card} width={RAIL_CARD_WIDTH} />
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}
