import { formatRupees, money } from '@quibo/contracts';
import { Fragment, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOrders } from '@/orders/OrdersProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  AccentWash,
  BrandFooter,
  BRAND_TILE_HEIGHT,
  BRAND_TILE_WIDTH,
  CategoryTileGridSkeleton,
  ProductCardSkeleton,
  RowTitleSkeleton,
  SectionRule,
  SeeAllButtonSkeleton,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  TAP_MIN,
  chipWidthOf,
  fontSize,
  radius,
  space,
} from '@/ui';
import { againItems, againPackIds } from './againRules';
import { bestsellerTiles } from './bestsellerTiles';
import { brandsOfItems, itemsOfBrand } from './brandPage';
import { CATEGORIES } from './catalogueTree';
import { rowCardContent } from './cardContent';
import { resolveCategories } from './categoryLists';
import { COMPARE_SCENE_HEIGHT } from './CompareScene';
import { useConditions } from './conditions';
import { DailyEssentialsSkeleton } from './DailyEssentials';
import { FEATURED_CARD_WIDTH, useFeaturedCardHeight } from './Featured';
import { FEATURED } from './featuredPicks';
import { FRESH_TABS, freshItems } from './fresh';
import { knowShown } from './knowRules';
import { HOME_RAIL_ORDER, anyCardNote, useHomeItems, useHomeListing } from './items';
import { RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import { PRICE_FILTERS } from './SmallPrices';
import { MOST_SHOWN, PRICE_TIERS, pickUnder, priceBand } from './priceTiers';
import { TRENDING_TABS, TRENDING_UNDER, inTwoRows, trendingItems } from './trendingRules';
import { useCategoryGroups } from './useCategoryGroups';
import { useViewed } from './useViewed';
import { viewedItems } from './viewed';
import type { HomeItem } from './items';

/** How many cards a grid shows when it is not known. */
const GRID_CARDS = 4;
const GRID_CARDS_MAX = 8;
/** The round tab of "Fresh today", and the filter chip of Trending and Small prices: as tall as the real ones. */
const TAB_CIRCLE = 56;
const CHIP_HEIGHT = 36;
/** The three price stores of Small prices: the amount over "and under", in a box. */
const STORE_HEIGHT = 81;
/** The help row. */
const HELP_HEIGHT = 56;
/** The word of a row title or a name is about this wide per letter, to size a grey bar for it. */
const LETTER = 6.6;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // A category's grid on Home, as `HomeFeed` lays it out: the title, the grid and "See all", 12 apart and 24 above and below.
    feed: { gap: space[3], paddingVertical: space[6] },
    // These mirror `HomeFeed`, the sections it stacks and the same 12 and 32 between them, so nothing jumps when the real sections
    // replace the grey ones.
    rails: { gap: space[8], paddingBottom: space[5] },
    after: { paddingTop: space[2] },
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    padTight: { paddingHorizontal: space[4], gap: space[1] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
    sectionTitle: { justifyContent: 'center', paddingHorizontal: space[4] },
    note: { marginHorizontal: space[4] },
    groups: { gap: space[6] },
    // Fresh today and Buy again sit on a wash with a curved top, as on the page.
    wash: {
      borderTopLeftRadius: radius.section,
      borderTopRightRadius: radius.section,
      overflow: 'hidden',
    },
    freshBlock: { paddingBottom: space[6] },
    opening: { paddingTop: space[3], paddingBottom: space[6] },
    washModule: { paddingTop: space[4], gap: space[3] },
    againModule: { paddingTop: space[6], paddingBottom: space[6], gap: space[3] },
    smallModule: { paddingTop: space[6], paddingBottom: space[6], gap: space[3] },
    // Know your shop's stage: its heading, the scene and the card, laid out as the page lays them out. The page draws them on a
    // dark stage; the skeleton keeps the same room in the page's grey and stays light.
    stage: { paddingTop: space[4], paddingBottom: space[6], gap: space[4] },
    knowModule: { paddingBottom: space[4] },
    head: { paddingHorizontal: space[4], gap: space[1] },
    // The one container: the scene across its top, then the title row and the two stores.
    nightCard: {
      marginHorizontal: space[4],
      borderWidth: 1,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    nightInside: { paddingHorizontal: space[3] },
    nightTitle: { minHeight: TAP_MIN, justifyContent: 'center' },
    nightStores: { flexDirection: 'row', gap: space[2], paddingBottom: space[3] },
    // The tab strip of Fresh today.
    tabs: { flexDirection: 'row', gap: space[1], paddingHorizontal: space[3], overflow: 'hidden' },
    tab: { width: 76, alignItems: 'center', gap: space[1], paddingTop: space[1] },
    tabName: { width: '100%', paddingBottom: space[2], alignItems: 'center' },
    lettered: { gap: space[1], paddingHorizontal: space[4] },
    letteredRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Bestsellers: three across, two rows.
    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: space[4] - space[3] / 2,
      rowGap: space[5],
    },
    tileCell: { width: '33.3333%', paddingHorizontal: space[3] / 2 },
    tile: { gap: space[3] },
    // The head of Continue browsing: the title and the Clear button.
    continueHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: TAP_MIN,
      paddingHorizontal: space[4],
    },
    stores: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    store: { flex: 1 },
    brandTile: { width: BRAND_TILE_WIDTH, alignItems: 'center', gap: space[2] },
    brandSelected: {
      paddingBottom: space[1],
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    brandStore: {
      marginHorizontal: space[4],
      paddingVertical: space[3],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
    },
    storePad: { paddingHorizontal: space[3] },
    storeHead: { paddingHorizontal: space[3], gap: 2 },
    storeRow: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[3] },
    // The quieter-times card and the promise: cards with a fine border, as on the page.
    quiet: {
      marginHorizontal: space[4],
      paddingVertical: space[3],
      gap: space[2],
      borderWidth: 1,
      borderColor: 'transparent',
    },
    quietHead: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      paddingHorizontal: space[3],
    },
    quietChips: {
      flexDirection: 'row',
      gap: space[2],
      paddingHorizontal: space[3],
      overflow: 'hidden',
    },
    promise: {
      marginHorizontal: space[4],
      padding: space[3],
      gap: space[3],
      borderWidth: 1,
      borderColor: 'transparent',
    },
    promiseHead: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    promiseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    promiseCell: {
      width: '48.5%',
      flexGrow: 1,
      flexDirection: 'row',
      gap: space[2],
      padding: space[2],
    },
    promiseWords: { flex: 1, minWidth: 0 },
  });

