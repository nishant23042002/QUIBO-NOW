import { formatRupees, money, subtract } from '@quibo/contracts';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { readSetting, writeSetting } from '@/storage';
import { summariseCart, type CartEntry } from './cartMath';
import { restoreCart, serialiseCart, type PackLimit } from './cartStore';
import { FREE_DELIVERY_FROM } from './delivery';
import { capQuantity } from './packs';
import { useHomeItems, type HomeItem, type ItemCategory } from './items';

/** One pack of an item in a shop's basket. */
export interface BasketLine {
  /** The pack's id, for example "milk:500ml". The cart counts by pack. */
  id: string;
  name: string;
  /** For example "500 ml". */
  pack: string;
  emoji: string;
  category: ItemCategory;
  quantity: number;
  /** The most that can be bought, when there is a stock limit. */
  maxQuantity?: number;
  /** What this line comes to, for example "₹58". */
  totalLabel: string;
}

/**
 * Everything in the cart that comes from one shop: the part that shop packs. All the baskets are one order,
 * collected by one rider on one trip and delivered together. Free delivery counts the whole cart (see
 * `DraftCart.free`).
 */
export interface ShopBasket {
  id: string;
  name: string;
  count: number;
  /** For example "₹64". */
  totalLabel: string;
  lines: readonly BasketLine[];
}

export interface DraftCart {
  /** How many of each pack, by pack id. */
  quantities: Readonly<Record<string, number>>;
  /** Sets how many of a pack (by pack id) are in the cart. More than are in stock is cut down to what is in stock. */
  setQuantity: (packId: string, next: number) => void;
  /** How many items are in the cart, from all shops. */
  count: number;
  /** For example "3 items". */
  itemsLabel: string;
  /** The whole cart's total, from all shops, for example "₹126". */
  totalLabel: string;
  /** One basket for each shop that has something in the cart, the shop touched most recently first. */
  baskets: readonly ShopBasket[];
  /** For the cart bar: the shop's name, or "2 shops" when the cart comes from more than one. */
  shopLabel: string;
  /**
   * Free delivery counts the whole cart's value, whichever shops it comes from: once the total reaches the
   * line, every basket's delivery is free.
   */
  free: boolean;
  /** How far the whole cart is from free delivery, or that it is unlocked. */
  hint: string;
  /** How close the whole cart is to free delivery, from 0 to 1. */
  progress: number;
  /** What the whole cart saves against the printed prices, for example "You saved ₹7". Absent when it saves nothing. */
  savedLabel?: string;
  /** What is in the cart, latest first: for the little pictures in the cart bar. */
  lines: readonly { id: string; emoji: string; category: ItemCategory }[];
  /** False until the cart saved on the phone has been read back. Until then it looks empty only because it is still loading. */
  ready: boolean;
  /**
   * What changed in the saved cart when it was read back: how many packs were taken out (gone or out of stock) and how
   * many were lowered to the stock left. Null when nothing changed, or once the shopper has seen it.
   */
  restored: { gone: number; lowered: number } | null;
  dismissRestored: () => void;
  /** The pack whose last unit was just taken out, so it can be put back. Cleared by `clearRemoved` or any new addition. */
  removed: { name: string } | null;
  undoRemove: () => void;
  clearRemoved: () => void;
}

/** The most of one pack that one order may hold, whatever the stock. */
const COUNT_MAX = 20;

/** Where the phone keeps the cart, so it is still there after the app is closed. */
const CART_KEY = 'quibo.cart';

interface Removal {
  packId: string;
  name: string;
  previous: number;
}

/** Every pack of every item, with the item it belongs to, by pack id. */
function packIndex(items: readonly HomeItem[]) {
  return new Map(
    items.flatMap((item) => item.packs.map((pack) => [pack.id, { item, pack }] as const)),
  );
}

/**
 * The cart, kept on the phone: it is read back when the app opens and checked against what the shops have now. A
 * cart can hold items from several shops: they are grouped into one basket per shop for packing, but the whole cart
 * is a single order with one delivery. The cart counts by pack, so a product's two sizes are two lines. Money is
 * added up in integer paise.
 */
