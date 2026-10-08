import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CART_ROOM, CartLayer } from '@/home/CartLayer';
import { useCart } from '@/home/CartProvider';
import { useHomeCategories } from '@/home/categories';
import { HomeFeed } from '@/home/HomeFeed';
import { useHomeOffers } from '@/home/offers';
import { useSampleShops } from '@/home/sampleShops';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, HomeHeader } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({ page: { flex: 1, backgroundColor: c.bg } });

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
  const cart = useCart();
  const insets = useSafeAreaInsets();
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
        onShopPress={(id) => {
          router.push({ pathname: '/shop/[id]', params: { id } });
        }}
        onProfilePress={() => {
          router.push('/profile');
        }}
        // The floating cart bar covers the bottom of the page when it shows, so the page leaves room for it.
        bottomSpace={BOTTOM_BAR_HEIGHT + (cart.count > 0 ? CART_ROOM : 0)}
      >
        <HomeFeed category={category} onSeeAll={setCategory} />
      </HomeHeader>
      <CartLayer bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
