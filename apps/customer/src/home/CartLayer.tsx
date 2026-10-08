import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CartFloat, Toast, space, type CartThumb } from '@/ui';
import { useCart } from './CartProvider';
import { CartSheet } from './CartSheet';
import { useTintOf } from './categories';

/** About the height of the docked cart bar: how much room a page keeps under its last row while the bar shows. */
export const CART_ROOM = 104;
/** The cart bar's own height, so the toast can sit just above it. */
const CART_BAR = 96;
/** How many round pictures fit in the cart bar before the rest are folded into a "+N" bubble. */
const MAX_THUMBS = 3;

/**
 * Everything the cart puts on a screen: the docked cart bar, the undo toast and the cart sheet the bar opens.
 * A screen places it once and says how far above its own bottom the bar docks (above the tab bar on Home,
 * at the phone's bottom edge on a shop page).
 */
export function CartLayer({ bottom }: { bottom: number }) {
  const { t } = useLanguage();
  const cart = useCart();
  const tintOf = useTintOf();
  const [open, setOpen] = useState(false);

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
          setOpen(true);
        }}
        bottom={bottom}
      />
      <Toast
        visible={cart.removed !== null}
        message={t('home.cart.removed', { name: cart.removed?.name ?? '' })}
        actionLabel={t('home.cart.undo')}
        onAction={cart.undoRemove}
        onTimeout={cart.clearRemoved}
        bottom={bottom + (cart.count > 0 ? CART_BAR : 0) + space[2]}
      />
      <CartSheet
        open={open}
        cart={cart}
        tintOf={tintOf}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
