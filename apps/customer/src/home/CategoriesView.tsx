import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  BrandFooter,
  CategoryTileGrid,
  CategoryTileGridSkeleton,
  LoadGate,
  RowTitle,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  TabHeader,
  radius,
  space,
  useChromeReport,
  useScreenLoad,
} from '@/ui';
import { CART_ROOM } from './CartLayer';
import { useCart } from './CartProvider';
import { CATEGORY_GROUPS, tileRoute } from './categoryGroups';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useTabHeaderProps } from './useTabHeader';
import { useCategoryGroups, type CategoryTile as TileData } from './useCategoryTiles';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[6], paddingTop: space[4] },
    pad: { paddingHorizontal: space[4] },
    group: { gap: space[3] },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 360 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    titleLine: { flex: 1 },
  });

/** Opens what a tile points at: Home on a category, or search for a word. */
function openTile(router: ReturnType<typeof useRouter>, tile: TileData): void {
  const route = tileRoute(tile.target, String(Date.now()));
  if (route.pathname === '/') router.navigate(route);
  else router.push(route);
}

/** Groups of this many tiles, cut into rows of four: the same shapes as the first groups the tab really shows. */
const SKELETON_GROUPS: readonly number[] = CATEGORY_GROUPS.slice(0, 3).map(
  (group) => group.tiles.length,
);

/**
 * Grey blocks in the shape of the page: each group's title with its dotted line, then rows of four square tiles with their one
 * or two lines of name, in the same group sizes and spacing as the real tiles. The header is real and stays put, so the skeleton
 * is only the page under it and nothing moves when the tiles arrive.
 */
function CategoriesSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {SKELETON_GROUPS.map((count, group) => (
          <View key={group} style={styles.group}>
            <View style={[styles.pad, styles.titleRow]}>
              <View style={{ width: group % 2 === 0 ? '46%' : '38%' }}>
                <SkeletonLine size="lg" tight />
              </View>
              <View style={styles.titleLine}>
                <Skeleton height={2} rounded={radius.full} />
              </View>
            </View>
            <CategoryTileGridSkeleton count={count} shift={group} />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

function CategoryGroups() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const groups = useCategoryGroups();

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <StatePanel
          icon="grid"
          title={t('categoriesTab.emptyTitle')}
          body={t('categoriesTab.emptyBody')}
        />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <View style={styles.pad}>
            <RowTitle title={group.title} />
          </View>
          <CategoryTileGrid
            tiles={group.tiles}
            onPress={(index) => {
              const tile = group.tiles[index];
              if (tile !== undefined) openTile(router, tile);
            }}
          />
        </View>
      ))}
      <BrandFooter />
    </View>
  );
}

/** The Categories tab is a tab and its list is kept: coming back to it never shows its skeleton again. */
const alwaysQuiet = (): boolean => true;

/**
 * The Categories tab: the kinds of things the shops sell, in a few groups of tiles four across, under the same header Home wears
 * (delivery promise, address, profile, and the search that stays pinned as the page scrolls). Choosing a main category opens Home
 * on it; a finer tile opens search for its word. It has its loading, offline and failed states like every other page, and the
 * header stays put through them.
 */
export function CategoriesView() {
  const header = useTabHeaderProps();
  const reportScroll = useChromeReport();
  const cart = useCart();
  const load = useScreenLoad({
    loadMs: CATEGORIES_LOAD_MS,
    policy: CATEGORIES_POLICY,
    quietReturn: alwaysQuiet,
    backgroundReady: true,
  });

  return (
    <TabHeader
      {...header}
      onScrollY={reportScroll}
      // Room under the last tiles for the bottom bar, and for the cart bar above it when it shows.
      bottomSpace={BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0)}
    >
      <LoadGate inFlow load={load} skeleton={<CategoriesSkeleton />}>
        <CategoryGroups />
      </LoadGate>
    </TabHeader>
  );
}
