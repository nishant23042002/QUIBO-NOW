import { useLanguage } from '@/i18n/LanguageProvider';
import { ProductCard, gridCardWidth as gridWidth, space } from '@/ui';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { ProductDetail } from './ProductDetail';
import { useHomeItems, type HomeItem } from './items';

/** One item as a card, wired to the cart: ADD and the stepper write to it, a tap opens the item detail. */
export function ItemTile({
  item,
  width,
  onOpen,
}: {
  item: HomeItem;
  width: number;
  onOpen: (id: string) => void;
}) {
  const { t } = useLanguage();
  const cart = useCart();
  const tintOf = useTintOf();

  return (
    <ProductCard
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
        onOpen(item.id);
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
}

/** The item sheet for whichever item is chosen (null keeps it shut), reading and writing the cart. */
export function ItemDetailHost({ id, onClose }: { id: string | null; onClose: () => void }) {
  const cart = useCart();
  const items = useHomeItems();
  const tintOf = useTintOf();
  const item = items.find((candidate) => candidate.id === id) ?? null;

  return (
    <ProductDetail
      item={item}
      tint={item === null ? '' : tintOf(item.category)}
      quantity={item === null ? 0 : (cart.quantities[item.id] ?? 0)}
      onQuantityChange={(next) => {
        if (item !== null) cart.setQuantity(item.id, next);
      }}
      onClose={onClose}
    />
  );
}

/** The width of a card in the two-column grid used on Home and on a shop page. */
export function gridCardWidth(screen: number): number {
  return gridWidth(screen, { columns: 2, gutter: space[4], gap: space[3] });
}
