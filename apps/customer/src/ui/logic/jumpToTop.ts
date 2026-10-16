/** The page must be scrolled this far down before the "Back to top" pill shows, and back above the lower mark before it goes. */
export const JUMP_SHOW_AT = 700;
export const JUMP_HIDE_AT = 350;

/** Whether the pill shows at this scroll position: it keeps its state in between, so it does not flicker around one mark. */
export function jumpVisible(offset: number, was: boolean): boolean {
  if (offset >= JUMP_SHOW_AT) return true;
  if (offset <= JUMP_HIDE_AT) return false;
  return was;
}

/** The page counts as "scrolled" (a header may show its picture) past the upper mark, and as at its top again below the lower one. */
export const SCROLLED_AT = 24;
export const AT_TOP_BELOW = 8;

/** Whether the page has been scrolled enough to bring the header's picture in, keeping its state between the marks. */
export function scrolledPast(offset: number, was: boolean): boolean {
  if (offset >= SCROLLED_AT) return true;
  if (offset <= AT_TOP_BELOW) return false;
  return was;
}
