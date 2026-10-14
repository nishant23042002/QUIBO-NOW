import type { ItemCategory } from './items';

/** The tabs of "Fresh today" (ADR 0055, step 3), in order. */
export type FreshTabId = 'under' | 'veg' | 'fruit' | 'dairy' | 'new';

export interface FreshTab {
  id: FreshTabId;
  /** The picture on the tab; the "under" tab shows its price instead. */
  emoji?: string;
  /** The category the tab's "See all" opens, when it has one. The others open the Categories tab. */
  category?: ItemCategory;
}

export const FRESH_TABS: readonly FreshTab[] = [
  { id: 'under' },
  { id: 'veg', emoji: '\u{1F966}', category: 'vegetables' },
  { id: 'fruit', emoji: '\u{1F34E}', category: 'fruits' },
  { id: 'dairy', emoji: '\u{1F95B}', category: 'dairy' },
  { id: 'new', emoji: '\u{2728}' },
];

/** What the "under" tab holds: items at or under this price, in paise (Rs 30). */
export const UNDER_LIMIT = 3000;

/** The product types that count as new this week, until the API says so (sample data, Phase 2). */
export const NEW_TYPES: readonly string[] = ['popcorn', 'chocolate', 'grapes', 'paneer'];

/** How many cards a tab shows before "See all". */
export const FRESH_LIMIT = 8;

interface FreshCandidate {
  type: string;
  category: ItemCategory;
  price: number;
  stock?: { kind: 'out' | 'low' };
}

/**
 * The items a tab shows, from the page's one-of-each-kind list. Out-of-stock items are left out so a tab never leads with something
 * that cannot be added. The "under" tab is cheapest first; the others keep the town's order.
 */
export function freshItems<T extends FreshCandidate>(tab: FreshTabId, items: readonly T[]): T[] {
  const available = items.filter((item) => item.stock?.kind !== 'out');
  let picked: T[];
  switch (tab) {
    case 'under':
      picked = available
        .filter((item) => item.price <= UNDER_LIMIT)
        .sort((a, b) => a.price - b.price);
      break;
    case 'veg':
      picked = available.filter((item) => item.category === 'vegetables');
      break;
    case 'fruit':
      picked = available.filter((item) => item.category === 'fruits');
      break;
    case 'dairy':
      picked = available.filter((item) => item.category === 'dairy');
      break;
    case 'new':
      picked = available.filter((item) => NEW_TYPES.includes(item.type));
      break;
  }
  return picked.slice(0, FRESH_LIMIT);
}
