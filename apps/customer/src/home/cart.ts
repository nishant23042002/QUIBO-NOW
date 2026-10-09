import { formatRupees, money, multiplyByQuantity, subtract, type Money } from '@quibo/contracts';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { readSetting, writeSetting } from '@/storage';
import { computeBill, type Bill } from './bill';
import { careOf } from './care';
import { summariseCart, type CartEntry } from './cartMath';
import { restoreCart, serialiseCart, type PackLimit } from './cartStore';
import { FREE_DELIVERY_FROM, SAMPLE_DISTANCE_KM, ZONE } from './delivery';
import { useConditions } from './conditions';
import { capQuantity } from './packs';
import { quickEta, type QuickEta } from './quick';
import { useCoupon, type CouponState } from './useCoupon';
import { useInstructions, type InstructionsState } from './useInstructions';
import { useSlotChoice, type SlotState } from './useSlotChoice';
import { useHomeItems, type HomeItem, type ItemCategory } from './items';

/** One pack of an item in the cart. The cart is one flat list: it is one order, however many stores it comes from. */
export interface CartItem {
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
  /** What the same line would cost at the printed price, for example "₹64", when that is more. Shown struck through. */
  mrpLabel?: string;
  /** The partner shop that sells it. Absent when the town has one dark store, where there is nothing to tell apart. */
  soldBy?: string;
}

/** When and how the order arrives: the shopper's choice, how it resolves now, and the quick-delivery estimate. */
export interface DeliveryState extends SlotState {
  /** The estimated minutes for quick delivery, as a range. An estimate, never a promise. */
  eta: QuickEta;
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
  /** Everything in the cart, the item added most recently first. */
  items: readonly CartItem[];
  /** How many different stores the cart comes from: 1 in a dark-store town, and often 1 in a partner one. */
  storeCount: number;
  /** For the cart bar: the store's name, or "2 shops" when the cart comes from more than one. */
  shopLabel: string;
  /** Free delivery counts the whole cart's value, whichever stores it comes from. */
  free: boolean;
  /** How far the whole cart is from free delivery, or that it is unlocked. */
  hint: string;
  /** How close the whole cart is to free delivery, from 0 to 1. */
  progress: number;
  /** What the whole cart saves against the printed prices, for example "You saved ₹7". Absent when it saves nothing. */
  savedLabel?: string;
  /** What the order comes to: items, delivery, handling, and what is saved. All integer paise. */
  bill: Bill;
  /** The coupon: what is on offer, which one is applied, and what it takes off. */
  coupon: CouponState;
  /** The tip for the rider: nothing by default, easy to add and to take away. */
  tip: {
    amount: Money;
    set: (amount: Money) => void;
    /** The ready-made amounts, and the most a tip may be. */
    options: readonly Money[];
    max: Money;
  };
  /** What the shopper wants the rider to know: quick choices and a note. */
  instructions: InstructionsState;
  /** When the order arrives: quick delivery (the default) or a window the shopper picked, kept on the phone. */
  delivery: DeliveryState;
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
 * cart can hold items from several shops, or from the town's one dark store, but it is a single order with one
 * delivery, shown as one flat list. The cart counts by pack, so a product's two sizes are two lines. Money is
 * added up in integer paise.
 */
export function useDraftCart(): DraftCart {
  const { t } = useLanguage();
  const homeItems = useHomeItems();
  const conditions = useConditions();
  const dark = conditions.store === 'dark';
  const delivery = useSlotChoice();
  const instructions = useInstructions();
  const [tipAmount, setTipAmount] = useState<Money>(money(0));
  const [quantities, setQuantities] = useState<Readonly<Record<string, number>>>({});
  // The order packs were first added in, so "latest first" is known.
  const [order, setOrder] = useState<readonly string[]>([]);
  const [removal, setRemoval] = useState<Removal | null>(null);
  // The saved cart has been read back. (The cart as a whole is `ready` once its coupon and delivery choice are too.)
  const [loaded, setLoaded] = useState(false);
  const [restored, setRestored] = useState<{ gone: number; lowered: number } | null>(null);
  const packs = packIndex(homeItems);

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
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, [limits]);

