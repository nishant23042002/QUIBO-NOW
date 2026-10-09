import { money, type Money } from '@quibo/contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import { bestCoupon, couponDiscount, findCoupon, isEligible, shortBy } from './coupons';
import { SAMPLE_COUPONS, type Offer } from './sampleCoupons';

/** Where the phone keeps the applied coupon, so it is still there after the app is closed. */
const COUPON_KEY = 'quibo.coupon';

/** A coupon as the screens show it, worked out against what is in the cart now. */
export interface OfferView {
  offer: Offer;
  /** What it would take off these items right now: nothing while the items are short of its minimum. */
  discount: Money;
  /** How much more the items need before it works. Nothing when it already does. */
  shortBy: Money;
  eligible: boolean;
  applied: boolean;
}

export type ApplyResult = 'ok' | 'invalid' | 'short';

export interface CouponState {
  /** Every coupon on offer, as worked out for the cart. */
  offers: readonly OfferView[];
  /** The coupon that is applied, whether or not the items are enough for it right now. */
  applied: OfferView | undefined;
  /** The best coupon that works on these items and is not applied yet, to suggest. */
  best: { offer: Offer; discount: Money } | undefined;
  /** What the applied coupon takes off the items now. Nothing when none is applied or the items are short of it. */
  discount: Money;
  /**
   * Applies a coupon by its code, however it was typed. It is "invalid" for a code that does not exist, and "short" when
   * the items are not enough for it yet (it is then not applied).
   */
  apply: (typed: string) => ApplyResult;
  remove: () => void;
}

/**
 * The coupon for the order: which one is applied (kept on the phone), what it takes off, and what else is on offer. A
 * coupon stays applied if the cart shrinks below its minimum; it simply takes off nothing until the items are enough again.
 */
export function useCoupon(itemTotal: Money): CouponState {
  const [code, setCode] = useState<string | null>(null);
  // A coupon applied before the saved one has been read back must not be written over by it.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(COUPON_KEY).then((saved) => {
      if (!live || touched.current) return;
      const found = saved === null ? undefined : findCoupon(SAMPLE_COUPONS, saved);
      setCode(found?.code ?? null);
    });
    return () => {
      live = false;
    };
  }, []);

  const remember = useCallback((next: string | null) => {
    touched.current = true;
    setCode(next);
    void writeSetting(COUPON_KEY, next ?? '');
  }, []);

  const apply = useCallback(
    (typed: string): ApplyResult => {
      const found = findCoupon(SAMPLE_COUPONS, typed);
      if (found === undefined) return 'invalid';
      if (!isEligible(found, itemTotal)) return 'short';
      remember(found.code);
      return 'ok';
    },
    [itemTotal, remember],
  );

  const remove = useCallback(() => {
    remember(null);
  }, [remember]);

  const offers: OfferView[] = SAMPLE_COUPONS.map((offer) => ({
    offer,
    discount: couponDiscount(offer, itemTotal),
    shortBy: shortBy(offer, itemTotal),
    eligible: isEligible(offer, itemTotal),
    applied: offer.code === code,
  }));
  const applied = offers.find((view) => view.applied);
  const best = bestCoupon(
    SAMPLE_COUPONS.filter((offer) => offer.code !== code),
    itemTotal,
  );

  return {
    offers,
    applied,
    best: best === undefined ? undefined : { offer: best.coupon, discount: best.discount },
    discount: applied?.discount ?? money(0),
    apply,
    remove,
  };
}
