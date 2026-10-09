import { describe, expect, it } from 'vitest';
import { deliveryFee, isRushHour, type TripConditions } from './deliveryFee';

const trip = (over: Partial<TripConditions> = {}): TripConditions => ({
  distanceKm: 2.4,
  hour: 12,
  festival: false,
  rain: false,
  ...over,
});

describe('isRushHour', () => {
  it('includes the first hour of a window and leaves out the last', () => {
    expect(isRushHour(7)).toBe(false);
    expect(isRushHour(8)).toBe(true);
    expect(isRushHour(9)).toBe(true);
    expect(isRushHour(10)).toBe(false);
    expect(isRushHour(16)).toBe(false);
    expect(isRushHour(17)).toBe(true);
    expect(isRushHour(20)).toBe(true);
    expect(isRushHour(21)).toBe(false);
  });
});

describe('deliveryFee', () => {
  it('takes the base from the distance band, a limit belonging to the band it ends', () => {
    expect(deliveryFee(trip({ distanceKm: 0.4 })).fee).toBe(1_200);
    expect(deliveryFee(trip({ distanceKm: 1 })).fee).toBe(1_200);
    expect(deliveryFee(trip({ distanceKm: 1.01 })).fee).toBe(1_600);
    expect(deliveryFee(trip({ distanceKm: 2.4 })).fee).toBe(2_000);
    expect(deliveryFee(trip({ distanceKm: 5 })).fee).toBe(2_400);
  });

  it('keeps the last band for a trip beyond it', () => {
    expect(deliveryFee(trip({ distanceKm: 8 })).fee).toBe(2_400);
  });

  it('adds each extra on its own and says what it added', () => {
    const quiet = deliveryFee(trip());
    expect(quiet).toEqual({
      distance: 2_000,
      rush: 0,
      festival: 0,
      rain: 0,
      fee: 2_000,
      capped: false,
    });
    expect(deliveryFee(trip({ hour: 18 })).rush).toBe(400);
    expect(deliveryFee(trip({ festival: true })).festival).toBe(400);
    expect(deliveryFee(trip({ rain: true })).rain).toBe(300);
    const busy = deliveryFee(trip({ hour: 18, festival: true }));
    expect(busy.fee).toBe(2_800);
    expect(busy.capped).toBe(false);
  });

  it('can be told it is rush hour whatever the clock says', () => {
    expect(deliveryFee(trip({ hour: 12, rush: true })).rush).toBe(400);
  });

  it('never goes above 30 rupees, and says when it was held down', () => {
    // 20 + 4 + 4 + 3 = 31 rupees of parts.
    const worst = deliveryFee(trip({ hour: 18, festival: true, rain: true }));
    expect(worst.fee).toBe(3_000);
    expect(worst.capped).toBe(true);
    // The parts are still the real ones, so the customer can be shown them.
    expect(worst.distance).toBe(2_000);
    expect(worst.rush + worst.festival + worst.rain).toBe(1_100);
  });

  it('stays at or under 30 rupees for every combination', () => {
    for (const distanceKm of [0.5, 1.5, 2.5, 4, 9]) {
      for (const hour of [3, 9, 12, 18]) {
        for (const festival of [false, true]) {
          for (const rain of [false, true]) {
            const { fee } = deliveryFee(trip({ distanceKm, hour, festival, rain }));
            expect(fee).toBeLessThanOrEqual(3_000);
            expect(fee).toBeGreaterThanOrEqual(1_200);
          }
        }
      }
    }
  });
});
