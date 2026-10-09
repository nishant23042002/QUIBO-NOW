import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { ZONE } from '../home/delivery';
import { defaultPayment, effectivePayment, paymentOptions, shopLines } from './checkout';

const CAP = ZONE.payment.codMaxNewCustomer;

describe('paymentOptions', () => {
  it('allows cash and UPI for a small order', () => {
    expect(paymentOptions(money(24_900))).toEqual([
      { method: 'cod', allowed: true },
      { method: 'upi', allowed: true },
    ]);
  });

  it('allows cash right up to the limit, and not a paisa over it', () => {
    expect(paymentOptions(CAP)[0]?.allowed).toBe(true);
    expect(paymentOptions(money(CAP + 1))[0]?.allowed).toBe(false);
  });

  it('always allows UPI, however large the order', () => {
    expect(paymentOptions(money(CAP * 50))[1]).toEqual({ method: 'upi', allowed: true });
  });

  it('reads the limit from the zone settings, not from the code', () => {
    const small = { ...ZONE, payment: { codMaxNewCustomer: money(5_000) } };
    expect(paymentOptions(money(5_000), small)[0]?.allowed).toBe(true);
    expect(paymentOptions(money(5_001), small)[0]?.allowed).toBe(false);
  });

  it('is one thousand rupees to start with', () => {
    expect(CAP).toBe(100_000);
  });
});

describe('defaultPayment', () => {
  it('is cash when cash is allowed, otherwise UPI', () => {
    expect(defaultPayment(money(24_900))).toBe('cod');
    expect(defaultPayment(money(CAP + 100))).toBe('upi');
  });
});

describe('effectivePayment', () => {
  it("keeps the shopper's choice while it is allowed", () => {
    expect(effectivePayment('upi', money(24_900))).toBe('upi');
    expect(effectivePayment('cod', money(24_900))).toBe('cod');
  });

  it('falls back to the default when nothing is chosen yet', () => {
    expect(effectivePayment(null, money(24_900))).toBe('cod');
  });

  it('moves a cash choice to UPI once the bill is over the limit', () => {
    expect(effectivePayment('cod', money(CAP + 100))).toBe('upi');
  });
});

describe('shopLines', () => {
  it('counts the items from each shop, in the order they first appear', () => {
    const lines = shopLines(
      [{ soldBy: 'Sharma Dairy' }, { soldBy: 'Gupta Vegetables' }, { soldBy: 'Sharma Dairy' }],
      'Quibo Store',
    );
    expect(lines).toEqual([
      { name: 'Sharma Dairy', items: 2 },
      { name: 'Gupta Vegetables', items: 1 },
    ]);
  });

  it('uses the fallback name where the items do not say who sells them', () => {
    expect(shopLines([{}, {}, {}], 'Quibo Store')).toEqual([{ name: 'Quibo Store', items: 3 }]);
  });

  it('is empty for an empty cart', () => {
    expect(shopLines([], 'Quibo Store')).toEqual([]);
  });
});
