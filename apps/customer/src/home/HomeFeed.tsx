import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import {
  AccentWash,
  BrandFooter,
  Icon,
  ProductRail,
  RowTitle,
  SeeAllButton,
  Text,
  radius,
  space,
} from '@/ui';
import { itemsInCategory, type Category } from './catalogueTree';
import { Bestsellers } from './Bestsellers';
import { DailyEssentials } from './DailyEssentials';
import { FreshToday } from './FreshToday';
import { HowWeCheckSheet } from './HowWeCheckSheet';
import { KnowYourShop } from './KnowYourShop';
import { PaymentStrip } from './PaymentStrip';
import { QuiboPromise } from './QuiboPromise';
import { useConditions } from './conditions';
import { knowShown } from './knowRules';
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

/** How long the loading skeleton shows after a category is chosen. */
const LOAD_MS = 200;

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  // The category rows, one under another with room between them: no divider line.
  rails: { gap: space[6], paddingBottom: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  // The opening of the page: the payment strip and Fresh today on one pistachio wash, strongest under the mosaic and gone by the end
  // of the module, so the two read as one section.
  opening: { paddingTop: space[3], paddingBottom: space[6] },
  // With "Know your shop" above it, Fresh today keeps a wash of its own.
  stripBlock: { paddingTop: space[3], paddingBottom: space[5] },
  freshBlock: { paddingBottom: space[6] },
  // Where a block's colour meets the page's, its top edge is curved (and the wash draws a fine edge along the curve).
  rounded: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' },
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
  const showSection = useHomeSectionShown();
  const { store } = useConditions();
  const showKnow = knowShown(store);
  // "How we check a shop" opens from the strip's chip and from the promise.
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
        {grid ? null : (
          <View style={[styles.stripBlock, styles.rounded]}>
            <AccentWash />
            <PaymentStrip onVisitedPress={openHow} ground="wash" />
          </View>
        )}
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

  const strip = (ground: 'night' | 'wash') => (
    <PaymentStrip onVisitedPress={openHow} ground={ground} />
  );

  return (
    <View>
      {showKnow ? (
        // "Know your shop" is the first thing under the header for everyone: the strip sits at the top of its stage, and Fresh today
        // keeps a wash of its own under it.
        <>
          <KnowYourShop lead={strip('night')} />
          <View style={[styles.freshBlock, styles.rounded]}>
            <AccentWash />
            <FreshToday onSeeAll={onSeeAll} />
          </View>
        </>
      ) : (
        <View style={[styles.opening, styles.rounded]}>
          <AccentWash />
          {strip('wash')}
          <FreshToday onSeeAll={onSeeAll} />
        </View>
      )}
      <View style={[styles.rails, styles.after]}>
        <Bestsellers onCategory={onSeeCategory} />
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
        {showKnow ? <QuiboPromise onHow={openHow} /> : null}
        <BrandFooter />
      </View>
      <HowWeCheckSheet open={howOpen} onClose={closeHow} />
    </View>
  );
});
