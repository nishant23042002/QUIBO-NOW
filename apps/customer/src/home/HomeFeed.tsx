import { Fragment, memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import {
  AccentWash,
  BrandFooter,
  Icon,
  ProductRail,
  RowTitle,
  SectionRule,
  SeeAllButton,
  Text,
  radius,
  space,
} from '@/ui';
import { itemsInCategory, type Category } from './catalogueTree';
import { Bestsellers } from './Bestsellers';
import { BrandStores } from './BrandStores';
import { BuyAgain } from './BuyAgain';
import { ContinueBrowsing } from './ContinueBrowsing';
import { DailyEssentials } from './DailyEssentials';
import { FreshToday } from './FreshToday';
import { HomeCategories } from './HomeCategories';
import { HowWeCheckSheet } from './HowWeCheckSheet';
import { KnowYourShop } from './KnowYourShop';
import { QuiboPromise } from './QuiboPromise';
import { useConditions } from './conditions';
import { knowShown } from './knowRules';
import { oneOfEachKind } from './product';
import { HomeSkeleton } from './HomeSkeleton';
import { Featured } from './Featured';
import { QuieterModule } from './QuieterModule';
import { ShelfBanner } from './ShelfBanner';
import { HelpRow } from './HelpRow';
import { Trending } from './Trending';
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

/** How long the loading skeleton shows after a category is chosen. */
const LOAD_MS = 200;
/** The banner sits between the shelves, before the one at this place. */
const BANNER_AFTER = 2;

const styles = StyleSheet.create({
  // A category's grid: its title, the grid and the "See all" button the same 12 apart as inside a row on Home.
  feed: { gap: space[3], paddingVertical: space[6] },
  // The sections, one under another with room between them. The gap is clearly larger than the 12 inside a section (and the 24
  // between the groups of one section), so each section reads as one block. A thin rule (`SectionRule`) marks only the
  // three places where one group of sections ends and another begins and no block of colour already does.
  rails: { gap: space[8], paddingBottom: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  // The opening of the page where there is no Know your shop (a dark-store town): Fresh today on a pistachio wash, strongest at the
  // top and gone by the end of the module.
  opening: { paddingTop: space[3], paddingBottom: space[6] },
  freshBlock: { paddingBottom: space[6] },
  // Where a block's colour meets the page's, its top edge is curved (and the wash draws a fine edge along the curve).
  rounded: {
    borderTopLeftRadius: radius.section,
    borderTopRightRadius: radius.section,
    overflow: 'hidden',
  },
  // Room between the opening and the rows after it, as the rows have between each other.
  after: { paddingTop: space[2] },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space[4] },
  empty: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[8],
    paddingHorizontal: space[4],
  },
});

interface HomeFeedProps {
  /** The category chosen in the header rail, or undefined for "All". */
  category: Category | undefined;
  onSeeAll: (category: ItemCategory) => void;
  /** The "See all" button under a category's page: the category's own screen. */
  onSeeCategory: (category: Category) => void;
}

/**
 * The items on Home.
 *
 * - "All" in the rail: the usual page, the sections and a swipeable row for each category with a "See all" button.
 * - A category chosen in the rail: its items, one of each kind, in a two-column grid, with a "See all" button to the category's own
 *   screen (every brand, filters and sort).
 *
 * ADD turns into a stepper in place. The quantities live in the cart, which the floating cart bar reads.
 */
export const HomeFeed = memo(function HomeFeed({
  category,
  onSeeAll,
  onSeeCategory,
}: HomeFeedProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { store } = useConditions();
  const showKnow = knowShown(store);
  // "How we check a shop" opens from the promise.
  const [howOpen, setHowOpen] = useState(false);
  const openHow = () => {
    setHowOpen(true);
  };
  const closeHow = () => {
    setHowOpen(false);
  };
  const { width: screen } = useWindowDimensions();
  const items = useHomeItems();
  const listing = useHomeListing();
  // Choosing another category shows the loading skeleton for a moment first, as real data would arrive.
  const view = category?.id ?? 'all';
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
  const grid = category !== undefined;
  // A category's items, one of each kind: the first listed of a kind, so a kind shows the brand that is listed first.
  const matching = category === undefined ? [] : oneOfEachKind(itemsInCategory(items, category));
  const title = category === undefined ? undefined : t(category.label);

  if (loading) {
    return (
      <View>
        <HomeSkeleton
          label={t('common.loading')}
          grid={grid}
          {...(title !== undefined ? { title } : {})}
          seeAll={category !== undefined}
          items={matching}
        />
      </View>
    );
  }

  if (grid) {
    const gridWidth = gridCardWidth(screen);
    if (matching.length === 0) {
      return (
        <View style={styles.empty}>
          <Icon name="search" color={colors.inkMuted} size={40} />
          <Text variant="heading" align="center">
            {t('home.categoryEmpty.title')}
          </Text>
          <Text color="inkMuted" align="center">
            {t('home.categoryEmpty.body')}
          </Text>
        </View>
      );
    }
    return (
      <View>
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
      {showKnow ? (
        // "Know your shop" is the first thing under the header for everyone, and Fresh today keeps a wash of its own under it.
        <>
          <KnowYourShop />
          <BuyAgain />
          <View style={[styles.freshBlock, styles.rounded]}>
            <AccentWash />
            <FreshToday onSeeAll={onSeeAll} />
          </View>
        </>
      ) : (
        <View style={[styles.opening, styles.rounded]}>
          <AccentWash />
          <FreshToday onSeeAll={onSeeAll} />
        </View>
      )}
      <View style={[styles.rails, styles.after]}>
        <Bestsellers onCategory={onSeeCategory} />
        <ContinueBrowsing />
        <HomeCategories />
        {/* The aisles end here; the routine (essentials, needs, small prices) begins. */}
        <SectionRule />
        <DailyEssentials />
        <ShopForNeed />
        <SmallPrices />
        <Trending />
        <BrandStores />
        <Featured onCategory={onSeeAll} />
        {/* What is on show ends here; the shelves, a row for each category, begin. */}
        <SectionRule />
        {HOME_RAIL_ORDER.map((key, index) => {
          const row = listing.filter((item) => item.category === key);
          // Cards in a row stay one height: room for the low-stock line only when one of them has it.
          const note = anyCardNote(row);
          return (
            <Fragment key={key}>
              {/* A banner breaks up the shelves after the second. */}
              {index === BANNER_AFTER ? <ShelfBanner onShop={onSeeAll} /> : null}
              <ProductRail
                title={t(`home.rails.${key}`)}
                seeAllLabel={t('home.rails.seeAll')}
                onSeeAll={() => {
                  onSeeAll(key);
                }}
              >
                {row.map((item) => tile(item, RAIL_CARD_WIDTH, note))}
              </ProductRail>
            </Fragment>
          );
        })}
        {/* The shelves end here; the closing begins. */}
        <SectionRule />
        {/* Quieter delivery times sit near the end: they are a saving to find once the shopper has what they came for. */}
        <QuieterModule />
        {showKnow ? <QuiboPromise onHow={openHow} /> : null}
        <HelpRow />
        <BrandFooter />
      </View>
      <HowWeCheckSheet open={howOpen} onClose={closeHow} />
    </View>
  );
});
