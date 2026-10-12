/**
 * Sorting and narrowing a category screen's items. Plain functions over the fields an item already has, so they are tested without a
 * screen and will work the same over the API's items.
 */

export type SortKey = 'relevance' | 'priceLow' | 'priceHigh' | 'saving';

export const SORT_KEYS: readonly SortKey[] = ['relevance', 'priceLow', 'priceHigh', 'saving'];

export interface CategoryFilters {
  /**
   * The choices made in the filters whose choices are values an item has (quantity, brand, kind, origin, fat profile...), by filter
   * id. An item passes a filter when it has at least one of the values chosen; a filter with nothing chosen lets everything through.
   */
  values: Readonly<Record<string, readonly string[]>>;
  /** The most a card may cost, in paise; null means any price. */
  maxPrice: number | null;
  diet: 'veg' | 'nonveg' | null;
  offersOnly: boolean;
}

export const NO_FILTERS: CategoryFilters = {
  values: {},
  maxPrice: null,
  diet: null,
  offersOnly: false,
};

/** The fields of an item that sorting and filtering read. */
export interface Browsable {
  /** The price of the pack the card shows, in paise. */
  price: number;
  /** What it would have cost; the saving is the difference when it is more than the price. */
  mrp?: number | undefined;
  diet: { kind: 'veg' | 'nonveg' };
  stock?: { kind: 'out' | 'low' } | undefined;
}

/** Reads the values an item has for a value filter (see `facetValues`). */
export type FacetReader<T> = (item: T, facet: string) => readonly string[];

/** Whether the item is on offer: a price lower than what it would have cost. */
export function isOnOffer(item: Browsable): boolean {
  return item.mrp !== undefined && item.mrp > item.price;
}

/** What buying it saves, in paise (0 when it is not on offer). */
export function savingOf(item: Browsable): number {
  return item.mrp !== undefined && item.mrp > item.price ? item.mrp - item.price : 0;
}

/** The items that pass every filter that is on. */
export function applyFilters<T extends Browsable>(
  items: readonly T[],
  filters: CategoryFilters,
  read: FacetReader<T>,
): T[] {
  const chosen = Object.entries(filters.values).filter(([, picked]) => picked.length > 0);
  return items.filter((item) => {
    for (const [facet, picked] of chosen) {
      if (!read(item, facet).some((value) => picked.includes(value))) return false;
    }
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;
    if (filters.diet !== null && item.diet.kind !== filters.diet) return false;
    if (filters.offersOnly && !isOnOffer(item)) return false;
    return true;
  });
}

/**
 * The items in the order chosen. The sort is stable (equal items keep their given order), and an item that is sold out comes last
 * whichever way the rest are ordered, so a shopper never has to scroll past what they cannot buy.
 */
export function sortItems<T extends Browsable>(items: readonly T[], key: SortKey): T[] {
  const soldOut = (item: T) => item.stock?.kind === 'out';
  const compare = (a: T, b: T): number => {
    switch (key) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'saving':
        return savingOf(b) - savingOf(a);
      case 'relevance':
        return 0;
    }
  };
  const indexed = items.map((item, index) => ({ item, index }));
  indexed.sort((a, b) => {
    const out = Number(soldOut(a.item)) - Number(soldOut(b.item));
    if (out !== 0) return out;
    return compare(a.item, b.item) || a.index - b.index;
  });
  return indexed.map((entry) => entry.item);
}

/** How many filters are narrowing: each value filter with a choice, the price, the food type and offers count once. */
export function activeFilterCount(filters: CategoryFilters): number {
  const valueFilters = Object.values(filters.values).filter((picked) => picked.length > 0).length;
  return (
    valueFilters +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.diet !== null ? 1 : 0) +
    (filters.offersOnly ? 1 : 0)
  );
}

/** How many of one value filter's choices are on (0 for a filter nothing is chosen in). */
export function chosenIn(filters: CategoryFilters, facet: string): number {
  return filters.values[facet]?.length ?? 0;
}

/** The filters with one value toggled in a value filter. */
export function toggleValue(
  filters: CategoryFilters,
  facet: string,
  value: string,
): CategoryFilters {
  const current = filters.values[facet] ?? [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  return { ...filters, values: { ...filters.values, [facet]: next } };
}

/**
 * The filters as they really apply to a list: a choice made earlier that the list being shown does not have (another kind was
 * chosen in the rail) is dropped, so the shopper is never filtered on something they cannot see. `available` gives, for each value
 * filter, the choices the list has.
 */
export function effectiveFilters(
  filters: CategoryFilters,
  available: Readonly<Record<string, readonly string[]>>,
): CategoryFilters {
  let changed = false;
  const values: Record<string, readonly string[]> = {};
  for (const [facet, picked] of Object.entries(filters.values)) {
    const kept = picked.filter((value) => available[facet]?.includes(value) === true);
    if (kept.length !== picked.length) changed = true;
    values[facet] = kept;
  }
  return changed ? { ...filters, values } : filters;
}
