import { THUMBS_FIT } from './split';

/** One order card of the skeleton, from what the order it stands for will show. */
export interface OrderCardShape {
  /** An order in progress: it has the green outline and the "Track" line. */
  active: boolean;
  /** How many pictures its row has (up to four), and whether a "+N" tile follows. */
  thumbs: number;
  more: boolean;
  /** How long the line naming the shops is, in letters, so its bar is about as long. */
  shopLetters: number;
}

/**
 * What the Orders skeleton draws: the cards the chosen filter will show (at most three, which is more than a screen), or the
 * message that stands in for them when there are none.
 */
export type OrdersShape =
  | { kind: 'cards'; cards: readonly OrderCardShape[] }
  /** No orders at all: the empty page's picture, title, words and button. */
  | { kind: 'empty' }
  /** There are orders, but none under this filter: the dashed note. */
  | { kind: 'none' };

export const ORDERS_SKELETON_MAX = 3;

/** Before the saved orders have been read, two orders in progress are the likeliest. */
export const FIRST_ORDERS_SHAPE: OrdersShape = {
  kind: 'cards',
  cards: [
    { active: true, thumbs: 3, more: false, shopLetters: 24 },
    { active: true, thumbs: 2, more: false, shopLetters: 14 },
  ],
};

interface ShapedOrder {
  items: readonly unknown[];
  shops: readonly { name: string }[];
}

/** The skeleton's shape from the orders the page will list, and which filter is chosen. */
export function ordersShape(
  all: readonly ShapedOrder[],
  shown: readonly ShapedOrder[],
  active: boolean,
): OrdersShape {
  if (all.length === 0) return { kind: 'empty' };
  if (shown.length === 0) return { kind: 'none' };
  return {
    kind: 'cards',
    cards: shown.slice(0, ORDERS_SKELETON_MAX).map((order) => ({
      active,
      thumbs: Math.min(order.items.length, THUMBS_FIT),
      more: order.items.length > THUMBS_FIT,
      shopLetters: order.shops.map((shop) => shop.name).join(', ').length,
    })),
  };
}
