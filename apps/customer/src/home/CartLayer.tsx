import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CartFloat, Toast, space, type CartThumb } from '@/ui';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';

/** About the height of the docked cart bar: how much room a page keeps under its last row while the bar shows. */
export const CART_ROOM = 104;
/** The cart bar's own height, so the toast can sit just above it. */
const CART_BAR = 96;
/** How many round pictures fit in the cart bar before the rest are folded into a "+N" bubble. */
const MAX_THUMBS = 3;

/**
 * The "removed, undo" note shown when the last unit of something leaves the cart. `bottom` is how far above the
 * screen's bottom edge the note's own bottom sits; `aboveBar` lifts it clear of the docked cart bar when that shows.
 */
export function UndoToast({ bottom, aboveBar = false }: { bottom: number; aboveBar?: boolean }) {
  const { t } = useLanguage();
  const cart = useCart();

  return (
    <Toast
      visible={cart.removed !== null}
      message={t('home.cart.removed', { name: cart.removed?.name ?? '' })}
      actionLabel={t('home.cart.undo')}
      onAction={cart.undoRemove}
      onTimeout={cart.clearRemoved}
      bottom={bottom + (aboveBar && cart.count > 0 ? CART_BAR : 0) + space[2]}
    />
  );
}

/**
 * Everything the cart puts on a screen that is not the cart itself: the docked cart bar and the undo toast. The bar
 * opens the cart page. A screen places it once and says how far above its own bottom the bar docks (above the tab bar
 * on Home, at the phone's bottom edge on a shop page).
 */
export function CartLayer({ bottom }: { bottom: number }) {
  const { t } = useLanguage();
  const cart = useCart();
  const tintOf = useTintOf();
  const router = useRouter();

  const room = cart.lines.length > MAX_THUMBS ? MAX_THUMBS - 1 : cart.lines.length;
  const thumbs: CartThumb[] = cart.lines
    .slice(0, room)
    .map((line) => ({ key: line.id, emoji: line.emoji, tint: tintOf(line.category) }));
  const moreCount = cart.lines.length - room;

  return (
    <>
      <CartFloat
        visible={cart.count > 0}
        thumbs={thumbs}
        {...(moreCount > 0 ? { moreLabel: `+${moreCount}` } : {})}
        itemsLabel={cart.itemsLabel}
        totalLabel={cart.totalLabel}
        shopLabel={cart.shopLabel}
        {...(cart.savedLabel !== undefined ? { savedLabel: cart.savedLabel } : {})}
        hint={cart.hint}
        progress={cart.progress}
        actionLabel={t('home.cart.view')}
        onPress={() => {
          router.push('/cart');
        }}
        bottom={bottom}
      />
      <UndoToast bottom={bottom} aboveBar />
    </>
  );
}
