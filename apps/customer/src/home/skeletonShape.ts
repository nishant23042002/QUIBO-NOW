/**
 * What a page's skeleton draws, worked out from what is known about the page before it has loaded, so the grey blocks
 * have the shape of the page that is coming: as many lines as the cart has items, a saved list only when something is
 * saved, the empty cart's picture when the cart is empty.
 */

/** A cart taller than this is not drawn in full: the rest is below the fold, and the grey blocks would only be longer. */
export const CART_LINES_MAX = 5;
export const SAVED_MAX = 2;
export const COUPONS_MAX = 4;
/** Items, delivery and handling: the bill lines every cart has. */
export const BILL_ROWS_BASE = 3;

export const clampCount = (count: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.floor(count)));

export interface CartShape {
  /** Nothing in the cart: the skeleton is the empty cart's picture, title and button instead of a list. */
  empty: boolean;
  /** How many item lines to draw. */
  lines: number;
  /** How many saved-for-later rows to draw; 0 draws no such card. */
  saved: number;
  /** The cart comes from more than one shop, so the "one rider collects it all" note is drawn. */
  trip: boolean;
  /** How many lines the bill has: items, delivery and handling, plus a coupon and a tip when there are some. */
  billRows: number;
  /** The cart holds a loose item, so the bill has the note about weighing. */
  weighed: boolean;
}

/** The cart's shape from what is in it: its lines, its saved items and its shops. */
export function cartShape(facts: {
  lines: number;
  saved: number;
  shops: number;
  coupon?: boolean;
  tip?: boolean;
  weighed?: boolean;
}): CartShape {
  return {
    empty: facts.lines === 0,
    lines: clampCount(facts.lines, 0, CART_LINES_MAX),
    saved: clampCount(facts.saved, 0, SAVED_MAX),
    trip: facts.shops > 1,
    billRows: BILL_ROWS_BASE + (facts.coupon === true ? 1 : 0) + (facts.tip === true ? 1 : 0),
    weighed: facts.weighed === true,
  };
}

/** Before anything is known (the first open after the app starts), a small cart is the likeliest. */
export const FIRST_CART_SHAPE: CartShape = {
  empty: false,
  lines: 2,
  saved: 0,
  trip: false,
  billRows: BILL_ROWS_BASE,
  weighed: false,
};

let remembered: CartShape = FIRST_CART_SHAPE;

/** The cart's shape last time it was on screen: the best guess while the saved cart is still being read. */
export function rememberedCartShape(): CartShape {
  return remembered;
}

export function rememberCartShape(shape: CartShape): void {
  remembered = shape;
}

/** How many coupon cards to draw: one for each offer, at least one and not more than fit the screen. */
export function couponCards(offers: number): number {
  return clampCount(offers, 1, COUPONS_MAX);
}
