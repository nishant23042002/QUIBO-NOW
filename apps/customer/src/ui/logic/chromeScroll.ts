/**
 * When the bottom bar should be out of the way. It hides once the shopper has really been scrolling down for a while and comes back
 * when they scroll up a little, the way the big grocery apps do, so the page gets the room while it is being read and the bar is one
 * short flick away. A small movement either way never changes it.
 */
export interface ScrollTrack {
  /**
   * While the bar shows: the highest point the page has been at since it last went up (where the shopper started scrolling down from).
   * While it is hidden: the lowest point it has reached since it last went down (where the way back up is measured from).
   */
  anchor: number;
  hidden: boolean;
}

export const INITIAL_TRACK: ScrollTrack = { anchor: 0, hidden: false };

/** Near the top the bar always shows. */
export const TOP_ZONE = 48;
/** How far the page has to be scrolled down, in one go, before the bar goes: a screen's worth of a few rows, not a nudge. */
export const HIDE_AFTER = 96;
/** How far back up it has to come before the bar returns: smaller than the way down, so the bar is easy to get back. */
export const SHOW_AFTER = 32;

/** The state after the page reports its scroll offset. Pure: the same offsets always give the same answers. */
export function trackScroll(state: ScrollTrack, offset: number): ScrollTrack {
  const y = Math.max(0, offset);
  if (y <= TOP_ZONE) return { anchor: y, hidden: false };
  if (state.hidden) {
    // Going further down moves the point the way back is measured from.
    if (y > state.anchor) return { anchor: y, hidden: true };
    if (state.anchor - y > SHOW_AFTER) return { anchor: y, hidden: false };
    return state;
  }
  // Going up moves the point the way down is measured from.
  if (y < state.anchor) return { anchor: y, hidden: false };
  if (y - state.anchor > HIDE_AFTER) return { anchor: y, hidden: true };
  return state;
}
