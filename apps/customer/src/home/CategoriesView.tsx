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
import { categoryRoute } from './categoryLists';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useTabHeaderProps } from './useTabHeader';
import { useDepartmentIndex } from './useDepartmentTiles';

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
    // The field sits on the page's colour with a hairline, so it reads as a field and not as a hole.
    field: { flexDirection: 'row', borderRadius: radius.full, borderWidth: 1, borderColor: c.line },
    group: { gap: space[3] },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 360 },
  });

/**
 * Grey blocks in the shape of the page: the field when there is one, then each group's title as long as the real one with its dotted
 * line, then its tiles four across with the lines of name each real name will take, in the same groups, order and spacing as the
 * real tiles. The header is real and stays put, so the skeleton is only the page under it and nothing moves when the tiles arrive.
 */
function CategoriesSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { sections, total } = useDepartmentIndex();

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {total > FIND_FROM ? (
          <View style={styles.pad}>
            <Skeleton height={FIELD_HEIGHT} rounded={radius.full} />
          </View>
        ) : null}
        {sections.map((section) => (
          <View key={section.id} style={styles.group}>
            <View style={styles.pad}>
              <RowTitleSkeleton title={section.title} />
            </View>
            <CategoryTileGridSkeleton
              count={section.tiles.length}
              names={section.tiles.map((tile) => tile.label)}
            />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

function CategorySections() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { sections, total } = useDepartmentIndex(query);
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
              placeholder={t('departments.find')}
              clearLabel={t('search.clearField')}
            />
          </View>
        </View>
      ) : null}
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <StatePanel
            icon="search"
            title={t('departments.noMatch.title')}
            body={t('departments.noMatch.body')}
            actionLabel={t('search.clearField')}
            onAction={() => {
              setQuery('');
            }}
          />
        </View>
      ) : (
        sections.map((section) => (
          <View key={section.id} style={styles.group}>
            <View style={styles.pad}>
              <RowTitle title={section.title} />
            </View>
            <CategoryTileGrid
              tiles={section.tiles}
              onPress={(index) => {
                const tile = section.tiles[index];
                // A live category opens its own screen; one that is coming opens its "Coming to Roha" page.
                if (tile !== undefined) router.push(categoryRoute(tile.category));
              }}
            />
          </View>
        ))
      )}
      <BrandFooter />
    </View>
  );
}

/** Uncovering the tab (back from a search a tile opened) leaves it as it was; choosing it from another tab shows its skeleton. */
const alwaysQuiet = (): boolean => true;

/**
 * The Categories tab: every category the town lists, in groups of tiles four across (what is stocked in its groups, then "Coming to
 * Roha"), under the same header Home wears (delivery promise, address, profile, and the search that stays pinned as the page
 * scrolls). A live category opens its own screen; one that is coming opens its "Coming to Roha" page. Once the list passes
 * `FIND_FROM` tiles a field to find one by name appears. It has its loading, offline and failed states like every other page, and
 * the header stays put through them.
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
