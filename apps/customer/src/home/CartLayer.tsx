import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  BOTTOM_BAR_HEIGHT,
  CartFloat,
  TAP_MIN,
  Toast,
  space,
  useChromeProgress,
  useReduceMotion,
  type CartThumb,
} from '@/ui';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';

/** About the height of the docked cart bar: how much room a page keeps under its last row while the bar shows. */
export const CART_ROOM = 104;
/** The cart bar's own height, so the toast can sit just above it. */
const CART_BAR = 96;
/** How high the collapsed note and button reach above the screen's bottom strip: their margin and their height. */
const COLLAPSED_ROOM = space[2] + TAP_MIN;
/** How many round pictures fit in the cart bar before the rest are folded into a "+N" bubble. */
const MAX_THUMBS = 3;

/**
 * The "removed, undo" note shown when the last unit of something leaves the cart. `bottom` is how far above the
 * screen's bottom edge the note's own bottom sits; `aboveBar` lifts it clear of the docked cart bar when that shows.
 */
export function UndoToast({
  bottom,
  aboveBar = false,
  follow = false,
}: {
  bottom: number;
  aboveBar?: boolean;
  /**
   * The screen's bottom bar hides on scroll: the note then rests right above whatever is lowest, which is the full cart bar over
   * the bottom bar, the small note and button once the bar is away, or the screen's bottom when the cart is empty.
   */
  follow?: boolean;
}) {
  const { t } = useLanguage();
  const cart = useCart();
  const reduceMotion = useReduceMotion();
  const hide = useChromeProgress();
  const filled = cart.count > 0;
  const [bar] = useState(() => new Animated.Value(filled ? 1 : 0));

  // 0 with an empty cart, 1 with something in it, eased so the note does not jump when the first item comes or the last one goes.
  useEffect(() => {
    if (!follow) return undefined;
    if (reduceMotion) {
      bar.setValue(filled ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(bar, {
      toValue: filled ? 1 : 0,
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [follow, filled, reduceMotion, bar]);

  // How far up from the bottom bar's top edge the note rests: above the full cart bar with the bottom bar in place, above the
  // note and button (or down at the strip when the cart is empty) with it away. The two are blended by the bar's own progress.
  const shift = follow
    ? Animated.multiply(
        Animated.add(
          Animated.multiply(
            Animated.multiply(bar, CART_BAR),
            hide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          ),
          Animated.multiply(
            hide,
            Animated.subtract(Animated.multiply(bar, COLLAPSED_ROOM), BOTTOM_BAR_HEIGHT),
          ),
        ),
        -1,
      )
    : undefined;

  return (
    <Toast
      visible={cart.removed !== null}
      message={t('home.cart.removed', { name: cart.removed?.name ?? '' })}
      actionLabel={t('home.cart.undo')}
      onAction={cart.undoRemove}
      onTimeout={cart.clearRemoved}
      bottom={bottom + (aboveBar && !follow && filled ? CART_BAR : 0) + space[2]}
      {...(shift === undefined ? {} : { shift })}
    />
  );
}

/**
 * Everything the cart puts on a screen that is not the cart itself: the docked cart bar and the undo toast. The bar
 * opens the cart page. A screen places it once and says how far above its own bottom the bar docks (above the tab bar
 * on Home, at the phone's bottom edge on a shop page).
 */
export function CartLayer({ bottom, follow = false }: { bottom: number; follow?: boolean }) {
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
        free={cart.free}
        pillTitle={cart.pill.title}
        pillSub={cart.pill.sub}
        actionLabel={t('home.cart.view')}
        onPress={() => {
          router.push('/cart');
        }}
        bottom={bottom}
        follow={follow}
      />
      <UndoToast bottom={bottom} aboveBar follow={follow} />
    </>
  );
}
