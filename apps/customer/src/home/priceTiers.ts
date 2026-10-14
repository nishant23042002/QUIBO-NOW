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
  /** The broad category the Home rows and the price filter use ("dairy", "snacks"). */
  category?: string;
  stock?: { kind: 'out' | 'low' } | undefined;
}

/**
 * The price band a tier stands for: above the tier before it (nothing for the first) and up to and including its own limit, so the
 * bands do not overlap. With the tiers 30, 50 and 100 rupees they are "up to ₹30", "above ₹30 up to ₹50" and "above ₹50 up to ₹100".
 */
export function priceBand(
  index: number,
  tiers: readonly number[] = PRICE_TIERS,
): { above: number; upTo: number } {
  return { above: index > 0 ? (tiers[index - 1] ?? 0) : 0, upTo: tiers[index] ?? 0 };
}

export interface PickOptions {
  /** At most this many. */
  most?: number;
  /** Only items of this category. Undefined keeps them all. */
  category?: string | undefined;
  /** Only items that cost more than this (the top of the band below). Zero keeps them all. */
  above?: number;
}

/**
 * The items that cost more than `above` and no more than `limit`, cheapest first (ties keep their order), without what is out of
 * stock, and at most `most` of them. With a `category`, only items of that category.
 */
export function pickUnder<T extends PricedItem>(
  items: readonly T[],
  limit: number,
  { most = MOST_SHOWN, category, above = 0 }: PickOptions = {},
): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        item.price <= limit &&
        item.price > above &&
        item.stock?.kind !== 'out' &&
        (category === undefined || item.category === category),
    )
    .sort((a, b) => a.item.price - b.item.price || a.index - b.index)
    .slice(0, most)
    .map(({ item }) => item);
}
