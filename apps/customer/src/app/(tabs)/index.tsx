import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CART_ROOM, CartLayer } from '@/home/CartLayer';
import { useCartCount } from '@/home/CartProvider';
import { RAIL_MORE, useHomeRail } from '@/home/useHomeRail';
import { seeAllTarget } from '@/home/catalogueTree';
import type { Category, MainCategoryId } from '@/home/catalogueTree';
import { category as categoryById } from '@/home/categoryLists';
import { ClosedBanner } from '@/home/ClosedBanner';
import { HeroMosaic } from '@/home/HeroMosaic';
import { LiveOrderCard } from '@/home/LiveOrderCard';
import { HomeFeed } from '@/home/HomeFeed';
import type { ItemCategory } from '@/home/items';
import type { NeedId } from '@/home/needs';
import { OutOfArea } from '@/home/OutOfArea';
import { OutsideBanner } from '@/home/OutsideBanner';
import { PaymentStrip } from '@/home/PaymentStrip';
import { useSampleShops } from '@/home/sampleShops';
import { useAreaStatus } from '@/home/useAreaStatus';
import { useTabHeaderProps } from '@/home/useTabHeader';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, HomeHeader, space, useChromeReport } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    strip: { paddingBottom: space[3] },
  });

// Home is the shops, or, for an address outside the delivery area (until the shopper chooses to look around anyway), the screen that
// says so and takes a pincode (ADR 0055, step 10).
export default function HomeScreen() {
  const area = useAreaStatus();
  return area.outside && !area.browsing ? <OutOfArea /> : <ShopsHome />;
}

// The shops: the header (the delivery estimate, the shops row it opens, the search bar with its Schedule slot and the categories rail),
// the "Right now in Roha" mosaic on the same surface, and the item rows under it (ADR 0055).
function ShopsHome() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const shops = useSampleShops();
  const rail = useHomeRail();
  const header = useTabHeaderProps();
  // The rail's tab chosen: "all" or a category's id.
  const [picked, setPicked] = useState('all');
  const selected = rail.some((tab) => tab.key === picked) ? picked : 'all';
  const category = selected === 'all' ? undefined : categoryById(selected);
  const cartCount = useCartCount();
  const reportScroll = useChromeReport();
  const insets = useSafeAreaInsets();
  const openCount = shops.filter((shop) => shop.open).length;
  // Open shops first, so the strip in the mosaic names the ones a customer can order from now.
  const shopNames = [...shops].sort((a, b) => Number(b.open) - Number(a.open)).map((s) => s.name);
  // A row's "See all" and a featured pick open the category's own screen (kinds in a rail, filters, a grid).
  const openCategory = (target: ItemCategory) => {
    const found = seeAllTarget(target);
    router.push({
      pathname: '/category/[id]',
      params: { id: found.id, ...(found.sub !== undefined ? { sub: found.sub } : {}) },
    });
  };
  // A category's "See all" opens its own screen.
  const openMainCategory = (target: Category) => {
    router.push({ pathname: '/category/[id]', params: { id: target.id } });
  };
  // A mosaic tile shows that category on Home itself, as choosing its tab in the rail does.
  const showCategory = (id: MainCategoryId) => {
    setPicked(id);
  };
  const openNeed = (id: NeedId) => {
    router.push({ pathname: '/need/[id]', params: { id } });
  };

  return (
    <View style={styles.page}>
      <HomeHeader
        {...header}
        shops={shops}
        shopsLabel={t('home.header.shopsOpen', { count: openCount })}
        shopsTitle={t('home.shopsSheet.title')}
        categories={rail}
        selectedCategory={selected}
        categoriesLabel={t('categoriesTab.railLabel')}
        onCategoryChange={(key) => {
          // More opens the Categories tab; the rail tab chosen stays as it was.
          if (key === RAIL_MORE) {
            router.navigate('/categories');
            return;
          }
          setPicked(key);
        }}
        hero={({ openShops }) => (
          <>
            <LiveOrderCard />
            <OutsideBanner />
            <ClosedBanner />
            {/* Payment and delivery, at the very top: what a new customer asks first, above what is on today. */}
            <View style={styles.strip}>
              <PaymentStrip
                onQuietPress={() => {
                  router.push('/schedule');
                }}
                onOffersPress={() => {
                  router.push('/coupons');
                }}
              />
            </View>
            <HeroMosaic
              shopNames={shopNames}
              onCategory={showCategory}
              onNeed={openNeed}
              onMeetShops={openShops}
            />
          </>
        )}
        onShopPress={(id) => {
          router.push({ pathname: '/shop/[id]', params: { id } });
        }}
        // The bottom bar hides while the page is read and comes back on the way up.
        onScrollY={reportScroll}
        // The floating cart bar covers the bottom of the page when it shows, so the page leaves room for it.
        bottomSpace={BOTTOM_BAR_HEIGHT + (cartCount > 0 ? CART_ROOM : 0)}
      >
        <HomeFeed category={category} onSeeAll={openCategory} onSeeCategory={openMainCategory} />
      </HomeHeader>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
