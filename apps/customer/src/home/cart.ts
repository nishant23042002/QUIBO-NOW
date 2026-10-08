import {
  add,
  formatRupees,
  money,
  multiplyByQuantity,
  subtract,
  type Money,
} from '@quibo/contracts';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { FREE_DELIVERY_FROM } from './delivery';
import { useHomeItems, type ItemCategory } from './items';

/** One item in a shop's basket. */
export interface BasketLine {
  id: string;
  name: string;
  pack: string;
  emoji: string;
  category: ItemCategory;
  quantity: number;
  /** What this line comes to, for example "₹58". */
  totalLabel: string;
}

/**
 * Everything in the cart that comes from one shop. Each shop's basket becomes its own order, with its own
 * delivery. Free delivery is not decided per basket: it counts the whole cart (see `DraftCart.free`).
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
  quantities: Readonly<Record<string, number>>;
  setQuantity: (id: string, next: number) => void;
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
  /** The item whose last unit was just taken out, so it can be put back. Cleared by `clearRemoved` or any new addition. */
  removed: { name: string } | null;
  undoRemove: () => void;
  clearRemoved: () => void;
}

interface Removal {
  id: string;
  name: string;
  previous: number;
}

/**
 * The cart as it is being filled on Home, kept in memory. The real cart (Phase 1d) takes this over, with
 * the same shape. A cart can hold items from several shops: they are grouped into one basket per shop, and
 * each basket will be its own order (an order is from one shop). Money is added up in integer paise.
 */
export function useDraftCart(): DraftCart {
  const { t } = useLanguage();
  const items = useHomeItems();
  const [quantities, setQuantities] = useState<Readonly<Record<string, number>>>({});
  // The order things were first added in, so "latest first" is known.
  const [order, setOrder] = useState<readonly string[]>([]);
  const [removal, setRemoval] = useState<Removal | null>(null);

  const apply = (id: string, next: number) => {
    setQuantities((current) => ({ ...current, [id]: next }));
    setOrder((current) => (current.includes(id) ? current : [...current, id]));
  };

  const setQuantity = (id: string, next: number) => {
    const item = items.find((candidate) => candidate.id === id);
    if (item === undefined) return;
    const previous = quantities[id] ?? 0;
    apply(id, next);
    if (next === 0 && previous > 0) setRemoval({ id, name: item.name, previous });
    else if (next > previous) setRemoval(null);
  };

  // The items in the cart, the latest-added first.
  const inCart = items
    .filter((item) => (quantities[item.id] ?? 0) > 0)
    .sort((a, b) => order.indexOf(b.id) - order.indexOf(a.id));

  let count = 0;
  let total: Money = money(0);
  let saved: Money = money(0);
  const byShop = new Map<
    string,
    { name: string; lines: BasketLine[]; total: Money; count: number }
  >();
  for (const item of inCart) {
    const quantity = quantities[item.id] ?? 0;
    const lineTotal = multiplyByQuantity(item.price, quantity);
    count += quantity;
    total = add(total, lineTotal);
    if (item.mrp !== undefined && item.mrp > item.price) {
      saved = add(saved, multiplyByQuantity(subtract(item.mrp, item.price), quantity));
    }
    const basket = byShop.get(item.shop) ?? {
      name: item.shopName,
      lines: [],
      total: money(0),
      count: 0,
    };
    basket.lines.push({
      id: item.id,
      name: item.name,
      pack: item.pack,
      emoji: item.emoji,
      category: item.category,
      quantity,
      totalLabel: formatRupees(lineTotal),
    });
    basket.total = add(basket.total, lineTotal);
    basket.count += quantity;
    byShop.set(item.shop, basket);
  }

  const baskets: ShopBasket[] = [...byShop.entries()].map(([id, basket]) => ({
    id,
    name: basket.name,
    count: basket.count,
    totalLabel: formatRupees(basket.total),
    lines: basket.lines,
  }));

  // Free delivery is worked out on the whole cart, so a few things from each of two shops can add up to it.
  const free = total >= FREE_DELIVERY_FROM;
  const remaining = free ? money(0) : subtract(FREE_DELIVERY_FROM, total);

  const focus = baskets[0];

  return {
    quantities,
    setQuantity,
    count,
    itemsLabel: t(count === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', { count }),
    totalLabel: formatRupees(total),
    baskets,
    shopLabel:
      baskets.length > 1
        ? t('home.cart.shopsMany', { count: baskets.length })
        : (focus?.name ?? ''),
    free,
    hint: free
      ? t('home.cart.freeReached')
      : t('home.cart.freeNeed', { amount: formatRupees(remaining) }),
    progress: Math.min(Number(total) / Number(FREE_DELIVERY_FROM), 1),
    ...(saved > 0 ? { savedLabel: t('home.cart.saved', { amount: formatRupees(saved) }) } : {}),
    lines: inCart.map((item) => ({ id: item.id, emoji: item.emoji, category: item.category })),
    removed: removal === null ? null : { name: removal.name },
    undoRemove: () => {
      if (removal === null) return;
      apply(removal.id, removal.previous);
      setRemoval(null);
    },
    clearRemoved: () => {
      setRemoval(null);
    },
  };
}
