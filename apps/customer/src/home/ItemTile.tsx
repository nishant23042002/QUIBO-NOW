import { useRouter } from 'expo-router';
import { memo } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  ProductCard,
  Stepper,
  WEIGHT_RULE,
  countRule,
  gridCardWidth as gridWidth,
  isCompactCard,
  space,
} from '@/ui';
import { useCartActions, useQuantity } from './CartProvider';
import { useDeliveryWhen } from './deliveryInfo';
import { useTintOf } from './categories';
import type { HomeItem } from './items';

/** How wide a card is in a swipeable row: narrow enough that the next card peeks in, and short for its width (see `ProductCard`). */
export const RAIL_CARD_WIDTH = 128;

/**
 * The ADD button and stepper of one item. It reads this item's count from the cart's store and nothing else, so adding or changing
 * the quantity redraws only this control, in the same frame as the press.
 */
const ItemControl = memo(function ItemControl({
  item,
  compact,
}: {
  item: HomeItem;
  compact: boolean;
}) {
  const { t } = useLanguage();
  const { setQuantity } = useCartActions();
  const quantity = useQuantity(item.defaultPackId);

  return (
    <Stepper
      value={quantity}
      onChange={(next) => {
        setQuantity(item.defaultPackId, next);
      }}
      compact={compact}
      addLabel={t('home.rails.add')}
      addAriaLabel={t('home.rails.addNamed', { name: item.name })}
      decreaseLabel={t('home.rails.removeOneOf', { name: item.name })}
      increaseLabel={t('home.rails.addOneOf', { name: item.name })}
      maxLabel={t('home.rails.noMore')}
      maxNotice={t('home.rails.limitReached')}
      rule={item.loose === true ? WEIGHT_RULE : countRule(item.maxQuantity)}
      {...(item.loose === true ? { unitLabel: t('weights.kg') } : {})}
    />
  );
});

/**
 * One item as a card, wired to the cart: ADD and the stepper write to it, and a tap on the picture or the text
 * opens the item's own page. `onOpen` runs first, for a screen that wants to note the tap (search remembers its query).
 * The card itself does not read the cart's count (its control does), so it is drawn once and left alone.
 */
export const ItemTile = memo(function ItemTile({
  item,
  width,
  onOpen,
  reserveNote,
}: {
  item: HomeItem;
  width: number;
  onOpen?: (id: string) => void;
  /** Whether some card beside this one carries a low-stock line, so every card in the row keeps room for it. */
  reserveNote?: boolean;
}) {
  const router = useRouter();
  const tintOf = useTintOf();
  const when = useDeliveryWhen();

  return (
    <ProductCard
      name={item.name}
      pack={item.sizesLabel === undefined ? item.pack : `${item.pack} \u00B7 ${item.sizesLabel}`}
      price={item.price}
      {...(item.mrp !== undefined ? { mrp: item.mrp } : {})}
      {...(item.ribbon !== undefined ? { ribbon: item.ribbon } : {})}
      {...(item.quick === true ? { quickLabel: when.short } : {})}
      diet={item.diet}
      {...(item.stock !== undefined ? { stock: item.stock } : {})}
      emoji={item.emoji}
      tint={tintOf(item.category)}
      width={width}
      {...(reserveNote !== undefined ? { reserveNote } : {})}
      onPress={() => {
        onOpen?.(item.id);
        router.push({ pathname: '/product/[id]', params: { id: item.id } });
      }}
      control={<ItemControl item={item} compact={isCompactCard(width)} />}
    />
  );
});

/** The width of a card in the two-column grid used on Home and on a shop page. */
export function gridCardWidth(screen: number): number {
  return gridWidth(screen, { columns: 2, gutter: space[4], gap: space[3] });
}
