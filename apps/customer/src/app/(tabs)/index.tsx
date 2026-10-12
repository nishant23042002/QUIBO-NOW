import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CART_ROOM, CartLayer } from '@/home/CartLayer';
import { useCartCount } from '@/home/CartProvider';
import { useDeliveryAddress, useDeliveryWhen } from '@/home/deliveryInfo';
import { useHomeCategories } from '@/home/categories';
import { HomeFeed } from '@/home/HomeFeed';
import { useHomeOffers } from '@/home/offers';
import { useSearchHint } from '@/home/searchHint';
import { useSampleShops } from '@/home/sampleShops';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, HomeHeader, useChromeReport } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({ page: { flex: 1, backgroundColor: c.bg } });

// Phase 1a is built one section at a time. So far: the header (with the shops row it opens), the search bar, the category tabs, the sliding offers, and the item rows.
export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const shops = useSampleShops();
  const categories = useHomeCategories();
  const offers = useHomeOffers();
  const searchHint = useSearchHint();
  const [category, setCategory] = useState('all');
  // The Categories tab can open Home on a category. Each press carries a new stamp, so choosing the same one again still counts.
  const { category: wanted, at } = useLocalSearchParams<{ category?: string; at?: string }>();
  const [seenAt, setSeenAt] = useState(at);
  if (at !== seenAt) {
    setSeenAt(at);
    if (wanted !== undefined && categories.some((candidate) => candidate.key === wanted)) {
      setCategory(wanted);
    }
  }
  const cartCount = useCartCount();
  const reportScroll = useChromeReport();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const insets = useSafeAreaInsets();
  const openCount = shops.filter((shop) => shop.open).length;

  return (
    <View style={styles.page}>
      <HomeHeader
        deliveryLine={when.headline}
        address={address}
        addressCaption={t('home.header.addressCaption')}
        shops={shops}
        shopsLabel={t('home.header.shopsOpen', { count: openCount })}
        shopsTitle={t('home.shopsSheet.title')}
        searchLabel={t('home.search.label')}
        searchHint={searchHint}
        categories={categories}
        selectedCategory={category}
        categoriesLabel={t('home.categories.label')}
        onCategoryChange={setCategory}
        offers={offers}
        offersLabel={t('home.offers.label')}
        onOfferPress={() => undefined}
        profileLabel={t('home.header.profile')}
        onSearchPress={() => {
          router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
        }}
        onAddressPress={() => {
          router.push('/address');
        }}
        onShopPress={(id) => {
          router.push({ pathname: '/shop/[id]', params: { id } });
        }}
        onProfilePress={() => {
          router.push('/profile');
        }}
        // The bottom bar hides while the page is read and comes back on the way up.
        onScrollY={reportScroll}
        // The floating cart bar covers the bottom of the page when it shows, so the page leaves room for it.
        bottomSpace={BOTTOM_BAR_HEIGHT + (cartCount > 0 ? CART_ROOM : 0)}
      >
        <HomeFeed category={category} onSeeAll={setCategory} />
      </HomeHeader>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
