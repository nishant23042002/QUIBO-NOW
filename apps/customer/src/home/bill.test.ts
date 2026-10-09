import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { computeBill } from './bill';

const input = (over: Partial<Parameters<typeof computeBill>[0]> = {}) => ({
  itemTotal: money(12_000),
  saved: money(500),
  cares: ['chilled' as const],
  festival: false,
  ...over,
});

describe('computeBill', () => {
  it('charges delivery and the handling fee below the free-delivery line', () => {
    const bill = computeBill(input());
    expect(bill.delivery).toEqual({ fee: 2_500, free: false, waived: 0 });
    expect(bill.handling).toEqual({ fee: 1_000, reason: 'chilled', festival: false });
    expect(bill.toPay).toBe(15_500);
    expect(bill.printedTotal).toBe(12_500);
    expect(bill.totalSaved).toBe(500);
  });

  it('makes delivery free from exactly the line, and counts the fee as a saving', () => {
    const bill = computeBill(input({ itemTotal: money(19_900) }));
    expect(bill.delivery).toEqual({ fee: 0, free: true, waived: 2_500 });
    expect(bill.toPay).toBe(19_900 + 1_000);
    expect(bill.totalSaved).toBe(500 + 2_500);
    expect(computeBill(input({ itemTotal: money(19_899) })).delivery.free).toBe(false);
  });

  it('lets the most delicate item set the handling fee, not the sum', () => {
    const bill = computeBill(input({ cares: ['standard', 'fragile', 'heavy', 'fragile'] }));
    expect(bill.handling.fee).toBe(1_800);
    expect(bill.handling.reason).toBe('fragile');
  });

  it('adds the festival surcharge but never goes above the top fee', () => {
    const light = computeBill(input({ cares: ['standard'], festival: true }));
    expect(light.handling).toEqual({ fee: 1_000, reason: 'standard', festival: true });
    const fragile = computeBill(input({ cares: ['fragile'], festival: true }));
    expect(fragile.handling.fee).toBe(1_800);
  });

  it('keeps every handling fee between 6 and 18 rupees', () => {
    for (const care of ['standard', 'fresh', 'chilled', 'heavy', 'fragile'] as const) {
      for (const festival of [false, true]) {
        const fee = computeBill(input({ cares: [care], festival })).handling.fee;
        expect(fee).toBeGreaterThanOrEqual(600);
        expect(fee).toBeLessThanOrEqual(1_800);
      }
    }
  });

  it('says how far an order is from the minimum, and that it is met at exactly the minimum', () => {
    const short = computeBill(input({ itemTotal: money(6_000) }));
    expect(short.minimum).toEqual({ met: false, shortBy: 3_900 });
    expect(computeBill(input({ itemTotal: money(9_900) })).minimum).toEqual({
      met: true,
      shortBy: 0,
    });
  });

  it('is all zero for an empty cart', () => {
    const bill = computeBill({ itemTotal: money(0), saved: money(0), cares: [], festival: true });
    expect(bill.toPay).toBe(0);
    expect(bill.delivery.free).toBe(false);
    expect(bill.handling.festival).toBe(false);
    expect(bill.minimum.met).toBe(true);
  });
});
