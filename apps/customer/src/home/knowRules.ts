/**
 * "Know your shop" (ADR 0054, ADR 0055 step 4): one idea, that a customer can check a shop and cannot check a dark store. It asks
 * five things a customer can check and answers each for the two kinds of place, then scores them 0 of 5 against 5 of 5.
 */

/** The five things, in the order they are asked. The words are messages (`home.know.q.<id>`). */
export const KNOW_QUESTIONS = ['where', 'who', 'kept', 'wrong', 'name'] as const;
export type KnowQuestionId = (typeof KNOW_QUESTIONS)[number];

/** How many of the rows show before "View more": the rest open under them. The score is always on screen. */
export const KNOW_ROWS_COLLAPSED = 2;

/**
 * The score under the cards: how many of the things a customer can check, for each kind of place. It is counted from the list of
 * questions, so adding or taking one away keeps the score honest.
 */
export const KNOW_SCORE = { darkStore: 0, shop: KNOW_QUESTIONS.length } as const;

/**
 * Whether Home shows "Know your shop" (and the Quibo promise). It is the first thing under the header, for every customer, so Home
 * reads the same on every phone. In a town served by one company dark store the argument is not true of what the customer is
 * buying, so it is not shown (ADR 0053).
 */
export function knowShown(store: 'partner' | 'dark'): boolean {
  return store === 'partner';
}
