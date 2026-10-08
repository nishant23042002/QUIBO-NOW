import { Fragment, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ProductCard, ProductRail, SectionDivider, space } from '@/ui';
import { useHomeCategories } from './categories';
import { HomeSkeleton } from './HomeSkeleton';
import { ProductDetail } from './ProductDetail';
import type { DraftCart } from './cart';
import { useHomeItems, type HomeItem, type ItemCategory } from './items';

const RAIL_CARD = 148;
const COLUMNS = 2;
/** How long the loading skeleton shows after a category is chosen. */
const LOAD_MS = 600;

/** The order the rows come in when "All" is chosen. */
const ORDER: readonly ItemCategory[] = ['dairy', 'vegetables', 'fruits', 'staples', 'snacks'];

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
});

interface HomeFeedProps {
  /** The cart being filled. ADD and the stepper on every card write to it. */
  cart: DraftCart;
  /** The chosen category tab. "all" shows a row per category; any other shows that category's items in a grid. */
  category: string;
  onSeeAll: (category: ItemCategory) => void;
}

/**
 * The items on Home. With "All" chosen: a swipeable row for each category, each with a "See all" link.
 * With one category chosen: that category's items in a two-column grid. ADD turns into a stepper in place.
 * The quantities live in the draft cart, which the floating cart bar reads.
 */
export function HomeFeed({ cart, category, onSeeAll }: HomeFeedProps) {
  const { t } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const items = useHomeItems();
  const categories = useHomeCategories();
  const [detailId, setDetailId] = useState<string | null>(null);
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

  const tintOf = (key: ItemCategory): string =>
    categories.find((candidate) => candidate.key === key)?.tint ?? '';

  const card = (item: HomeItem, width: number) => (
    <ProductCard
      key={item.id}
      name={item.name}
      pack={item.pack}
      price={item.price}
      {...(item.mrp !== undefined ? { mrp: item.mrp } : {})}
      {...(item.ribbon !== undefined ? { ribbon: item.ribbon } : {})}
      {...(item.quickLabel !== undefined ? { quickLabel: item.quickLabel } : {})}
      diet={item.diet}
      {...(item.stock !== undefined ? { stock: item.stock } : {})}
      emoji={item.emoji}
      tint={tintOf(item.category)}
      width={width}
      onPress={() => {
        setDetailId(item.id);
      }}
      quantity={cart.quantities[item.id] ?? 0}
      onQuantityChange={(next) => {
        cart.setQuantity(item.id, next);
      }}
      stepper={{
        addLabel: t('home.rails.add'),
        decreaseLabel: t('home.rails.removeOne'),
        increaseLabel: t('home.rails.addOne'),
      }}
    />
  );

  const detail = items.find((item) => item.id === detailId) ?? null;
  const sheet = (
    <ProductDetail
      item={detail}
      tint={detail === null ? '' : tintOf(detail.category)}
      quantity={detail === null ? 0 : (cart.quantities[detail.id] ?? 0)}
      onQuantityChange={(next) => {
        if (detail !== null) cart.setQuantity(detail.id, next);
      }}
      onClose={() => {
        setDetailId(null);
      }}
    />
  );

  if (loading) {
    return <HomeSkeleton label={t('common.loading')} grid={category !== 'all'} />;
  }

  if (category !== 'all') {
    // Rounded down, so two cards and the gap between them always fit in the row, whatever the phone's width.
    const gridWidth = Math.floor((screen - space[4] * 2 - space[3] * (COLUMNS - 1)) / COLUMNS);
    return (
      <View style={styles.feed}>
        <View style={styles.grid}>
          {items.filter((item) => item.category === category).map((item) => card(item, gridWidth))}
        </View>
        {sheet}
      </View>
    );
  }

  return (
    <View style={styles.feed}>
      {ORDER.map((key, index) => (
        <Fragment key={key}>
          {index > 0 ? <SectionDivider /> : null}
          <ProductRail
            title={t(`home.rails.${key}`)}
            seeAllLabel={t('home.rails.seeAll')}
            onSeeAll={() => {
              onSeeAll(key);
            }}
          >
            {items.filter((item) => item.category === key).map((item) => card(item, RAIL_CARD))}
          </ProductRail>
        </Fragment>
      ))}
      {sheet}
    </View>
  );
}
