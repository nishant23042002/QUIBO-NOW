import { Fragment, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ProductRail, SectionDivider, space } from '@/ui';
import { HomeSkeleton } from './HomeSkeleton';
import { ItemTile, RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import { useHomeItems, type HomeItem, type ItemCategory } from './items';

/** How long the loading skeleton shows after a category is chosen. */
const LOAD_MS = 600;

/** The order the rows come in when "All" is chosen. */
const ORDER: readonly ItemCategory[] = ['dairy', 'vegetables', 'fruits', 'staples', 'snacks'];

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
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
export function HomeFeed({ category, onSeeAll }: HomeFeedProps) {
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

  const tile = (item: HomeItem, width: number) => (
    <ItemTile key={item.id} item={item} width={width} />
  );
  if (loading) {
    return <HomeSkeleton label={t('common.loading')} grid={category !== 'all'} />;
  }

  if (category !== 'all') {
    const gridWidth = gridCardWidth(screen);
    return (
      <View style={styles.feed}>
        <View style={styles.grid}>
          {items.filter((item) => item.category === category).map((item) => tile(item, gridWidth))}
        </View>
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
            {items
              .filter((item) => item.category === key)
              .map((item) => tile(item, RAIL_CARD_WIDTH))}
          </ProductRail>
        </Fragment>
      ))}
    </View>
  );
}
