/**
 * "Buy again" (ADR 0055, step 7): what the customer has already bought, from the orders the phone keeps, ready to add again at
 * today's prices. Plain code with no React in it, so it can be tested alone.
 */

export type AgainTab = 'last' | 'most';

/** The most things the row shows. */
export const AGAIN_MOST = 8;

/** The statuses that mean the order did not happen: nothing in it was really bought. */
const NOT_BOUGHT: readonly string[] = ['rejected', 'cancelled', 'undelivered'];

export interface AgainOrder {
  status: string;
  items: readonly { packId: string }[];
}

/** The orders that were really bought, in the order given (newest first). */
function bought<T extends AgainOrder>(orders: readonly T[]): T[] {
  return orders.filter((entry) => !NOT_BOUGHT.includes(entry.status));
}

/**
 * The pack ids to offer. "Last order": what was in the newest order that happened, in its order. "Most ordered": every pack counted
 * once per order it was in, most orders first, ties going to the more recent. Each pack once, at most `AGAIN_MOST`.
 */
export function againPackIds(
  orders: readonly AgainOrder[],
  tab: AgainTab,
  most: number = AGAIN_MOST,
): string[] {
  const happened = bought(orders);
  if (tab === 'last') {
    const newest = happened[0];
    return newest === undefined
      ? []
      : [...new Set(newest.items.map((item) => item.packId))].slice(0, most);
  }
  const counts = new Map<string, { count: number; first: number }>();
  happened.forEach((entry, position) => {
    for (const packId of new Set(entry.items.map((item) => item.packId))) {
      const seen = counts.get(packId);
      if (seen === undefined) counts.set(packId, { count: 1, first: position });
      else seen.count += 1;
    }
  });
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].first - b[1].first)
    .slice(0, most)
    .map(([packId]) => packId);
}

/**
 * The items today's catalogue holds for those packs, each once, in the order given. A pack the catalogue no longer lists is left
 * out. An item that is out of stock is kept (the row says so), so a shopper learns it, not finds it missing.
 */
export function againItems<T extends { id: string; packs: readonly { id: string }[] }>(
  packIds: readonly string[],
  items: readonly T[],
): T[] {
  const found: T[] = [];
  for (const packId of packIds) {
    const item = items.find((candidate) => candidate.packs.some((pack) => pack.id === packId));
    if (item !== undefined && !found.includes(item)) found.push(item);
  }
  return found;
}
