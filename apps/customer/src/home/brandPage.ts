/** The items that carry a brand, in the order they were given. */
export function itemsOfBrand<T extends { brand?: { id: string } }>(
  items: readonly T[],
  brandId: string,
): T[] {
  return items.filter((item) => item.brand?.id === brandId);
}

/** A kind of product a brand makes, named by the first of its items of that kind (for example "Toned milk"). */
export interface BrandKind {
  type: string;
  name: string;
  count: number;
}

/** The kinds of product among a brand's items, in the order they first appear, with how many items each has. */
export function kindsOfBrand<T extends { type: string; name: string }>(
  items: readonly T[],
): BrandKind[] {
  const found = new Map<string, BrandKind>();
  for (const item of items) {
    const seen = found.get(item.type);
    if (seen === undefined) found.set(item.type, { type: item.type, name: item.name, count: 1 });
    else seen.count += 1;
  }
  return [...found.values()];
}

/**
 * How many shops sell a brand: the shops of the items shown, plus as many more as the most that any one of those items says other
 * shops also stock. An estimate from sample data until the shops' own catalogues supply it (Phase 2).
 */
export function shopsOfBrand(items: readonly { shop: string; otherShops?: number }[]): number {
  if (items.length === 0) return 0;
  const own = new Set(items.map((item) => item.shop)).size;
  const more = Math.max(0, ...items.map((item) => item.otherShops ?? 0));
  return own + more;
}

/** A brand that has items, with how many. */
export interface BrandSummary {
  id: string;
  name: string;
  mark: string;
  count: number;
}

/** Every brand among the items, in the order it first appears, with how many items it has. Items with no brand count for nothing. */
export function brandsOfItems<T extends { brand?: { id: string; name: string; mark: string } }>(
  items: readonly T[],
): BrandSummary[] {
  const found = new Map<string, BrandSummary>();
  for (const item of items) {
    if (item.brand === undefined) continue;
    const seen = found.get(item.brand.id);
    if (seen === undefined) found.set(item.brand.id, { ...item.brand, count: 1 });
    else seen.count += 1;
  }
  return [...found.values()];
}

/** Narrows items to one brand. With no brand chosen every item stays; with one chosen, an item with no brand does not. */
export function filterByBrand<T extends { brand?: { id: string } }>(
  items: readonly T[],
  brandId: string | null,
): T[] {
  return brandId === null ? [...items] : items.filter((item) => item.brand?.id === brandId);
}

/**
 * The brand a filter is really on: the one chosen if it is still among those on offer, else none. A list that changes under a chosen
 * brand (a new search, another shop) never leaves the shopper filtered on a brand that is no longer there.
 */
export function activeBrand(
  chosen: string | null,
  available: readonly { id: string }[],
): string | null {
  return chosen !== null && available.some((brand) => brand.id === chosen) ? chosen : null;
}
