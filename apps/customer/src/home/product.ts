/** The other items from the same shop, in the order they were given, without the item itself. Used for "More from this shop". */
export function otherItemsInShop<T extends { id: string; shop: string }>(
  items: readonly T[],
  item: { id: string; shop: string },
): T[] {
  return items.filter((candidate) => candidate.shop === item.shop && candidate.id !== item.id);
}
