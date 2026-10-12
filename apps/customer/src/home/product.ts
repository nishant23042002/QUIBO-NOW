/**
 * The same kind of product from other brands, in the order they were given. Used for "Other brands of this". An item with no brand
 * (loose produce, a shop's own goods) has none, and neither does the item's own brand's other products.
 */
export function otherBrands<T extends { id: string; type: string; brand?: { id: string } }>(
  items: readonly T[],
  item: { id: string; type: string; brand?: { id: string } },
): T[] {
  const own = item.brand;
  if (own === undefined) return [];
  return items.filter(
    (candidate) =>
      candidate.type === item.type &&
      candidate.id !== item.id &&
      candidate.brand !== undefined &&
      candidate.brand.id !== own.id,
  );
}

/** A brand that has items in a category, with how many. */
export interface CategoryBrand {
  id: string;
  name: string;
  mark: string;
  count: number;
}

/** The brands that have items in a category, in the order they first appear. Used for "Brands in this category". */
export function brandsInCategory<
  T extends { category: string; brand?: { id: string; name: string; mark: string } },
>(items: readonly T[], category: string): CategoryBrand[] {
  const found = new Map<string, CategoryBrand>();
  for (const item of items) {
    if (item.category !== category || item.brand === undefined) continue;
    const seen = found.get(item.brand.id);
    if (seen === undefined) found.set(item.brand.id, { ...item.brand, count: 1 });
    else seen.count += 1;
  }
  return [...found.values()];
}

/** The other products in the same category, from any shop, in the order they were given. Used for "Popular in this category". */
export function similarItems<T extends { id: string; category: string }>(
  items: readonly T[],
  item: { id: string; category: string },
): T[] {
  return items.filter(
    (candidate) => candidate.category === item.category && candidate.id !== item.id,
  );
}

/** Whether one price per unit is lower than another, when both are per the same kind of unit (per litre, per kilogram, per piece). */
export function cheaperPerUnit(
  candidate: { kind: string; paise: number } | undefined,
  current: { kind: string; paise: number } | undefined,
): boolean {
  return (
    candidate !== undefined &&
    current !== undefined &&
    candidate.kind === current.kind &&
    candidate.paise < current.paise
  );
}

/**
 * The size the product page opens on: the best-value size when that can be bought and the owner's trial is on, otherwise the size
 * the card showed.
 */
export function startingPackId(
  item: {
    defaultPackId: string;
    packs: readonly { id: string; bestValue: boolean; available: boolean }[];
  },
  preselectBestValue: boolean,
): string {
  if (!preselectBestValue) return item.defaultPackId;
  return item.packs.find((pack) => pack.bestValue && pack.available)?.id ?? item.defaultPackId;
}

/**
 * One item for each kind of product, for the lists on Home: the same kind sold under several brands ("Toned milk" from Amul, Gokul
 * and Chitale) shows once, and the product page shows the others. The one shown is the first listed, or the first that is in stock
 * when that one is sold out. Items keep the order of their kind's first appearance, and an item with no other brand stands alone.
 */
export function oneOfEachKind<T extends { type: string; stock?: { kind: 'out' | 'low' } }>(
  items: readonly T[],
): T[] {
  const order: string[] = [];
  const chosen = new Map<string, T>();
  for (const item of items) {
    const current = chosen.get(item.type);
    if (current === undefined) {
      order.push(item.type);
      chosen.set(item.type, item);
    } else if (current.stock?.kind === 'out' && item.stock?.kind !== 'out') {
      chosen.set(item.type, item);
    }
  }
  return order.flatMap((type) => {
    const item = chosen.get(type);
    return item === undefined ? [] : [item];
  });
}
