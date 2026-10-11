import { describe, expect, it } from 'vitest';
import { INITIAL_TRACK, TOP_ZONE, TURN, trackScroll, type ScrollTrack } from './chromeScroll';

const run = (offsets: number[], from: ScrollTrack = INITIAL_TRACK): ScrollTrack =>
  offsets.reduce(trackScroll, from);

describe('trackScroll', () => {
  it('shows the bar at the top and near it', () => {
    expect(run([0]).hidden).toBe(false);
    expect(run([TOP_ZONE]).hidden).toBe(false);
    expect(run([TOP_ZONE - 5, 10, 0]).hidden).toBe(false);
  });

  it('hides it once the page has gone down past the top zone', () => {
    expect(run([40, 90, 140, 200]).hidden).toBe(true);
  });

  it('does not hide it for a small movement', () => {
    expect(run([104, 108], { anchor: 100, hidden: false }).hidden).toBe(false);
  });

  it('brings it back when the page moves up by more than a flick', () => {
    const down = run([100, 200, 400]);
    expect(down.hidden).toBe(true);
    expect(trackScroll(down, 400 - TURN - 1).hidden).toBe(false);
  });

  it('keeps it hidden for a small turn back', () => {
    const down = run([100, 200, 400]);
    expect(trackScroll(down, 400 - TURN + 2).hidden).toBe(true);
  });

  it('measures the turn from the furthest point, not from where it first hid', () => {
    const down = run([100, 200, 600]);
    expect(trackScroll(down, 600 - TURN + 1).hidden).toBe(true);
    expect(trackScroll(down, 600 - TURN - 5).hidden).toBe(false);
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
