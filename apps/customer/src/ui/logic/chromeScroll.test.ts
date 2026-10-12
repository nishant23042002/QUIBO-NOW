import { describe, expect, it } from 'vitest';
import {
  HIDE_AFTER,
  INITIAL_TRACK,
  SHOW_AFTER,
  TOP_ZONE,
  trackScroll,
  type ScrollTrack,
} from './chromeScroll';

const run = (offsets: number[], from: ScrollTrack = INITIAL_TRACK): ScrollTrack =>
  offsets.reduce(trackScroll, from);

describe('trackScroll', () => {
  it('shows the bar at the top and near it', () => {
    expect(run([0]).hidden).toBe(false);
    expect(run([TOP_ZONE]).hidden).toBe(false);
    expect(run([TOP_ZONE - 5, 10, 0]).hidden).toBe(false);
  });

  it('keeps it for a short scroll and hides it only after a good stretch down', () => {
    expect(run([30, 60, 100, 120]).hidden).toBe(false);
    expect(run([30, 60, 100, 120, 30 + HIDE_AFTER + 20]).hidden).toBe(true);
  });

  it('hides it at the first report when the page jumps a long way at once', () => {
    expect(run([400]).hidden).toBe(true);
  });

  it('does not hide it for a small movement', () => {
    expect(run([104, 108], { anchor: 100, hidden: false }).hidden).toBe(false);
  });

  it('counts the stretch down from where the shopper last turned, not from the top', () => {
    // Up a little in the middle of the page, then down again: the count starts over from the turn.
    const mid = run([250, 250 + HIDE_AFTER - 10], { anchor: 300, hidden: false });
    expect(mid.hidden).toBe(false);
    expect(trackScroll(mid, 250 + HIDE_AFTER + 5).hidden).toBe(true);
  });

  it('brings it back when the page moves up by more than a flick', () => {
    const down = run([100, 200, 400]);
    expect(down.hidden).toBe(true);
    expect(trackScroll(down, 400 - SHOW_AFTER - 1).hidden).toBe(false);
  });

  it('keeps it hidden for a small turn back', () => {
    const down = run([100, 200, 400]);
    expect(trackScroll(down, 400 - SHOW_AFTER + 2).hidden).toBe(true);
  });

  it('measures the way back from the furthest point, not from where it first hid', () => {
    const down = run([100, 200, 600]);
    expect(trackScroll(down, 600 - SHOW_AFTER + 1).hidden).toBe(true);
    expect(trackScroll(down, 600 - SHOW_AFTER - 5).hidden).toBe(false);
  });

  it('shows it at once when the page returns to the top, whatever the speed', () => {
    expect(run([500, 800, 20]).hidden).toBe(false);
  });

  it('ignores a bounce above the top', () => {
    expect(run([300, -40]).hidden).toBe(false);
    expect(run([-30]).anchor).toBe(0);
  });

  it('is the same however it is split: the same offsets, the same result', () => {
    const offsets = [30, 120, 260, 250, 240, 200, 330];
    expect(run(offsets)).toEqual(offsets.reduce(trackScroll, INITIAL_TRACK));
  });
});