/** A row that does not scroll while it is only a skeleton. */
function StaticRow({ children }: { children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>{children}</View>
    </ScrollView>
  );
}

/** The "Fresh" and "today" of a lettered title: the big word, its sticker, and the line under it. */
function LetteredTitleSkeleton() {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.lettered}>
      <View style={styles.letteredRow}>
        <View style={{ width: 112 }}>
          <SkeletonLine size="3xl" tight />
        </View>
        <Skeleton width={84} height={40} rounded={radius.md} />
      </View>
      <SkeletonLine size="sm" width="72%" />
    </View>
  );
}

/** Fresh today's strip of round tabs, with the fine line under it. */
function IconTabsSkeleton() {
  const styles = useStyles(makeStyles);
  return (
    <View>
      <View style={styles.tabs}>
        {FRESH_TABS.map((tab) => (
          <View key={tab.id} style={styles.tab}>
            <Skeleton width={TAB_CIRCLE} height={TAB_CIRCLE} rounded={radius.full} />
            <View style={styles.tabName}>
              <SkeletonLine size="xs" width={52} align="center" />
            </View>
          </View>
        ))}
      </View>
      <Skeleton height={1} rounded={0} />
    </View>
  );
}

/**
 * What Home shows while items load. With "All" chosen it is the page's own sections, in the page's order and with its own
 * structure: Know your shop on its dark stage, Buy again for someone who has ordered, Fresh today on its wash, then the sections
 * and the thin rules between the groups, each with its real title's length, its real gaps and its real heights, so the page that
 * replaces it does not move. With one category chosen (or on a shop page, with `titled`) it is the two-column grid, as many
 * cards as the category has (up to eight). A soft shine sweeps across every block (see `SkeletonScope`).
 */
