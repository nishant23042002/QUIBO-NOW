import { money, subtract, type Money } from '@quibo/contracts';

/** A coupon: a percentage or a fixed amount off the items, for orders of at least a given size. */
export interface Coupon {
  /** What the shopper types, in capitals, for example "WELCOME50". */
  code: string;
  /** "percent": `value` is a whole percentage. "flat": `value` is an amount in paise. */
  kind: 'percent' | 'flat';
  value: number;
  /** The most a percentage coupon takes off. */
  maxDiscount?: Money;
  /** The smallest item total the coupon works on. */
  minOrder: Money;
}

const ZERO = money(0);

/** Whether the items are enough for the coupon. */
export function isEligible(coupon: Coupon, itemTotal: Money): boolean {
  return itemTotal >= coupon.minOrder;
}

/** How much more the items need to come to before the coupon works. Nothing when it already does. */
export function shortBy(coupon: Coupon, itemTotal: Money): Money {
  return isEligible(coupon, itemTotal) ? ZERO : subtract(coupon.minOrder, itemTotal);
}

/**
 * What a coupon takes off the items, rounded down to a whole rupee (prices in the app are whole rupees, and the shop is
 * never short by a rounded-up amount). A percentage coupon stops
 * at its limit; no coupon ever takes off more than the items cost. It takes off nothing when the items are not enough.
 */
export function couponDiscount(coupon: Coupon, itemTotal: Money): Money {
  if (!isEligible(coupon, itemTotal)) return ZERO;
  const raw =
    coupon.kind === 'percent'
      ? Math.floor((itemTotal * coupon.value) / 10_000) * 100
      : coupon.value;
  const capped =
    coupon.maxDiscount !== undefined && coupon.kind === 'percent'
      ? Math.min(raw, coupon.maxDiscount)
      : raw;
  return money(Math.max(0, Math.min(capped, itemTotal)));
}

/** The coupon with that code, however it was typed (capitals or not, spaces round it). */
export function findCoupon<T extends Coupon>(coupons: readonly T[], typed: string): T | undefined {
  const wanted = typed.trim().toUpperCase();
  return wanted === '' ? undefined : coupons.find((coupon) => coupon.code === wanted);
}

/** The coupon that saves the most on these items, among those that work. The first one wins a tie. */
export function bestCoupon<T extends Coupon>(
  coupons: readonly T[],
  itemTotal: Money,
): { coupon: T; discount: Money } | undefined {
  let best: { coupon: T; discount: Money } | undefined;
  for (const coupon of coupons) {
    const discount = couponDiscount(coupon, itemTotal);
    if (discount > 0 && (best === undefined || discount > best.discount)) {
      best = { coupon, discount };
    }
  }
  return best;
}
