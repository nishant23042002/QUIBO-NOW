import type { MessageKey } from '@quibo/i18n';
import type { HomeItem } from './items';

export type EssentialTabId = 'morning' | 'cooking' | 'evening';

/** One tab of "Daily essentials": its name and the items it offers, by item id, in the order they are shown. */
export interface EssentialTab {
  id: EssentialTabId;
  label: MessageKey;
  itemIds: readonly string[];
}

/** The most items a tab shows: three rows of two. */
export const ESSENTIALS_PER_TAB = 6;

/**
 * What Roha buys every day, until the mock API supplies it (Phase 1b). In live phases this is town data (a table with `town_id`),
 * not code, so each town sets its own. An id that is not stocked, or is out of stock, is left out when the tab is shown.
 */
export const ESSENTIAL_TABS: readonly EssentialTab[] = [
  {
    id: 'morning',
    label: 'home.essentials.tabs.morning',
    itemIds: ['milk', 'curd', 'eggs', 'banana', 'biscuits', 'apple'],
  },
  {
    id: 'cooking',
    label: 'home.essentials.tabs.cooking',
    itemIds: ['tomato', 'potato', 'carrot', 'atta', 'rice', 'oil', 'sugar'],
  },
  {
    id: 'evening',
    label: 'home.essentials.tabs.evening',
    itemIds: ['chips', 'biscuits', 'popcorn', 'chocolate', 'milk', 'sugar'],
  },
];

/** The tab that suits the time of day: morning before 11, cooking until 5 in the evening, then evening. */
export function defaultEssentialTab(hour: number): EssentialTabId {
  if (hour < 11) return 'morning';
  if (hour < 17) return 'cooking';
  return 'evening';
}

/** A tab with the items that can be bought now. */
export interface LiveEssentialTab {
  tab: EssentialTab;
  items: readonly HomeItem[];
}

/**
 * The tabs that have something to offer, each with its items as stocked: the ids in the tab's order, unknown ids and items out of
 * stock left out, and no more than a tab holds. A tab with nothing is left out, so a tab is never an empty grid; with no tab left
 * the section is not shown.
 */
export function liveEssentialTabs(
  items: readonly HomeItem[],
  tabs: readonly EssentialTab[] = ESSENTIAL_TABS,
): readonly LiveEssentialTab[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return tabs
    .map((tab) => ({
      tab,
      items: tab.itemIds
        .map((id) => byId.get(id))
        .filter((item): item is HomeItem => item !== undefined && item.stock?.kind !== 'out')
        .slice(0, ESSENTIALS_PER_TAB),
    }))
    .filter((entry) => entry.items.length > 0);
}

/** The tab to open on: the one for the time of day when it is live, otherwise the first live tab. */
export function openingTab(
  live: readonly LiveEssentialTab[],
  hour: number,
): LiveEssentialTab | undefined {
  const wanted = defaultEssentialTab(hour);
  return live.find((entry) => entry.tab.id === wanted) ?? live[0];
}

/**
 * How many are left, for the small "3 left" in a row's words: only when stock is short (the one fact that changes a decision),
 * otherwise undefined. The count is the default pack's stock limit.
 */
export function essentialLeft(item: Pick<HomeItem, 'stock' | 'maxQuantity'>): number | undefined {
  return item.stock?.kind === 'low' ? item.maxQuantity : undefined;
}

/**
 * What "Add" puts in the cart for each ticked item: one piece, or half a kilogram for a loose item (the smallest step the cart
 * takes). The price is per kilogram for a loose item, so its share is half.
 */
export function essentialStepCost(item: Pick<HomeItem, 'loose' | 'price'>): number {
  const paise = Number(item.price);
  return item.loose === true ? Math.round(paise / 2) : paise;
}

/** How many items are ticked, and what one step of each comes to, in paise: for the bar's "Add 3 items · ₹112". */
export function essentialBasket(
  items: readonly Pick<HomeItem, 'id' | 'loose' | 'price'>[],
  ticked: ReadonlySet<string>,
): { count: number; paise: number } {
  let count = 0;
  let paise = 0;
  for (const item of items) {
    if (!ticked.has(item.id)) continue;
    count += 1;
    paise += essentialStepCost(item);
  }
  return { count, paise };
}
