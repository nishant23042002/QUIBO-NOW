import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ProductCard, WEIGHT_RULE, countRule, gridCardWidth as gridWidth, space } from '@/ui';
import { useCart } from './CartProvider';
import { useDeliveryWhen } from './deliveryInfo';
import { useTintOf } from './categories';
import type { HomeItem } from './items';

/** How wide a card is in a swipeable row. */
export const RAIL_CARD_WIDTH = 148;

/**
 * One item as a card, wired to the cart: ADD and the stepper write to it, and a tap on the picture or the text
 * opens the item's own page. `onOpen` runs first, for a screen that wants to note the tap (search remembers its query).
 */
export function ItemTile({
  item,
  width,
  onOpen,
}: {
  item: HomeItem;
  width: number;
  onOpen?: (id: string) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();
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
      onPress={() => {
        onOpen?.(item.id);
        router.push({ pathname: '/product/[id]', params: { id: item.id } });
      }}
      quantity={cart.quantities[item.defaultPackId] ?? 0}
      onQuantityChange={(next) => {
        cart.setQuantity(item.defaultPackId, next);
      }}
      stepper={{
        addLabel: t('home.rails.add'),
        decreaseLabel: t('home.rails.removeOne'),
        increaseLabel: t('home.rails.addOne'),
        maxLabel: t('home.rails.noMore'),
        rule: item.loose === true ? WEIGHT_RULE : countRule(item.maxQuantity),
        ...(item.loose === true ? { unitLabel: t('weights.kg') } : {}),
      }}
    />
  );
}

/** The width of a card in the two-column grid used on Home and on a shop page. */
export function gridCardWidth(screen: number): number {
  return gridWidth(screen, { columns: 2, gutter: space[4], gap: space[3] });
}