  // Keep the phone's copy up to date, but never write over the saved cart before it has been read.
  useEffect(() => {
    if (!loaded) return;
    void writeSetting(CART_KEY, serialiseCart(order, quantities));
  }, [loaded, order, quantities]);

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
    shopId: dark ? 'quibo' : item.shop,
    shopName: dark ? t('cart.darkStore') : item.shopName,
    price: pack.price,
    ...(pack.mrp !== undefined ? { mrp: pack.mrp } : {}),
    quantity: quantities[packId] ?? 0,
  }));
  const sum = summariseCart(entries);
  const coupon = useCoupon(sum.total, loaded);
  // A cart emptied of everything has no tip either: it was for that order's rider.
  if (loaded && sum.count === 0 && tipAmount > 0) setTipAmount(money(0));
  const bill = computeBill({
    itemTotal: sum.total,
    saved: sum.saved,
    cares: inCart.map(([, { item }]) => careOf(item.id, item.category)),
    trip: {
      distanceKm: SAMPLE_DISTANCE_KM,
      // The window the order is delivered in sets the hour, so a quieter window can cost less.
      hour:
        delivery.current?.kind === 'slot' ? delivery.current.slot.hour : delivery.now.getHours(),
      festival: conditions.festival,
      rain: conditions.rain,
      rush: conditions.rush,
    },
    ...(coupon.applied !== undefined && coupon.discount > 0
      ? { coupon: { code: coupon.applied.offer.code, discount: coupon.discount } }
      : {}),
    tip: tipAmount,
  });

  const lineTotals = new Map(
    sum.baskets.flatMap((basket) =>
      basket.lines.map((line) => [line.entry.packId, line.lineTotal] as const),
    ),
  );
  const items: CartItem[] = inCart.map(([packId, { item, pack }]) => ({
    id: packId,
    name: item.name,
    pack: pack.label,
    emoji: item.emoji,
    category: item.category,
    quantity: quantities[packId] ?? 0,
    ...(pack.maxQuantity !== undefined ? { maxQuantity: pack.maxQuantity } : {}),
    totalLabel: formatRupees(lineTotals.get(packId) ?? money(0)),
    ...(pack.mrp !== undefined && pack.mrp > pack.price
      ? { mrpLabel: formatRupees(multiplyByQuantity(pack.mrp, quantities[packId] ?? 0)) }
      : {}),
    ...(dark ? {} : { soldBy: item.shopName }),
  }));

  // Free delivery is worked out on the whole cart, so a few things from each of two stores can add up to it.
  const free = sum.total >= FREE_DELIVERY_FROM;
  const remaining = free ? money(0) : subtract(FREE_DELIVERY_FROM, sum.total);

  const focus = sum.baskets[0];

  return {
    quantities,
    setQuantity,
    count: sum.count,
    itemsLabel: t(sum.count === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', {
      count: sum.count,
    }),
    totalLabel: formatRupees(sum.total),
    items,
    storeCount: sum.baskets.length,
    shopLabel:
      sum.baskets.length > 1
        ? t('home.cart.shopsMany', { count: sum.baskets.length })
        : (focus?.shopName ?? ''),
    free,
    hint: free
      ? t('home.cart.freeReached')
      : t('home.cart.freeNeed', { amount: formatRupees(remaining) }),
    progress: Math.min(Number(sum.total) / Number(FREE_DELIVERY_FROM), 1),
    bill,
    coupon,
    tip: { amount: tipAmount, set: setTipAmount, options: ZONE.tip.options, max: ZONE.tip.max },
    instructions,
    delivery: {
      ...delivery,
      eta: quickEta({
        distanceKm: SAMPLE_DISTANCE_KM,
        hour: delivery.now.getHours(),
        festival: conditions.festival,
        rain: conditions.rain,
        rush: conditions.rush,
        items: sum.count,
      }),
    },
    ...(sum.saved > 0
      ? { savedLabel: t('home.cart.saved', { amount: formatRupees(sum.saved) }) }
      : {}),
    lines: inCart.map(([packId, { item }]) => ({
      id: packId,
      emoji: item.emoji,
      category: item.category,
    })),
    ready: loaded && coupon.loaded && delivery.loaded && instructions.loaded,
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