export function useDraftCart(): DraftCart {
  const { t } = useLanguage();
  const items = useHomeItems();
  const [quantities, setQuantities] = useState<Readonly<Record<string, number>>>({});
  // The order packs were first added in, so "latest first" is known.
  const [order, setOrder] = useState<readonly string[]>([]);
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState<{ gone: number; lowered: number } | null>(null);
  const packs = packIndex(items);

  // The catalogue as it is when the app opens, for the read-back below to check the saved cart against.
  const [limits] = useState<ReadonlyMap<string, PackLimit>>(
    () =>
      new Map(
        [...packs.entries()].map(([packId, { pack }]) => [
          packId,
          {
            available: pack.available,
            ...(pack.maxQuantity !== undefined ? { maxQuantity: pack.maxQuantity } : {}),
          },
        ]),
      ),
  );

  // Read the saved cart once. Anything added before it arrives stays on top of it.
  useEffect(() => {
    let live = true;
    void readSetting(CART_KEY).then((saved) => {
      if (!live) return;
      const back = restoreCart(saved, limits, COUNT_MAX);
      setQuantities((current) => ({ ...back.quantities, ...current }));
      setOrder((current) => [...back.order.filter((id) => !current.includes(id)), ...current]);
      if (back.gone > 0 || back.lowered > 0)
        setRestored({ gone: back.gone, lowered: back.lowered });
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [limits]);

  // Keep the phone's copy up to date, but never write over the saved cart before it has been read.
  useEffect(() => {
    if (!ready) return;
    void writeSetting(CART_KEY, serialiseCart(order, quantities));
  }, [ready, order, quantities]);

  const apply = (packId: string, next: number) => {
    setQuantities((current) => ({ ...current, [packId]: next }));
    setOrder((current) => (current.includes(packId) ? current : [...current, packId]));
  };

  const setQuantity = (packId: string, next: number) => {
    const found = packs.get(packId);
    if (found === undefined) return;
    const previous = quantities[packId] ?? 0;
    const allowed = capQuantity(next, found.pack.maxQuantity, COUNT_MAX);
    apply(packId, allowed);
    if (allowed === 0 && previous > 0) setRemoval({ packId, name: found.item.name, previous });
    else if (allowed > previous) setRemoval(null);
  };

  // The packs in the cart, the latest-added first.
  const inCart = [...packs.entries()]
    .filter(([packId]) => (quantities[packId] ?? 0) > 0)
    .sort(([a], [b]) => order.indexOf(b) - order.indexOf(a));

  const entries: CartEntry[] = inCart.map(([packId, { item, pack }]) => ({
    packId,
    productId: item.id,
    shopId: item.shop,
    shopName: item.shopName,
    price: pack.price,
    ...(pack.mrp !== undefined ? { mrp: pack.mrp } : {}),
    quantity: quantities[packId] ?? 0,
  }));
  const sum = summariseCart(entries);

  const baskets: ShopBasket[] = sum.baskets.map((basket) => ({
    id: basket.shopId,
    name: basket.shopName,
    count: basket.count,
    totalLabel: formatRupees(basket.total),
    lines: basket.lines.map(({ entry, lineTotal }) => {
      const found = packs.get(entry.packId);
      return {
        id: entry.packId,
        name: found?.item.name ?? '',
        pack: found?.pack.label ?? '',
        emoji: found?.item.emoji ?? '',
        category: found?.item.category ?? 'dairy',
        quantity: entry.quantity,
        ...(found?.pack.maxQuantity !== undefined ? { maxQuantity: found.pack.maxQuantity } : {}),
        totalLabel: formatRupees(lineTotal),
      };
    }),
  }));

  // Free delivery is worked out on the whole cart, so a few things from each of two shops can add up to it.
  const free = sum.total >= FREE_DELIVERY_FROM;
  const remaining = free ? money(0) : subtract(FREE_DELIVERY_FROM, sum.total);

  const focus = baskets[0];

  return {
    quantities,
    setQuantity,
    count: sum.count,
    itemsLabel: t(sum.count === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', {
      count: sum.count,
    }),
    totalLabel: formatRupees(sum.total),
    baskets,
    shopLabel:
      baskets.length > 1
        ? t('home.cart.shopsMany', { count: baskets.length })
        : (focus?.name ?? ''),
    free,
    hint: free
      ? t('home.cart.freeReached')
      : t('home.cart.freeNeed', { amount: formatRupees(remaining) }),
    progress: Math.min(Number(sum.total) / Number(FREE_DELIVERY_FROM), 1),
    ...(sum.saved > 0
      ? { savedLabel: t('home.cart.saved', { amount: formatRupees(sum.saved) }) }
      : {}),
    lines: inCart.map(([packId, { item }]) => ({
      id: packId,
      emoji: item.emoji,
      category: item.category,
    })),
    ready,
    restored,
    dismissRestored: () => {
      setRestored(null);
    },
    removed: removal === null ? null : { name: removal.name },
    undoRemove: () => {
      if (removal === null) return;
      apply(removal.packId, removal.previous);
      setRemoval(null);
    },
    clearRemoved: () => {
      setRemoval(null);
    },
  };
}
