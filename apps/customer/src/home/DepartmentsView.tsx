import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  BrandFooter,
  CategoryHeader,
  CategoryTileGrid,
  CategoryTileGridSkeleton,
  LoadGate,
  Notice,
  RowTitle,
  RowTitleSkeleton,
  SearchField,
  Skeleton,
  SkeletonScope,
  StatePanel,
  radius,
  space,
  useChromeScroll,
  useScreenLoad,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { categoryRoute } from './categoryLists';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useDepartmentIndex } from './useDepartmentTiles';

/** The field is as tall as the search field of the search screen. */
const FIELD_HEIGHT = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[6], paddingTop: space[4] },
    gutter: { paddingHorizontal: space[4] },
    // The field sits on the page's colour with a hairline, so it reads as a field and not as a hole.
    field: { flexDirection: 'row', borderRadius: radius.full, borderWidth: 1, borderColor: c.line },
    section: { gap: space[3] },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 320 },
  });

/**
 * The page's own shape in grey: the field, then each section's title (as long as the real one, with its dotted line) and its tiles
 * four across with the lines of name each real name will take. The header is real and stays put.
 */
function DepartmentsSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { sections } = useDepartmentIndex();

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        <View style={styles.gutter}>
          <Skeleton height={FIELD_HEIGHT} rounded={radius.full} />
        </View>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.gutter}>
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

function DepartmentsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const chromeScroll = useChromeScroll();
  const cart = useCart();
  const online = useOnline();
  const [query, setQuery] = useState('');
  const { sections, total } = useDepartmentIndex(query);

  return (
    <ScrollView
      {...chromeScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom:
            insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0),
        },
      ]}
    >
      {online ? null : (
        <View style={styles.gutter}>
          <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
        </View>
      )}
      {total === 0 ? (
        <View style={styles.empty}>
          <StatePanel
            icon="grid"
            title={t('departments.empty.title')}
            body={t('departments.empty.body')}
          />
        </View>
      ) : (
        <>
          <View style={styles.gutter}>
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
              <View key={section.id} style={styles.section}>
                <View style={styles.gutter}>
                  <RowTitle title={section.title} />
                </View>
                <CategoryTileGrid
                  tiles={section.tiles}
                  onPress={(index) => {
                    const tile = section.tiles[index];
                    if (tile !== undefined) router.push(categoryRoute(tile.category));
                  }}
                />
              </View>
            ))
          )}
          <BrandFooter />
        </>
      )}
    </ScrollView>
  );
}

/**
 * All departments (ADR 0044): the live departments in their groups, then those coming to Roha, under the lilac header the category
 * screens wear, with a field to find one by name. A live tile opens its category's screen; one that is coming opens its "Coming to
 * Roha" page. It has its loading, offline (the list is kept on the phone, so it still shows, with a notice) and failed states, and the
 * header stays put through them.
 */
export function DepartmentsView() {
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const load = useScreenLoad({ loadMs: CATEGORIES_LOAD_MS, policy: CATEGORIES_POLICY });

  return (
    <View style={styles.page}>
      <CategoryHeader
        title={t('departments.all')}
        backLabel={t('common.back')}
        onBack={() => {
          // Opened straight from an address there is nothing behind it: go Home instead.
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        searchLabel={t('catalogue.searchLabel')}
        onSearch={() => {
          router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
        }}
      />
      <LoadGate load={load} skeleton={<DepartmentsSkeleton />}>
        <DepartmentsPage />
      </LoadGate>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
