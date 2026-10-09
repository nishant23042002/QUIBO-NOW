import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { computeBill, type BillInput } from './bill';

const input = (
  over: Partial<BillInput> = {},
  trip: Partial<BillInput['trip']> = {},
): BillInput => ({
  itemTotal: money(12_000),
  saved: money(500),
  cares: ['chilled'],
  trip: { distanceKm: 2.4, hour: 12, festival: false, rain: false, ...trip },
  ...over,
});

describe('computeBill', () => {
  it('charges the trip and the handling fee below the free-delivery line', () => {
    const bill = computeBill(input());
    expect(bill.delivery.fee).toBe(2_000);
    expect(bill.delivery.free).toBe(false);
    expect(bill.handling).toEqual({ fee: 1_000, reason: 'chilled', festival: false });
    expect(bill.toPay).toBe(12_000 + 2_000 + 1_000);
    expect(bill.printedTotal).toBe(12_500);
    expect(bill.totalSaved).toBe(500);
  });

  it('has no minimum order: a very small order is billed like any other', () => {
    const bill = computeBill(input({ itemTotal: money(2_200), saved: money(0) }));
    expect(bill.toPay).toBe(2_200 + 2_000 + 1_000);
  });

  it('makes delivery free from exactly the line, and counts the fee as a saving', () => {
    const bill = computeBill(input({ itemTotal: money(19_900) }));
    expect(bill.delivery.fee).toBe(0);
    expect(bill.delivery.free).toBe(true);
    expect(bill.delivery.waived).toBe(2_000);
    expect(bill.toPay).toBe(19_900 + 1_000);
    expect(bill.totalSaved).toBe(500 + 2_000);
    expect(computeBill(input({ itemTotal: money(19_899) })).delivery.free).toBe(false);
  });

  it('follows the trip: a longer one in a rush on a festival day costs more, up to the cap', () => {
    expect(computeBill(input({}, { distanceKm: 0.5 })).delivery.fee).toBe(1_200);
    expect(computeBill(input({}, { hour: 18 })).delivery.fee).toBe(2_400);
    const worst = computeBill(input({}, { hour: 18, festival: true, rain: true }));
    expect(worst.delivery.fee).toBe(3_000);
    expect(worst.delivery.parts.capped).toBe(true);
  });

  it('lets the most delicate item set the handling fee, not the sum', () => {
    const bill = computeBill(input({ cares: ['standard', 'fragile', 'heavy', 'fragile'] }));
    expect(bill.handling.fee).toBe(1_600);
    expect(bill.handling.reason).toBe('fragile');
  });

  it('adds the festival surcharge but keeps handling under 18 rupees', () => {
    const light = computeBill(input({ cares: ['standard'] }, { festival: true }));
    expect(light.handling).toEqual({ fee: 900, reason: 'standard', festival: true });
    const fragile = computeBill(input({ cares: ['fragile'] }, { festival: true }));
    expect(fragile.handling.fee).toBe(1_700);
  });

  it('keeps every handling fee between 6 and 17 rupees', () => {
    for (const care of ['standard', 'fresh', 'chilled', 'heavy', 'fragile'] as const) {
      for (const festival of [false, true]) {
        const fee = computeBill(input({ cares: [care] }, { festival })).handling.fee;
        expect(fee).toBeGreaterThanOrEqual(600);
        expect(fee).toBeLessThan(1_800);
      }
    }
  });

  it('takes a coupon off the items, counts it as a saving, and never touches free delivery', () => {
    const bill = computeBill(input({ coupon: { code: 'SAVE30', discount: money(3_000) } }));
    expect(bill.coupon).toEqual({ code: 'SAVE30', discount: 3_000 });
    expect(bill.toPay).toBe(12_000 - 3_000 + 2_000 + 1_000);
    expect(bill.totalSaved).toBe(500 + 3_000);
    // The price with no offers at all is what the bill would be with the coupon and the printed-price discounts undone.
    expect(bill.toPay + bill.totalSaved).toBe(12_000 + 500 + 2_000 + 1_000);
    // Items of 199 rupees are free delivery; a coupon that brings them below that does not take it away.
    const free = computeBill(
      input({ itemTotal: money(19_900), coupon: { code: 'SAVE30', discount: money(3_000) } }),
    );
    expect(free.delivery.free).toBe(true);
    expect(free.toPay).toBe(19_900 - 3_000 + 1_000);
  });

  it('leaves the coupon out when it takes off nothing', () => {
    const bill = computeBill(input({ coupon: { code: 'SAVE30', discount: money(0) } }));
    expect(bill.coupon).toBeUndefined();
    expect(bill.toPay).toBe(12_000 + 2_000 + 1_000);
  });

  it('is all zero for an empty cart', () => {
    const bill = computeBill(
      input({ itemTotal: money(0), saved: money(0), cares: [] }, { festival: true }),
    );
    expect(bill.toPay).toBe(0);
    expect(bill.delivery.free).toBe(false);
    expect(bill.handling.festival).toBe(false);
  });
});
