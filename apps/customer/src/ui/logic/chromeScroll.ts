/**
 * When the bottom bar should be out of the way. It hides while the shopper scrolls down and comes back when they scroll up, the way
 * the big grocery apps do, so the page gets the room while it is being read and the bar is one short flick away.
 */
export interface ScrollTrack {
  /** The furthest the page has gone in the direction it is moving: the point a turn is measured from. */
  anchor: number;
  hidden: boolean;
}

export const INITIAL_TRACK: ScrollTrack = { anchor: 0, hidden: false };

/** Near the top the bar always shows. */
export const TOP_ZONE = 80;
/** How far the page has to move against the way it was going before the bar changes: small jitters do not count. */
export const TURN = 10;

/** The state after the page reports its scroll offset. Pure: the same offsets always give the same answers. */
export function trackScroll(state: ScrollTrack, offset: number): ScrollTrack {
  const y = Math.max(0, offset);
  if (y <= TOP_ZONE) return { anchor: y, hidden: false };
  if (state.hidden) {
    if (y < state.anchor - TURN) return { anchor: y, hidden: false };
    return y > state.anchor ? { anchor: y, hidden: true } : state;
  }
  if (y > state.anchor + TURN) return { anchor: y, hidden: true };
  return y < state.anchor ? { anchor: y, hidden: false } : state;
}
