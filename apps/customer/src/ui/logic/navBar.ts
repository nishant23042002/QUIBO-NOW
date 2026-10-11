/**
 * The look of the bottom bar. This is the one place to switch it back: set `NAV_STYLE` to 'classic' and the bar has no gliding
 * line, no filled icon and no pop, as before. (A tap still lights its tab at once, and the main tabs are still built early.)
 *
 * - lively: a thin line glides along the top edge to the chosen tab, whose icon turns solid and gives a short pop.
 * - classic: the soft pistachio pill and outline icons only.
 */
export type NavStyle = 'lively' | 'classic';

export const NAV_STYLE: NavStyle = 'lively';

/** A tab the shopper has just pressed, and the tab the router still said was chosen when they pressed it. */
export interface PendingTab {
  key: string;
  from: string;
}

/**
 * The tab to light. A press lights its tab at once, without waiting for the screen change to reach the bar; the moment the router
 * says anything else is chosen, the router's word is the truth again, so a press that went nowhere cannot leave a wrong tab lit
 * (see also the timeout in the bar).
 */
export function shownTab(active: string, pending: PendingTab | null): string {
  return pending !== null && pending.from === active ? pending.key : active;
}

/** Where the left edge of the gliding line sits, from the bar's left edge, so it is centred over tab number `index`. */
export function indicatorLeft(index: number, tabWidth: number, lineWidth: number): number {
  return index * tabWidth + (tabWidth - lineWidth) / 2;
}
