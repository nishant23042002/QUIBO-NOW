/**
 * The "Small prices" section of Home: everyday things picked by what they cost. The tiers are data (in paise, as every amount is), so
 * a town can have its own; these are the samples until the API supplies them (Phase 2). Plain code with no React in it, so it can be
 * tested alone.
 */

/** The price limits of the tabs, in paise, lowest first: under ₹30, under ₹50, under ₹100. */
export const PRICE_TIERS: readonly number[] = [3000, 5000, 10000];

/** The most cards one tab shows, so the row stays a quick look and not a second catalogue. */
export const MOST_SHOWN = 8;

export interface PricedItem {
  id: string;
  /** Integer paise (a Money value is a number). */
  price: number;
  stock?: { kind: 'out' | 'low' } | undefined;
}

/**
 * The items that cost no more than `limit`, cheapest first (ties keep their order), without what is out of stock, and at most
 * `most` of them.
 */
export function pickUnder<T extends PricedItem>(
  items: readonly T[],
  limit: number,
  most: number = MOST_SHOWN,
): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.price <= limit && item.stock?.kind !== 'out')
    .sort((a, b) => a.item.price - b.item.price || a.index - b.index)
    .slice(0, most)
    .map(({ item }) => item);
}
