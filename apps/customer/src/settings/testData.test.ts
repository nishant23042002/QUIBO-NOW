import { describe, expect, it } from 'vitest';
import { TEST_DATA_KEYS } from './testData';

describe('TEST_DATA_KEYS', () => {
  it('names what testing leaves behind: orders, reports, the cart and its choices, viewed and notify', () => {
    expect([...TEST_DATA_KEYS].sort()).toEqual([
      'quibo.cart',
      'quibo.coupon',
      'quibo.instructions',
      'quibo.notify',
      'quibo.orders',
      'quibo.reports',
      'quibo.saved',
      'quibo.slot',
      'quibo.substitution',
      'quibo.viewed',
    ]);
  });

  it('has each key once', () => {
    expect(new Set(TEST_DATA_KEYS).size).toBe(TEST_DATA_KEYS.length);
  });

  it('leaves the account, the language, the theme and the addresses alone', () => {
    for (const kept of ['quibo.account', 'quibo.language', 'quibo.theme', 'quibo.addresses']) {
      expect(TEST_DATA_KEYS).not.toContain(kept);
    }
  });
});
