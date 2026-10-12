import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BrandFooter, Icon, ProductRail, Text, space } from '@/ui';
import { matchesIntent, type IntentId } from './homeIntents';
import { oneOfEachKind } from './product';
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
  useHomeListing,
  type HomeItem,
  type ItemCategory,
} from './items';

/** How long the loading skeleton shows after a chip is chosen. */
const LOAD_MS = 200;

const styles = StyleSheet.create({
  feed: { gap: space[5], paddingVertical: space[5] },
  // The category rows, one under another with room between them: no divider line.
  rails: { gap: space[6], paddingVertical: space[5] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
  empty: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[8],
    paddingHorizontal: space[4],
  },
});

interface HomeFeedProps {
  /** The chosen chip. "all" is the usual page, a row per category; any other shows the items that suit it in a grid. */
  intent: IntentId;
  onSeeAll: (category: ItemCategory) => void;
}

/**
 * The items on Home. With "All" chosen: the usual page, a swipeable row for each category with a "See all" button. With another chip
 * chosen (Quick, Offers, Under ₹50, Veg): the items that suit it, from every shelf, one of each kind, in a two-column grid. ADD turns
 * into a stepper in place. The quantities live in the cart, which the floating cart bar reads.
 */
export const HomeFeed = memo(function HomeFeed({ intent, onSeeAll }: HomeFeedProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { width: screen } = useWindowDimensions();
  const items = useHomeItems();
  const listing = useHomeListing();
  // Choosing another chip shows the loading skeleton for a moment first, as real data would arrive.
  const [shown, setShown] = useState<IntentId>(intent);
  useEffect(() => {
    if (shown === intent) return undefined;
    const timer = setTimeout(() => {
      setShown(intent);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [intent, shown]);
  const loading = shown !== intent;

  const tile = (item: HomeItem, width: number, reserveNote?: boolean) => (
    <ItemTile
      key={item.id}
      item={item}
      width={width}
      {...(reserveNote !== undefined ? { reserveNote } : {})}
    />
  );
  // The items that suit the chip, one of each kind: the first listed of a kind that suits it, so an offer shows the brand that has it.
  const matching =
    intent === 'all' ? [] : oneOfEachKind(items.filter((item) => matchesIntent(item, intent)));

  if (loading) {
    return (
      <HomeSkeleton label={t('common.loading')} grid={intent !== 'all'} cards={matching.length} />
    );
  }

  if (intent !== 'all') {
    const gridWidth = gridCardWidth(screen);
    if (matching.length === 0) {
      return (
        <View style={styles.empty}>
          <Icon name="search" color={colors.inkMuted} size={40} />
          <Text variant="heading" align="center">
            {t('home.intents.empty.title')}
          </Text>
          <Text color="inkMuted" align="center">
            {t('home.intents.empty.body')}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.feed}>
        <View style={styles.grid}>{matching.map((item) => tile(item, gridWidth))}</View>
      </View>
    );
  }

  return (
    <View style={styles.rails}>
      <ShopByCategory />
      <ShopByBrand />
      <SmallPrices />
      <Featured onCategory={onSeeAll} />
      {HOME_RAIL_ORDER.map((key) => {
        const row = listing.filter((item) => item.category === key);
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
