import { PRICE_TIERS } from './priceTiers';

/**
 * What the chips on Home's header stand for. They are not categories (the Categories tab and the category screens are for that):
 * each is a way a shopper is in a hurry or in a mood, and shows the items that suit it from every shelf. "All" is the usual page.
 */
export type IntentId = 'all' | 'quick' | 'offers' | 'under' | 'veg';

export const INTENT_IDS: readonly IntentId[] = ['all', 'quick', 'offers', 'under', 'veg'];

/** The price "Under" means, in paise: the middle of the price tiers (₹50). */
export const UNDER_LIMIT: number = PRICE_TIERS[1] ?? 5000;

/** The fields of an item an intent reads. */
export interface IntentItem {
  /** It can come in the next delivery window. */
  quick?: true | undefined;
  price: number;
  mrp?: number | undefined;
  diet: { kind: 'veg' | 'nonveg' };
}

export function isIntent(value: string): value is IntentId {
  return (INTENT_IDS as readonly string[]).includes(value);
}

/** Whether an item suits an intent. "All" suits everything. */
export function matchesIntent(item: IntentItem, intent: IntentId): boolean {
  switch (intent) {
    case 'all':
      return true;
    case 'quick':
      return item.quick === true;
    case 'offers':
      return item.mrp !== undefined && item.mrp > item.price;
    case 'under':
      return item.price <= UNDER_LIMIT;
    case 'veg':
      return item.diet.kind === 'veg';
  }
}
