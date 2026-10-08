import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDraftCart } from '@/home/cart';
import { CartSheet } from '@/home/CartSheet';
import { useHomeCategories } from '@/home/categories';
import { HomeFeed } from '@/home/HomeFeed';
import { useHomeOffers } from '@/home/offers';
import { useSampleShops } from '@/home/sampleShops';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, CartFloat, HomeHeader, Toast, space, type CartThumb } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({ page: { flex: 1, backgroundColor: c.bg } });

/** About the height of the docked cart bar: how much room the page keeps under its last row while the bar shows. */
const CART_ROOM = 104;
/** The cart bar's own height, so the toast can sit just above it. */
const CART_BAR = 96;

/** How many round pictures fit in the cart bar before the rest are folded into a "+N" bubble. */
const MAX_THUMBS = 3;

/** The words the search bar types out in turn. They are examples, and the search itself arrives in Phase 1c. */
const SEARCH_ITEMS = [
  'home.search.itemMilk',
  'home.search.itemAtta',
  'home.search.itemVegetables',
  'home.search.itemBread',
] as const;

// Phase 1a is built one section at a time. So far: the header (with the shops row it opens), the search bar, the category tabs, the sliding offers, and the item rows.
export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const shops = useSampleShops();
  const categories = useHomeCategories();
  const offers = useHomeOffers();
  const [category, setCategory] = useState('all');
  const cart = useDraftCart();
  const [cartOpen, setCartOpen] = useState(false);
  const insets = useSafeAreaInsets();
  // The little pictures in the cart bar: up to three, and a "+N" bubble when there are more products than fit.
  const tintOf = (key: string): string =>
    categories.find((candidate) => candidate.key === key)?.tint ?? '';
  const room = cart.lines.length > MAX_THUMBS ? MAX_THUMBS - 1 : cart.lines.length;
  const thumbs: CartThumb[] = cart.lines
    .slice(0, room)
    .map((line) => ({ key: line.id, emoji: line.emoji, tint: tintOf(line.category) }));
  const moreCount = cart.lines.length - room;
  const openCount = shops.filter((shop) => shop.open).length;

  return (
    <View style={styles.page}>
      <HomeHeader
        deliveryLine={t('home.header.deliveryToday', { window: t('home.header.sampleWindow') })}
        address={t('home.header.sampleAddress')}
        addressCaption={t('home.header.addressCaption')}
        shops={shops}
        shopsLabel={t('home.header.shopsOpen', { count: openCount })}
        shopsTitle={t('home.shopsSheet.title')}
        searchLabel={t('home.search.label')}
        searchHint={{
          label: t('home.search.hintLabel'),
          words: SEARCH_ITEMS.map((item) => t(item)),
        }}
        categories={categories}
        selectedCategory={category}
        categoriesLabel={t('home.categories.label')}
        onCategoryChange={setCategory}
        offers={offers}
        offersLabel={t('home.offers.label')}
        onOfferPress={() => undefined}
        profileLabel={t('home.header.profile')}
        onSearchPress={() => undefined}
        onAddressPress={() => undefined}
        onProfilePress={() => {
          router.push('/profile');
        }}
        // The floating cart bar covers the bottom of the page when it shows, so the page leaves room for it.
        bottomSpace={BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0)}
      >
        <HomeFeed cart={cart} category={category} onSeeAll={setCategory} />
      </HomeHeader>
      <CartFloat
        visible={cart.count > 0}
        thumbs={thumbs}
        {...(moreCount > 0 ? { moreLabel: `+${moreCount}` } : {})}
        itemsLabel={cart.itemsLabel}
        totalLabel={cart.totalLabel}
        shopLabel={cart.shopLabel}
        {...(cart.savedLabel !== undefined ? { savedLabel: cart.savedLabel } : {})}
        hint={cart.hint}
        progress={cart.progress}
        actionLabel={t('home.cart.view')}
        onPress={() => {
          setCartOpen(true);
        }}
        bottom={insets.bottom + BOTTOM_BAR_HEIGHT}
      />
      <Toast
        visible={cart.removed !== null}
        message={t('home.cart.removed', { name: cart.removed?.name ?? '' })}
        actionLabel={t('home.cart.undo')}
        onAction={cart.undoRemove}
        onTimeout={cart.clearRemoved}
        bottom={insets.bottom + BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_BAR : 0) + space[2]}
      />
      <CartSheet
        open={cartOpen}
        cart={cart}
        tintOf={tintOf}
        onClose={() => {
          setCartOpen(false);
        }}
      />
    </View>
  );
}
