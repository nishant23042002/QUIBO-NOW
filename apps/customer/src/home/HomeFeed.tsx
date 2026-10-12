import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { BrandChips, BrandFooter, ProductRail, space } from '@/ui';
import { activeBrand, brandsOfItems, filterByBrand } from './brandPage';
import { HomeSkeleton } from './HomeSkeleton';
import { Featured } from './Featured';
import { QuieterNote } from './QuieterNote';
import { ShopByBrand } from './ShopByBrand';
import { ShopByCategory } from './ShopByCategory';
import { SmallPrices } from './SmallPrices';
import { ItemTile, RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import {
  HOME_RAIL_ORDER,
  anyCardNote,
  useHomeItems,
  type HomeItem,
  type ItemCategory,
} from './items';

/** How long the loading skeleton shows after a category is chosen. */
const LOAD_MS = 200;

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  // The category rows, one under another with room between them: no divider line.
  rails: { gap: space[6], paddingVertical: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
});

interface HomeFeedProps {
  /** The chosen category tab. "all" shows a row per category; any other shows that category's items in a grid. */
  category: string;
  onSeeAll: (category: ItemCategory) => void;
}

/**
 * The items on Home. With "All" chosen: a swipeable row for each category, each with a "See all" link.
 * With one category chosen: that category's items in a two-column grid. ADD turns into a stepper in place.
 * The quantities live in the cart, which the floating cart bar reads.
 */
export const HomeFeed = memo(function HomeFeed({ category, onSeeAll }: HomeFeedProps) {
  const { t } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const items = useHomeItems();
  // Choosing another category shows the loading skeleton for a moment first, as real data would arrive.
  const [shown, setShown] = useState(category);
  useEffect(() => {
    if (shown === category) return undefined;
    const timer = setTimeout(() => {
      setShown(category);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [category, shown]);
  const loading = shown !== category;
  // The brand chosen to narrow a category's grid, remembered with the category it was chosen in (another category starts on All).
  const [pick, setPick] = useState<{ category: string; brand: string | null }>({
    category,
    brand: null,
  });

  const tile = (item: HomeItem, width: number, reserveNote?: boolean) => (
    <ItemTile
      key={item.id}
      item={item}
      width={width}
      {...(reserveNote !== undefined ? { reserveNote } : {})}
    />
  );
  if (loading) {
    return (
      <HomeSkeleton
        label={t('common.loading')}
        grid={category !== 'all'}
        cards={items.filter((item) => item.category === category).length}
      />
    );
  }

  if (category !== 'all') {
    const gridWidth = gridCardWidth(screen);
    const inCategory = items.filter((item) => item.category === category);
    const brands = brandsOfItems(inCategory);
    const chosen = activeBrand(pick.category === category ? pick.brand : null, brands);
    return (
      <View style={styles.feed}>
        {brands.length > 1 ? (
          <BrandChips
            brands={brands}
            selected={chosen}
            onSelect={(brand) => {
              setPick({ category, brand });
            }}
            allLabel={t('brandPage.all')}
            label={t('brandPage.filterByBrand')}
          />
        ) : null}
        <View style={styles.grid}>
          {filterByBrand(inCategory, chosen).map((item) => tile(item, gridWidth))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rails}>
      <ShopByCategory onCategory={onSeeAll} />
      <ShopByBrand />
      <SmallPrices />
      <Featured onCategory={onSeeAll} />
      {HOME_RAIL_ORDER.map((key) => {
        const row = items.filter((item) => item.category === key);
        // Cards in a row stay one height: room for the low-stock line only when one of them has it.
        const note = anyCardNote(row);
        return (
          <ProductRail
            key={key}
            title={t(`home.rails.${key}`)}
            seeAllLabel={t('home.rails.seeAll')}
            onSeeAll={() => {
              onSeeAll(key);
            }}
          >
            {row.map((item) => tile(item, RAIL_CARD_WIDTH, note))}
          </ProductRail>
        );
      })}
      <QuieterNote />
      <BrandFooter />
    </View>
  );
});
