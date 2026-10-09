import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import {
  bestCoupon,
  couponDiscount,
  findCoupon,
  isEligible,
  shortBy,
  type Coupon,
} from './coupons';

const welcome: Coupon = {
  code: 'WELCOME50',
  kind: 'percent',
  value: 20,
  maxDiscount: money(5_000),
  minOrder: money(14_900),
};
const save30: Coupon = { code: 'SAVE30', kind: 'flat', value: 3_000, minOrder: money(29_900) };
const small15: Coupon = { code: 'SMALL15', kind: 'flat', value: 1_500, minOrder: money(9_900) };

describe('couponDiscount', () => {
  it('takes a percentage off, rounded down to a whole rupee', () => {
    expect(couponDiscount(welcome, money(20_000))).toBe(4_000);
    // 20% of 15,001 paise is 3,000.2 paise: 30 rupees, never rounded up.
    expect(couponDiscount(welcome, money(15_001))).toBe(3_000);
    // 20% of 18,200 paise is 3,640 paise: 36 rupees, not 36.40.
    expect(couponDiscount(welcome, money(18_200))).toBe(3_600);
  });

  it('stops a percentage coupon at its limit', () => {
    expect(couponDiscount(welcome, money(50_000))).toBe(5_000);
  });

  it('takes a flat amount off, never more than the items cost', () => {
    expect(couponDiscount(save30, money(29_900))).toBe(3_000);
    const huge: Coupon = { code: 'BIG', kind: 'flat', value: 99_999, minOrder: money(0) };
    expect(couponDiscount(huge, money(2_000))).toBe(2_000);
  });

  it('takes nothing off until the items reach the minimum, and works exactly at it', () => {
    expect(couponDiscount(welcome, money(14_899))).toBe(0);
    expect(couponDiscount(welcome, money(14_900))).toBe(2_900);
  });
});

describe('isEligible and shortBy', () => {
  it('says how much more the items need', () => {
    expect(isEligible(save30, money(20_000))).toBe(false);
    expect(shortBy(save30, money(20_000))).toBe(9_900);
    expect(shortBy(save30, money(29_900))).toBe(0);
    expect(shortBy(save30, money(40_000))).toBe(0);
  });
});

describe('findCoupon', () => {
  it('finds a code however it was typed', () => {
    const all = [welcome, save30, small15];
    expect(findCoupon(all, 'welcome50')).toBe(welcome);
    expect(findCoupon(all, '  Save30 ')).toBe(save30);
  });

  it('finds nothing for an unknown or empty code', () => {
    expect(findCoupon([welcome], 'NOPE')).toBeUndefined();
    expect(findCoupon([welcome], '   ')).toBeUndefined();
  });
});

describe('bestCoupon', () => {
  const all = [welcome, save30, small15];

  it('picks the one that saves the most', () => {
    // 20% of 30,000 is 5,000 (at its limit): more than the flat 3,000 and 1,500.
    expect(bestCoupon(all, money(30_000))?.coupon.code).toBe('WELCOME50');
    expect(bestCoupon(all, money(30_000))?.discount).toBe(5_000);
    // At 10,000 only SMALL15 works.
    expect(bestCoupon(all, money(10_000))?.coupon.code).toBe('SMALL15');
  });

  it('is nothing when no coupon works yet', () => {
    expect(bestCoupon(all, money(5_000))).toBeUndefined();
  });

  it('lets the first win a tie', () => {
    const twin: Coupon = { ...small15, code: 'TWIN' };
    expect(bestCoupon([small15, twin], money(10_000))?.coupon.code).toBe('SMALL15');
  });
});
