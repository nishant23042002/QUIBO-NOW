import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BrandFooter, Icon, ProductRail, RowTitle, SeeAllButton, Text, space } from '@/ui';
import { itemsInCategory, type Category } from './catalogueTree';
import { matchesIntent, type IntentId } from './homeIntents';
import { DailyEssentials } from './DailyEssentials';
import { IntentChips } from './IntentChips';
import { oneOfEachKind } from './product';
import { HomeSkeleton } from './HomeSkeleton';
import { useHomeSectionShown } from './homeSections';
import { Featured } from './Featured';
import { QuieterNote } from './QuieterNote';
import { ShopByBrand } from './ShopByBrand';
import { ShopByCategory } from './ShopByCategory';
import { ShopForNeed } from './ShopForNeed';
import { SmallPrices } from './SmallPrices';
import { ItemTile, RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import {
  HOME_RAIL_ORDER,
  anyCardNote,
  useHomeItems,
  useHomeListing,
  type HomeItem,
  type ItemCategory,
} from './items';

/** How long the loading skeleton shows after a chip or a category is chosen. */
const LOAD_MS = 200;

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  // The category rows, one under another with room between them: no divider line.
  rails: { gap: space[6], paddingVertical: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  // The chips sit under the banner, above whichever page is showing.
  chips: { paddingTop: space[4] },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space[4] },
  empty: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[8],
    paddingHorizontal: space[4],
  },
});

interface HomeFeedProps {
  /** The chosen chip. "all" is the page as it is; any other narrows it to the items that suit it, in a grid. */
  intent: IntentId;
  onIntentChange: (intent: IntentId) => void;
  /** The category chosen in the header rail, or undefined for "All". */
  category: Category | undefined;
  onSeeAll: (category: ItemCategory) => void;
  /** The "See all" button under a category's page: the category's own screen. */
  onSeeCategory: (category: Category) => void;
}

/**
 * The items on Home, under a row of chips (All, Quick, Offers, Under ₹50, Veg).
 *
 * - "All" in the rail with the chip All: the usual page, a swipeable row for each category with a "See all" button.
 * - "All" in the rail with another chip: the items that suit it, from every shelf, one of each kind, in a two-column grid.
 * - A category chosen in the rail: its items, one of each kind, in the same grid, narrowed by the chip when one is chosen, with a
 *   "See all" button to the category's own screen (every brand, filters and sort).
 *
 * ADD turns into a stepper in place. The quantities live in the cart, which the floating cart bar reads.
 */
export const HomeFeed = memo(function HomeFeed({
  intent,
  onIntentChange,
  category,
  onSeeAll,
  onSeeCategory,
}: HomeFeedProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const showSection = useHomeSectionShown();
  const { width: screen } = useWindowDimensions();
  const items = useHomeItems();
  const listing = useHomeListing();
  // Choosing another chip or category shows the loading skeleton for a moment first, as real data would arrive.
  const view = `${category?.id ?? 'all'}:${intent}`;
  const [shown, setShown] = useState(view);
  useEffect(() => {
    if (shown === view) return undefined;
    const timer = setTimeout(() => {
      setShown(view);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [view, shown]);
  const loading = shown !== view;

  const tile = (item: HomeItem, width: number, reserveNote?: boolean) => (
    <ItemTile
      key={item.id}
      item={item}
      width={width}
      {...(reserveNote !== undefined ? { reserveNote } : {})}
    />
  );
  const grid = category !== undefined || intent !== 'all';
  // The items that suit the chip, one of each kind: the first listed of a kind that suits it, so an offer shows the brand that has it.
  // A category narrows the pool to its own shelves first.
  const pool = category === undefined ? items : itemsInCategory(items, category);
  const matching = grid ? oneOfEachKind(pool.filter((item) => matchesIntent(item, intent))) : [];
  const title = category === undefined ? undefined : t(category.label);

  const chips = (
    <View style={styles.chips}>
      <IntentChips selected={intent} onSelect={onIntentChange} label={t('home.intents.label')} />
    </View>
  );

  if (loading) {
    return (
      <View>
        {chips}
        <HomeSkeleton
          label={t('common.loading')}
          grid={grid}
          titled={category !== undefined}
          seeAll={category !== undefined}
          cards={matching.length}
        />
      </View>
    );
  }

  if (grid) {
    const gridWidth = gridCardWidth(screen);
    if (matching.length === 0) {
      return (
        <View>
          {chips}
          <View style={styles.empty}>
            <Icon name="search" color={colors.inkMuted} size={40} />
            <Text variant="heading" align="center">
              {t('home.intents.empty.title')}
            </Text>
            <Text color="inkMuted" align="center">
              {t('home.intents.empty.body')}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View>
        {chips}
        <View style={styles.feed}>
          {title !== undefined ? (
            <View style={styles.head}>
              <RowTitle title={title} />
            </View>
          ) : null}
          <View style={styles.grid}>{matching.map((item) => tile(item, gridWidth))}</View>
          {category !== undefined && title !== undefined ? (
            <SeeAllButton
              label={t('home.rails.seeAll')}
              title={title}
              onPress={() => {
                onSeeCategory(category);
              }}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View>
      {chips}
      <View style={styles.rails}>
        <ShopByCategory />
        <DailyEssentials />
        {showSection('need') ? <ShopForNeed /> : null}
        {showSection('small') ? <SmallPrices /> : null}
        {showSection('featured') ? <Featured onCategory={onSeeAll} /> : null}
        <ShopByBrand />
        {HOME_RAIL_ORDER.map((key) => {
          const row = listing.filter((item) => item.category === key);
          // Cards in a row stay one height: room for the low-stock line only when one of them has it.
          const note = anyCardNote(row);
          return (
            <ProductRail
              key={key}
              title={t(`home.rails.${key}`)}
              seeAllLabel={t('home.rails.seeAll')}
              onSeeAll={() => {
                onSeeAll(key);
              }}
            >
              {row.map((item) => tile(item, RAIL_CARD_WIDTH, note))}
            </ProductRail>
          );
        })}
        <QuieterNote />
        <BrandFooter />
      </View>
    </View>
  );
});
