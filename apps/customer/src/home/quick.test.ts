import { describe, expect, it } from 'vitest';
import { quickEta } from './quick';

const trip = (over: Partial<Parameters<typeof quickEta>[0]> = {}) => ({
  distanceKm: 2.4,
  hour: 12,
  festival: false,
  rain: false,
  items: 4,
  ...over,
});

describe('quickEta', () => {
  it('is packing plus the ride, rounded down to a range five minutes wide', () => {
    // 6 + 2.4 x 3 = 13.2 minutes.
    expect(quickEta(trip())).toEqual({ from: 10, to: 15 });
    // 6 + 0.5 x 3 = 7.5 minutes; never a range that starts below one step.
    expect(quickEta(trip({ distanceKm: 0.5 }))).toEqual({ from: 5, to: 10 });
  });

  it('takes longer for a longer trip', () => {
    expect(quickEta(trip({ distanceKm: 4.5 })).from).toBeGreaterThan(quickEta(trip()).from);
  });

  it('adds time in a rush hour, on a festival day and in rain', () => {
    expect(quickEta(trip({ hour: 18 }))).toEqual({ from: 15, to: 20 });
    expect(quickEta(trip({ rain: true }))).toEqual({ from: 15, to: 20 });
    expect(quickEta(trip({ hour: 18, rain: true, festival: true }))).toEqual({ from: 25, to: 30 });
    expect(quickEta(trip({ rush: true })).from).toBe(15);
  });

  it('adds a little for a big order, but only up to a limit', () => {
    expect(quickEta(trip({ items: 20 })).from).toBeGreaterThanOrEqual(quickEta(trip()).from);
    expect(quickEta(trip({ items: 200 })).from).toBe(quickEta(trip({ items: 40 })).from);
  });

  it('never goes above the top, however bad the day', () => {
    const worst = quickEta(
      trip({ distanceKm: 30, hour: 18, rain: true, festival: true, items: 50 }),
    );
    expect(worst.from).toBeLessThanOrEqual(40);
    expect(worst.to - worst.from).toBe(5);
  });
});