export function HomeSkeleton({
  label,
  grid = false,
  title,
  seeAll = false,
  items: gridItems,
}: {
  label: string;
  /** The two-column grid of a category chosen on Home, instead of the sections. */
  grid?: boolean;
  /** With the grid: the category's title, as its page has above the grid. */
  title?: string;
  /** With the grid: the "See all" button under it, as a category's page has. */
  seeAll?: boolean;
  /** With the grid: the items the page will list, so each card is as tall as its real one and the count is the page's own. */
  items?: readonly HomeItem[];
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const { store } = useConditions();
  const groups = useCategoryGroups();
  const stocked = groups.filter((group) => group.live.length > 0);
  const homeItems = useHomeItems();
  const items = useHomeListing();
  const featuredHeight = useFeaturedCardHeight();
  const orders = useOrders();
  const viewed = useViewed();

  if (grid) {
    const width = gridCardWidth(screen);
    const shown = (gridItems ?? []).slice(0, GRID_CARDS_MAX);
    const note = anyCardNote(gridItems ?? []);
    return (
      <SkeletonScope label={label}>
        <View style={styles.feed}>
          {title !== undefined ? (
            <View style={styles.pad}>
              <RowTitleSkeleton title={title} />
            </View>
          ) : null}
          <View style={styles.grid}>
            {(shown.length > 0 ? shown : Array.from({ length: GRID_CARDS }, () => undefined)).map(
              (item, index) => (
                <ProductCardSkeleton
                  key={item?.id ?? index}
                  width={width}
                  reserveNote={note}
                  {...(item !== undefined ? { content: rowCardContent([item]).content } : {})}
                />
              ),
            )}
          </View>
          {seeAll ? <SeeAllButtonSkeleton /> : null}
        </View>
      </SkeletonScope>
    );
  }

  const showKnow = knowShown(store);
  // How many cards of a row show before the screen's edge: as many as fill the width, never more than the row has.
  const across = Math.ceil((screen - space[4]) / (RAIL_CARD_WIDTH + space[3]));
  const card = (row: readonly HomeItem[], key: number) => (
    <ProductCardSkeleton key={key} width={RAIL_CARD_WIDTH} {...rowCardContent(row)} />
  );
  const railCards = (row: readonly HomeItem[]) => (
    <StaticRow>
      {Array.from({ length: Math.max(1, Math.min(across, row.length)) }, (_, index) =>
        card(row, index),
      )}
    </StaticRow>
  );
  // A row with a title above it and, when it has one, the "See all" button under it.
  const rail = (title: string, row: readonly HomeItem[], seeAllButton = true) => (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitleSkeleton title={title} />
      </View>
      {railCards(row)}
      {seeAllButton ? <SeeAllButtonSkeleton /> : null}
    </View>
  );

  // Buy again shows only for someone whose orders have things to buy again.
  const again = againItems(
    againPackIds(
      orders.orders.map((entry) => ({ status: entry.order.status, items: entry.order.items })),
      'last',
    ),
    homeItems,
  );
  const showAgain = showKnow && orders.loaded && again.length > 0;
  const fresh = freshItems('under', items);
  const continuing = viewedItems(viewed.ids, homeItems);
  // Bestsellers: the town's categories as tiles, each with the lines its own name takes at this width.
  const tiles = bestsellerTiles(homeItems, resolveCategories(homeItems, CATEGORIES));
  const tileWidth = (screen - 2 * (space[4] - space[3] / 2)) / 3 - space[3];
  const linesOf = (name: string): number =>
    Math.min(2, Math.max(1, Math.ceil(([...name].length * LETTER) / tileWidth)));
  // Small prices opens on its second store: as many cards as it will have.
  const opening = priceBand(1);
  const cheap = pickUnder(items, opening.upTo, { above: opening.above }).slice(0, MOST_SHOWN);
  const trending = trendingItems('all', items);
  // The brand store opens on the first brand: its items, out of stock ones left out, as the real store lists them.
  const firstBrand = brandsOfItems(homeItems)[0];
  const storeItems =
    firstBrand === undefined
      ? []
      : itemsOfBrand(homeItems, firstBrand.id).filter((item) => item.stock?.kind !== 'out');

  return (
    <SkeletonScope label={label}>
      {showKnow ? (
        <>
          {/* Know your shop: the dark stage, its heading, the scene and the card with the two kinds of store. */}
          <View style={styles.knowModule}>
            <View style={styles.stage}>
              <View style={styles.head}>
                <SkeletonLine size="xs" width={96} />
                <View>
                  <SkeletonLine size="2xl" tight width="88%" />
                  <SkeletonLine size="2xl" tight width="62%" />
                </View>
                <View>
                  <SkeletonLine size="sm" width="94%" />
                  <SkeletonLine size="sm" width="90%" />
                  <SkeletonLine size="sm" width="58%" />
                </View>
              </View>
              <View style={styles.nightCard}>
                <Skeleton height={COMPARE_SCENE_HEIGHT} rounded={0} />
                <View style={styles.nightInside}>
                  <View style={styles.nightTitle}>
                    <Skeleton width="56%" height={16} />
                  </View>
                  <View style={styles.nightStores}>
                    <View style={styles.store}>
                      <Skeleton height={70} rounded={radius.lg} />
                    </View>
                    <View style={styles.store}>
                      <Skeleton height={70} rounded={radius.lg} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {showAgain ? (
            <View style={[styles.againModule, styles.wash]}>
              <AccentWash tone="butter" />
              <LetteredTitleSkeleton />
              <View style={styles.pad}>
                <Skeleton height={TAP_MIN} rounded={radius.lg} />
              </View>
              {railCards(again)}
              <View style={styles.pad}>
                <Skeleton height={TAP_MIN} rounded={radius.lg} />
              </View>
            </View>
          ) : null}

          <View style={[styles.freshBlock, styles.wash]}>
            <AccentWash />
            <View style={styles.washModule}>
              <LetteredTitleSkeleton />
              <IconTabsSkeleton />
              {railCards(fresh)}
              <SeeAllButtonSkeleton />
            </View>
          </View>
        </>
      ) : (
        <View style={[styles.opening, styles.wash]}>
          <AccentWash />
          <View style={styles.washModule}>
            <LetteredTitleSkeleton />
            <IconTabsSkeleton />
            {railCards(fresh)}
            <SeeAllButtonSkeleton />
          </View>
        </View>
      )}

      <View style={[styles.rails, styles.after]}>
        {/* Bestsellers: three tiles across, two rows, each with its name under it. */}
        {tiles.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.pad}>
              <RowTitleSkeleton title={t('home.bestsellers.title')} />
            </View>
            <View style={styles.tileGrid}>
              {tiles.map((tile) => (
                <View key={tile.category.id} style={styles.tileCell}>
                  <View style={styles.tile}>
                    <Skeleton aspectRatio={1} rounded={radius.lg} />
                    {/* The name is one text of one or two lines, so its lines sit together under the picture. */}
                    <View>
                      {Array.from({ length: linesOf(t(tile.category.label)) }, (_, line) => (
                        <SkeletonLine
                          key={line}
                          size="xs"
                          width={line === 0 ? '84%' : '56%'}
                          align="center"
                        />
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {continuing.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.continueHead}>
              <View style={{ flex: 1 }}>
                <RowTitleSkeleton title={t('home.continue.title')} />
              </View>
              <Skeleton width={52} height={Math.round(fontSize.sm * 0.8)} />
            </View>
            {railCards(continuing)}
          </View>
        ) : null}

        {/* The categories: each group a title and its tiles, then "All categories". */}
        <View style={styles.groups}>
          {stocked.map((group) => (
            <View key={group.id} style={styles.section}>
              <View style={styles.pad}>
                <RowTitleSkeleton title={group.title} />
              </View>
              <CategoryTileGridSkeleton
                count={group.tiles.length + 1}
                names={[
                  group.tiles[0]?.label ?? '',
                  '',
                  ...group.tiles.slice(1).map((tile) => tile.label),
                ]}
              />
            </View>
          ))}
          <SeeAllButtonSkeleton />
        </View>

        <SectionRule />

        <DailyEssentialsSkeleton />

        {/* Small prices: on its lilac wash, the title, three stores, filter chips and the row. */}
        <View style={[styles.smallModule, styles.wash]}>
          <AccentWash tone="lilac" />
          <LetteredTitleSkeleton />
          <View style={styles.stores}>
            {PRICE_TIERS.map((tier) => (
              <View key={tier} style={styles.store}>
                <Skeleton height={STORE_HEIGHT} rounded={radius.lg} />
              </View>
            ))}
          </View>
          <StaticRow>
            {PRICE_FILTERS.map((entry) => (
              <Skeleton
                key={entry.key}
                width={chipWidthOf(t(entry.label))}
                height={CHIP_HEIGHT}
                rounded={radius.md}
              />
            ))}
          </StaticRow>
          <StaticRow>
            {Array.from({ length: Math.max(1, Math.min(across, cheap.length)) }, (_, card) => (
              <ProductCardSkeleton key={card} width={RAIL_CARD_WIDTH} {...rowCardContent(cheap)} />
            ))}
          </StaticRow>
        </View>

        {/* Trending: the title, the filter chips, two rows that scroll sideways, and "See all". */}
        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitleSkeleton title={t('home.trending.title')} />
          </View>
          <StaticRow>
            {TRENDING_TABS.map((entry) => (
              <Skeleton
                key={entry}
                width={chipWidthOf(
                  entry === 'under'
                    ? t('home.trending.under', { amount: formatRupees(money(TRENDING_UNDER)) })
                    : t(`home.trending.${entry}`),
                )}
                height={CHIP_HEIGHT}
                rounded={radius.md}
              />
            ))}
          </StaticRow>
          {inTwoRows(trending).map((row, index) =>
            row.length === 0 ? null : <Fragment key={index}>{railCards(row)}</Fragment>,
          )}
          <SeeAllButtonSkeleton />
        </View>

        {/* Shop by brand: the title and its line, the brand tiles, and the chosen brand's store. */}
        <View style={styles.section}>
          <View style={styles.padTight}>
            <RowTitleSkeleton title={t('home.shopByBrand.title')} />
            <SkeletonLine size="sm" width="52%" />
          </View>
          <StaticRow>
            {Array.from(
              { length: Math.ceil((screen - space[4]) / (BRAND_TILE_WIDTH + space[3])) },
              (_, tile) => (
                <View key={tile} style={[styles.brandTile, tile === 0 && styles.brandSelected]}>
                  <Skeleton
                    width={BRAND_TILE_WIDTH}
                    height={BRAND_TILE_HEIGHT}
                    rounded={radius.md}
                  />
                  <SkeletonLine size="xs" width={52} align="center" />
                </View>
              ),
            )}
          </StaticRow>
          <View style={styles.brandStore}>
            <View style={styles.storeHead}>
              <SkeletonLine size="xl" tight width="38%" />
              <SkeletonLine size="sm" width="24%" />
            </View>
            <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
              <View style={styles.storeRow}>
                {Array.from(
                  { length: Math.max(1, Math.min(storeItems.length, across - 1)) },
                  (_, index) => card(storeItems, index),
                )}
              </View>
            </ScrollView>
            <View style={styles.storePad}>
              <Skeleton height={TAP_MIN} rounded={radius.lg} />
            </View>
          </View>
        </View>

        {/* Featured this week: the title and the cards that swipe. */}
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

        <SectionRule />

        {HOME_RAIL_ORDER.map((key) => (
          <Fragment key={key}>
            {rail(
              t(`home.rails.${key}`),
              items.filter((item) => item.category === key),
            )}
          </Fragment>
        ))}

        <SectionRule />

        {/* Quieter times: the title and its button, the line, and the windows. */}
        <View style={styles.quiet}>
          <View style={styles.quietHead}>
            <Skeleton width={150} height={18} />
            <Skeleton width={110} height={16} />
          </View>
          <View style={styles.pad}>
            <SkeletonLine size="sm" width="96%" />
            <SkeletonLine size="sm" width="64%" />
          </View>
          <View style={styles.quietChips}>
            {Array.from({ length: 4 }, (_, chip) => (
              <Skeleton key={chip} width={104} height={49} rounded={radius.lg} />
            ))}
          </View>
        </View>

        {/* The Quibo promise: a title, "How we check", and four ticks in two rows. */}
        {showKnow ? (
          <View style={styles.promise}>
            <View style={styles.promiseHead}>
              <Skeleton width={160} height={20} />
              <Skeleton width={96} height={16} />
            </View>
            <View style={styles.promiseGrid}>
              {[2, 2, 1, 1].map((lines, cell) => (
                <View key={cell} style={styles.promiseCell}>
                  <Skeleton width={20} height={20} rounded={radius.full} />
                  <View style={styles.promiseWords}>
                    <SkeletonLine size="sm" tight width="86%" />
                    {lines === 2 ? <SkeletonLine size="sm" tight width="60%" /> : null}
                    <SkeletonLine size="xs" tight width="72%" />
                    {lines === 2 ? <SkeletonLine size="xs" tight width="48%" /> : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.note}>
          <Skeleton height={HELP_HEIGHT} rounded={radius.lg} />
        </View>

        {/* The closing is static, so it is the page's own, as it will be. */}
        <BrandFooter />
      </View>
    </SkeletonScope>
  );
}
