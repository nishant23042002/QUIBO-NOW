import { PRICE_TIERS } from './priceTiers';

/**
 * "Trending in Roha" (ADR 0055, step 7): a grid of what is on the shelves, with its own tabs. They are views of the same items,
 * not categories (the header's rail and the category screens are for that). Plain code with no React in it.
 */
export type TrendingTab = 'all' | 'offers' | 'under' | 'veg';

export const TRENDING_TABS: readonly TrendingTab[] = ['all', 'offers', 'under', 'veg'];

/** The price "Under" means, in paise: the middle of the price tiers (₹50). */
export const TRENDING_UNDER: number = PRICE_TIERS[1] ?? 5000;

/** The most cards the grid shows before "See all". */
export const TRENDING_MOST = 8;

interface TrendingItem {
  price: number;
  mrp?: number | undefined;
  diet: { kind: 'veg' | 'nonveg' };
  stock?: { kind: 'out' | 'low' } | undefined;
}

function suits(item: TrendingItem, tab: TrendingTab): boolean {
  switch (tab) {
    case 'all':
      return true;
    case 'offers':
      return item.mrp !== undefined && item.mrp > item.price;
    case 'under':
      return item.price <= TRENDING_UNDER;
    case 'veg':
      return item.diet.kind === 'veg';
  }
}

/**
 * The items a tab shows, in the order given, without what is out of stock (a card that cannot be added should not lead the grid),
 * and no more than `most`.
 */
export function trendingItems<T extends TrendingItem>(
  tab: TrendingTab,
  items: readonly T[],
  most: number = TRENDING_MOST,
): T[] {
  return items.filter((item) => item.stock?.kind !== 'out' && suits(item, tab)).slice(0, most);
}
