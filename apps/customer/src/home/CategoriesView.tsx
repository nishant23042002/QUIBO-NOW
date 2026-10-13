import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  RowTitleSkeleton,
  SearchField,
  Skeleton,
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
import { tileRoute } from './categoryGroups';
import { categoryRoute } from './categoryLists';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useCategoryBrowse } from './useCategoryBrowse';
import { useTabHeaderProps } from './useTabHeader';

/**
 * The field to find a category by name appears only once the list is long enough to need one. The header's search is pinned and
 * finds products, so with a short list a second field would only repeat it.
 */
export const FIND_FROM = 24;

/** The field is as tall as the search field of the search screen. */
const FIELD_HEIGHT = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[6], paddingTop: space[4] },
    pad: { paddingHorizontal: space[4] },
    // The rows of a group's categories sit a little closer to each other than the groups do.
    categories: { gap: space[4] },
    // The field sits on the page's colour with a hairline, so it reads as a field and not as a hole.
    field: { flexDirection: 'row', borderRadius: radius.full, borderWidth: 1, borderColor: c.line },
    group: { gap: space[3] },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 360 },
  });

/**
 * Grey blocks in the shape of the page: the field when there is one, then each group's title as long as the real one with its dotted
 * line, each category's picture and name, and its kinds' tiles four across with the lines of name each real name will take, in the
 * same groups, order and spacing as the real page. The header is real and stays put, so the skeleton is only the page under it and
 * nothing moves when the tiles arrive.
 */
function CategoriesSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { groups, coming, total } = useCategoryBrowse();

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {total > FIND_FROM ? (
          <View style={styles.pad}>
            <Skeleton height={FIELD_HEIGHT} rounded={radius.full} />
          </View>
        ) : null}
        {groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <View style={styles.pad}>
              <RowTitleSkeleton title={group.title} />
            </View>
            <View style={styles.categories}>
              {group.categories.map((category) => (
                <CategoryTileGridSkeleton
                  key={category.id}
                  count={category.tiles.length}
                  names={category.tiles.map((tile) => tile.label)}
                />
              ))}
            </View>
          </View>
        ))}
        {coming !== undefined ? (
          <View style={styles.group}>
            <View style={styles.pad}>
              <RowTitleSkeleton title={coming.title} />
            </View>
            <CategoryTileGridSkeleton
              count={coming.tiles.length}
              names={coming.tiles.map((tile) => tile.label)}
            />
          </View>
        ) : null}
      </View>
    </SkeletonScope>
  );
}

function CategorySections() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { groups, coming, total } = useCategoryBrowse(query);
  const showField = total > FIND_FROM;

  if (total === 0) {
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
      {showField ? (
        <View style={styles.pad}>
          <View style={styles.field}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              onSubmit={() => undefined}
              placeholder={t('categoriesTab.find')}
              clearLabel={t('search.clearField')}
            />
          </View>
        </View>
      ) : null}
      {groups.length === 0 && coming === undefined ? (
        <View style={styles.empty}>
          <StatePanel
            icon="search"
            title={t('categoriesTab.noMatch.title')}
            body={t('categoriesTab.noMatch.body')}
            actionLabel={t('search.clearField')}
            onAction={() => {
              setQuery('');
            }}
          />
        </View>
      ) : (
        <>
          {groups.map((group) => (
            <View key={group.id} style={styles.group}>
              <View style={styles.pad}>
                <RowTitle title={group.title} />
              </View>
              <View style={styles.categories}>
                {group.categories.map((category) => (
                  <CategoryTileGrid
                    key={category.id}
                    tiles={category.tiles}
                    onPress={(index) => {
                      const tile = category.tiles[index];
                      if (tile === undefined) return;
                      // The category's own tile opens all of it; a kind opens it on that kind.
                      const target =
                        tile.subId === undefined
                          ? { kind: 'main' as const, id: category.id }
                          : { kind: 'main' as const, id: category.id, sub: tile.subId };
                      router.push(tileRoute(target, ''));
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
          {coming !== undefined ? (
            <View style={styles.group}>
              <View style={styles.pad}>
                <RowTitle title={coming.title} />
              </View>
              <CategoryTileGrid
                tiles={coming.tiles}
                onPress={(index) => {
                  const tile = coming.tiles[index];
                  // One that is coming opens its "Coming to Roha" page, never an empty shelf.
                  if (tile !== undefined) router.push(categoryRoute(tile.category));
                }}
              />
            </View>
          ) : null}
        </>
      )}
      <BrandFooter />
    </View>
  );
}

/** Uncovering the tab (back from a search a tile opened) leaves it as it was; choosing it from another tab shows its skeleton. */
const alwaysQuiet = (): boolean => true;

/**
 * The Categories tab (ADR 0046): every category the town lists. Each stocked one is a row of tiles four across in its group: its
 * own tile first, with its picture, then its kinds; then "Coming to Roha" as tiles. The category's own tile opens its screen, a kind
 * opens it on that kind, and a category that is coming opens its "Coming to Roha" page. It sits under the same
 * header Home wears (delivery promise, address, profile, and the search that stays pinned as the page scrolls). Once the list passes
 * `FIND_FROM` categories a field to find one by its name or a kind's appears. It has its loading, offline and failed states like
 * every other page, and the header stays put through them.
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
    freshOnOpen: true,
  });

  return (
    <TabHeader
      {...header}
      onScrollY={reportScroll}
      // Room under the last tiles for the bottom bar, and for the cart bar above it when it shows.
      bottomSpace={BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0)}
    >
      <LoadGate inFlow load={load} skeleton={<CategoriesSkeleton />}>
        <CategorySections />
      </LoadGate>
    </TabHeader>
  );
}
