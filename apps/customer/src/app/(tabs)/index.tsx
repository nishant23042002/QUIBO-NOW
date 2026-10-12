import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CART_ROOM, CartLayer } from '@/home/CartLayer';
import { useCartCount } from '@/home/CartProvider';
import { useDeliveryAddress, useDeliveryWhen } from '@/home/deliveryInfo';
import { useHomeIntents } from '@/home/useHomeIntents';
import { seeAllTarget } from '@/home/catalogueTree';
import { HomeFeed } from '@/home/HomeFeed';
import { isIntent, type IntentId } from '@/home/homeIntents';
import type { ItemCategory } from '@/home/items';
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
  const intents = useHomeIntents();
  const offers = useHomeOffers();
  const searchHint = useSearchHint();
  const [intent, setIntent] = useState<IntentId>('all');
  const cartCount = useCartCount();
  const reportScroll = useChromeReport();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const insets = useSafeAreaInsets();
  const openCount = shops.filter((shop) => shop.open).length;
  // A row's "See all" and a featured pick open the category's own screen (kinds in a rail, filters, a grid).
  const openCategory = (picked: ItemCategory) => {
    const target = seeAllTarget(picked);
    router.push({
      pathname: '/category/[id]',
      params: { id: target.id, ...(target.sub !== undefined ? { sub: target.sub } : {}) },
    });
  };

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
        categories={intents}
        selectedCategory={intent}
        categoriesLabel={t('home.intents.label')}
        onCategoryChange={(key) => {
          if (isIntent(key)) setIntent(key);
        }}
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
        <HomeFeed intent={intent} onSeeAll={openCategory} />
      </HomeHeader>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
