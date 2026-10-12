import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  CategoryTile,
  LoadGate,
  RowTitle,
  SearchHeader,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  radius,
  space,
  useChromeReport,
  useScreenLoad,
  useSearchHeaderHeight,
} from '@/ui';
import { CART_ROOM } from './CartLayer';
import { useCart } from './CartProvider';
import { CATEGORY_GROUPS, tileRoute } from './categoryGroups';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useSearchHint } from './searchHint';
import { useCategoryGroups, type CategoryTile as TileData } from './useCategoryTiles';

const GAP = space[3];
/** The room between the header and the first group. */
const FIRST_GROUP_GAP = space[4];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[6] },
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
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    titleLine: { flex: 1 },
    label: { gap: 2 },
  });

/** Opens what a tile points at: Home on a category, or search for a word. */
function openTile(router: ReturnType<typeof useRouter>, tile: TileData): void {
  const route = tileRoute(tile.target, String(Date.now()));
  if (route.pathname === '/') router.navigate(route);
  else router.push(route);
}

/** How wide each placeholder name is, as a share of the tile: some names fill two lines, some only one, as the real ones do. */
const NAME_LINES = [['90%', '55%'], ['70%'], ['85%', '50%']] as const;

/** Groups of this many tiles, cut into rows of four: the same shapes as the first groups the tab really shows. */
const SKELETON_GROUPS: readonly number[] = CATEGORY_GROUPS.slice(0, 3).map(
  (group) => group.tiles.length,
);

/**
 * Grey blocks in the shape of the page: under the header, each group's title with its dotted line, then rows of four square tiles
 * with their one or two lines of name, in the same group sizes and spacing as the real tiles. The header is real, so the
 * skeleton starts below it and nothing moves when the tiles arrive.
 */
function CategoriesSkeleton({ top }: { top: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={[styles.content, { paddingTop: top + FIRST_GROUP_GAP }]}>
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
            <View style={styles.grid}>
              {Array.from({ length: count }, (_, tile) => (
                <View key={tile} style={[styles.cell, { gap: space[2] }]}>
                  <Skeleton aspectRatio={1} rounded={radius.lg} />
                  <View style={styles.label}>
                    {(NAME_LINES[(tile + group) % NAME_LINES.length] ?? []).map((width, line) => (
                      <SkeletonLine key={line} size="xs" width={width} align="center" />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

function CategoryGroups({ top, scrollY }: { top: number; scrollY: Animated.Value }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const report = useChromeReport();
  const groups = useCategoryGroups();

  if (groups.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: top }]}>
        <StatePanel
          icon="grid"
          title={t('categoriesTab.emptyTitle')}
          body={t('categoriesTab.emptyBody')}
        />
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        // The header lies over the top of the page, so the first group starts below it. At the bottom, room for the bottom
        // bar and the cart bar above it when it shows, so the last tiles can be read.
        {
          paddingTop: top + FIRST_GROUP_GAP,
          paddingBottom:
            insets.bottom + BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0) + space[6],
        },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
          report(event.nativeEvent.contentOffset.y);
        },
      })}
    >
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
    </Animated.ScrollView>
  );
}

/** The Categories tab is a tab and its list is kept: coming back to it never shows its skeleton again. */
const alwaysQuiet = (): boolean => true;

/**
 * The Categories tab: the kinds of things the shops sell, in a few groups of tiles four across, under a header that holds the
 * search. The name slides away as the page scrolls and the search stays pinned. Choosing a main category opens Home on it; a finer
 * tile opens search for its word. It has its loading, offline and failed states like every other page, and the header stays put
 * through them.
 */
export function CategoriesView() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const hint = useSearchHint();
  const top = useSearchHeaderHeight();
  const [scrollY] = useState(() => new Animated.Value(0));
  const load = useScreenLoad({
    loadMs: CATEGORIES_LOAD_MS,
    policy: CATEGORIES_POLICY,
    quietReturn: alwaysQuiet,
    backgroundReady: true,
  });

  return (
    <View style={styles.page}>
      <LoadGate load={load} skeleton={<CategoriesSkeleton top={top} />}>
        <CategoryGroups top={top} scrollY={scrollY} />
      </LoadGate>
      <SearchHeader
        title={t('nav.categories')}
        scrollY={scrollY}
        search={{
          placeholder: t('categoriesTab.searchHint'),
          hint,
          onPress: () => {
            router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
          },
        }}
      />
    </View>
  );
}
