/** The other products from the same shop in other aisles (categories), in the order they were given. Used for "More from this shop". */
export function moreFromShop<T extends { id: string; shop: string; category: string }>(
  items: readonly T[],
  item: { id: string; shop: string; category: string },
): T[] {
  return items.filter(
    (candidate) =>
      candidate.shop === item.shop &&
      candidate.category !== item.category &&
      candidate.id !== item.id,
  );
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
