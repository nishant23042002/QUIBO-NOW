import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  CategoryTile,
  LoadGate,
  RowTitle,
  SearchBar,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  radius,
  space,
  useChromeScroll,
  useScreenLoad,
} from '@/ui';
import { CART_ROOM } from './CartLayer';
import { useCart } from './CartProvider';
import { tileRoute } from './categoryGroups';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useCategoryGroups, type CategoryTile as TileData } from './useCategoryTiles';

/** Four tiles across, as on Home. */
const COLUMNS = 4;
const GAP = space[3];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[6], paddingTop: space[4] },
    pad: { paddingHorizontal: space[4] },
    group: { gap: space[3] },
    // Four equal cells to a row, by percentage: a cell's own side padding makes the gap between tiles, so the row always fits
    // the width the phone gives it.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: space[3],
      paddingHorizontal: space[4] - GAP / 2,
    },
    cell: { width: '25%', paddingHorizontal: GAP / 2 },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { flex: 1, minHeight: 300 },
  });

/** Opens what a tile points at: Home on a category, or search for a word. */
function openTile(router: ReturnType<typeof useRouter>, tile: TileData): void {
  const route = tileRoute(tile.target, String(Date.now()));
  if (route.pathname === '/') router.navigate(route);
  else router.push(route);
}

/** About how tall a tile's picture is, for the loading blocks only: the real tiles are sized by their cell. */
function tileHeight(screen: number): number {
  return Math.floor((screen - space[4] * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
}

/** Grey blocks in the shape of the groups: a title line over a row of four tiles, twice, so nothing jumps when the tiles arrive. */
function CategoriesSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const size = tileHeight(width);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {[0, 1].map((group) => (
          <View key={group} style={styles.group}>
            <View style={styles.pad}>
              <SkeletonLine size="base" width="45%" />
            </View>
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((tile) => (
                <View key={tile} style={[styles.cell, { gap: space[2] }]}>
                  <Skeleton height={size} rounded={radius.lg} />
                  <SkeletonLine size="sm" width="80%" />
                </View>
              ))}
            </View>
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
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const scroll = useChromeScroll();
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
    <ScrollView
      {...scroll}
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        // Room for the bottom bar, and for the cart bar above it when it shows, so the last tiles can be read.
        {
          paddingBottom:
            insets.bottom + BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0) + space[6],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pad}>
        <SearchBar
          placeholder={t('categoriesTab.searchHint')}
          onPress={() => {
            router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
          }}
        />
      </View>
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <View style={styles.pad}>
            <RowTitle title={group.title} />
          </View>
          <View style={styles.grid}>
            {group.tiles.map((tile) => (
              <View key={tile.label} style={styles.cell}>
                <CategoryTile
                  label={tile.label}
                  emoji={tile.emoji}
                  tint={tile.tint}
                  onPress={() => {
                    openTile(router, tile);
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * The Categories tab: the kinds of things the shops sell, in a few groups of tiles four across. Choosing a main category opens
 * Home on it; a finer tile opens search for its word. It has its loading, offline and failed states like every other page.
 */
export function CategoriesView() {
  const load = useScreenLoad({ loadMs: CATEGORIES_LOAD_MS, policy: CATEGORIES_POLICY });
  return (
    <LoadGate load={load} skeleton={<CategoriesSkeleton />}>
      <CategoryGroups />
    </LoadGate>
  );
}
