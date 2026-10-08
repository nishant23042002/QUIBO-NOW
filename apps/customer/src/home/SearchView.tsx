import { useRouter } from 'expo-router';
import type { Ref } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Chip,
  Icon,
  IconButton,
  ScreenStatusBar,
  SearchField,
  ShopRow,
  Text,
  space,
  useKeyboardVisible,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { ItemTile, gridCardWidth } from './ItemTile';
import { useHomeItems } from './items';
import { useSampleShops } from './sampleShops';
import { searchDocs } from './search';
import { useSearchIndex } from './searchData';
import { useRecentSearches } from './useRecentSearches';

/** The words offered when nothing is typed yet and when nothing was found. */
const SUGGESTIONS = [
  'home.search.itemMilk',
  'home.search.itemAtta',
  'home.search.itemVegetables',
  'home.search.itemBread',
] as const;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      backgroundColor: c.chrome,
    },
    body: { gap: space[5], paddingTop: space[4] },
    gutter: { paddingHorizontal: space[4] },
    section: { gap: space[3] },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space[4],
    },
    clear: { minHeight: 40, justifyContent: 'center' },
    recentRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    recentText: { flex: 1, minWidth: 0 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], paddingHorizontal: space[4] },
    shops: { gap: space[2], paddingHorizontal: space[4] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
    empty: { alignItems: 'center', gap: space[2], paddingVertical: space[8] },
    pressed: { opacity: 0.7 },
  });

/**
 * The search screen. With nothing typed it offers the recent searches and a few words to try. Once there is text,
 * the shops and the items that match it show at once: shops as rows, items as the same cards as everywhere, so
 * ADD works here. Typing Hindi or Marathi words in English letters works, and so do small slips. A search is
 * remembered when it leads somewhere. The keyboard hides the bottom bar and the cart bar while it is up.
 */
export function SearchView({
  query,
  onQueryChange,
  inputRef,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  inputRef: Ref<TextInput>;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screen } = useWindowDimensions();
  const cart = useCart();
  const keyboard = useKeyboardVisible();
  const index = useSearchIndex();
  const allItems = useHomeItems();
  const allShops = useSampleShops();
  const { recent, remember, clear } = useRecentSearches();

  const typed = query.trim();
  const itemIds = searchDocs(typed, index.items);
  const shopIds = searchDocs(typed, index.shops);
  const items = itemIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  const shops = shopIds
    .map((id) => allShops.find((shop) => shop.id === id))
    .filter((shop) => shop !== undefined);
  const width = gridCardWidth(screen);

  // The bars are away while the keyboard is up, so the page only needs room for what is really there.
  const bottomRoom = keyboard
    ? space[6]
    : insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0);

  const suggestions = (
    <View style={styles.chips}>
      {SUGGESTIONS.map((key) => (
        <Chip
          key={key}
          label={t(key)}
          icon="search"
          onPress={() => {
            onQueryChange(t(key));
          }}
        />
      ))}
    </View>
  );

  let content;
  if (typed === '') {
    content = (
      <>
        {recent.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="subheading" role="heading">
                {t('search.recent')}
              </Text>
              <Pressable
                role="button"
                aria-label={t('search.clearRecent')}
                onPress={clear}
                hitSlop={6}
                style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
              >
                <Text variant="strong" color="accentInk">
                  {t('search.clear')}
                </Text>
              </Pressable>
            </View>
            {recent.map((term) => (
              <Pressable
                key={term}
                role="button"
                aria-label={term}
                onPress={() => {
                  onQueryChange(term);
                }}
                style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
              >
                <Icon name="clock" color={colors.inkMuted} size={18} />
                <View style={styles.recentText}>
                  <Text numberOfLines={1}>{term}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="subheading" role="heading">
              {t('search.try')}
            </Text>
          </View>
          {suggestions}
        </View>
      </>
    );
  } else if (items.length === 0 && shops.length === 0) {
    content = (
      <View style={[styles.empty, styles.gutter]}>
        <Icon name="search" color={colors.inkMuted} size={40} />
        <Text variant="heading" align="center">
          {t('search.noResults.title', { query: typed })}
        </Text>
        <Text color="inkMuted" align="center">
          {t('search.noResults.body')}
        </Text>
        {suggestions}
      </View>
    );
  } else {
    content = (
      <>
        {shops.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="subheading" role="heading">
                {t('search.shops')}
              </Text>
            </View>
            <View style={styles.shops}>
              {shops.map((shop) => (
                <ShopRow
                  key={shop.id}
                  name={shop.name}
                  type={shop.type}
                  statusLabel={shop.statusLabel}
                  open={shop.open}
                  verifiedLabel={shop.verifiedLabel}
                  onPress={() => {
                    remember(typed);
                    router.push({ pathname: '/shop/[id]', params: { id: shop.id } });
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
        {items.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="subheading" role="heading">
                {t('search.items')}
              </Text>
            </View>
            <View style={styles.grid}>
              {items.map((item) => (
                <ItemTile
                  key={item.id}
                  item={item}
                  width={width}
                  onOpen={() => {
                    remember(typed);
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
      </>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenStatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + space[2], paddingBottom: space[2] }]}>
        <View style={{ marginLeft: space[2] - insets.left }}>
          <IconButton icon="back" label={t('common.back')} onPress={router.back} />
        </View>
        <View style={{ flex: 1, paddingRight: space[4] + insets.right }}>
          <SearchField
            value={query}
            onChangeText={onQueryChange}
            onSubmit={() => {
              remember(typed);
            }}
            placeholder={t('home.search.label')}
            clearLabel={t('search.clearField')}
            inputRef={inputRef}
          />
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: bottomRoom }]}
      >
        {content}
      </ScrollView>
      {keyboard ? null : <CartLayer bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />}
    </View>
  );
}
