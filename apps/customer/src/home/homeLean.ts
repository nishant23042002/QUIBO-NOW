/** The sections of Home's "All" page that a build may leave out for a customer who has not ordered yet. */
export type LeanSection = 'need' | 'small' | 'featured';

/**
 * What a customer who has never ordered does not see on Home when the lean switch is on: "Shop for your need" (an idea to learn,
 * and it overlaps the categories and Daily essentials), "Small prices" and "Featured this week" (collections that repeat the
 * categories for someone who has not browsed yet). Shop by brand stays. One list, so a section can be added or taken off in one place.
 */
export const HIDDEN_FOR_NEW_CUSTOMER: readonly LeanSection[] = ['need', 'small', 'featured'];

/** Reads the build's switch. Only the word "true" turns it on; anything else, or nothing, leaves Home as it is. */
export function readLeanSwitch(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() === 'true';
}

/**
 * Whether a section shows. With the switch off it always does. With it on, the sections in `HIDDEN_FOR_NEW_CUSTOMER` are left out
 * until the customer has ordered once (any order counts, a cancelled one too). Until the saved orders have been read back nothing is
 * left out, so Home never hides something from a returning customer for a moment.
 */
export function sectionShown(
  section: LeanSection,
  state: { lean: boolean; ordersLoaded: boolean; orderCount: number },
): boolean {
  if (!state.lean || !state.ordersLoaded || state.orderCount > 0) return true;
  return !HIDDEN_FOR_NEW_CUSTOMER.includes(section);
}
