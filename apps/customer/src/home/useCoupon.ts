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
  /** False until the saved coupon has been read back, so the cart does not first show no coupon and then jump. */
  loaded: boolean;
  /** Every coupon on offer, as worked out for the cart. */
  offers: readonly OfferView[];
  /** The coupon that is applied. It always works on the cart: one that stops working is taken off at once. */
  applied: OfferView | undefined;
  /** The best coupon that works on these items and is not applied yet, to suggest. */
  best: { offer: Offer; discount: Money } | undefined;
  /** A coupon that would save more than the applied one, and how much more, to offer a switch. */
  better: { offer: Offer; extra: Money } | undefined;
  /** The coupon that was just taken off because the items no longer reach its minimum, and what they would need. */
  dropped: { offer: Offer; shortBy: Money } | undefined;
  /** What the applied coupon takes off the items now. Nothing when none is applied. */
  discount: Money;
  /**
   * Applies a coupon by its code, however it was typed. It is "invalid" for a code that does not exist, and "short" when
   * the items are not enough for it yet (it is then not applied).
   */
  apply: (typed: string) => ApplyResult;
  remove: () => void;
  /** Stops showing the note about a coupon that was taken off. */
  dismissDropped: () => void;
}

/**
 * The coupon for the order: which one is applied (kept on the phone), what it takes off, and what else is on offer. A
 * coupon that the cart no longer qualifies for, because items were taken out, is taken off straight away, and the cart is
 * told so it can say why. An empty cart has no coupon. Nothing is judged until the saved cart has been read back
 * (`cartReady`), so a cart that is only still loading never costs the shopper their coupon.
 */
export function useCoupon(itemTotal: Money, cartReady: boolean): CouponState {
  const [code, setCode] = useState<string | null>(null);
  // The coupon that was last taken off because the cart shrank, for the note about it.
  const [droppedCode, setDroppedCode] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  // A coupon applied before the saved one has been read back must not be written over by it.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(COUPON_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) {
        const found = saved === null ? undefined : findCoupon(SAMPLE_COUPONS, saved);
        setCode(found?.code ?? null);
      }
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  // Keep the phone's copy up to date, but never write over the saved coupon before it has been read.
  useEffect(() => {
    if (!loaded) return;
    void writeSetting(COUPON_KEY, code ?? '');
  }, [loaded, code]);

  // The coupon no longer fits the cart: take it off now, in the same pass, so it is never drawn as if it still counted. (An
  // empty cart just loses its coupon quietly; a cart that shrank gets a note saying which coupon went and why.)
  const settled = loaded && cartReady;
  const current = code === null ? undefined : findCoupon(SAMPLE_COUPONS, code);
  if (settled && code !== null && (current === undefined || !isEligible(current, itemTotal))) {
    setCode(null);
    setDroppedCode(current !== undefined && itemTotal > 0 ? current.code : null);
  }
  // A cart emptied of everything forgets the note too.
  if (settled && droppedCode !== null && itemTotal === 0) setDroppedCode(null);

  const apply = useCallback(
    (typed: string): ApplyResult => {
      const found = findCoupon(SAMPLE_COUPONS, typed);
      if (found === undefined) return 'invalid';
      if (!isEligible(found, itemTotal)) return 'short';
      touched.current = true;
      setDroppedCode(null);
      setCode(found.code);
      return 'ok';
    },
    [itemTotal],
  );

  const remove = useCallback(() => {
    touched.current = true;
    setDroppedCode(null);
    setCode(null);
  }, []);

  const dismissDropped = useCallback(() => {
    setDroppedCode(null);
  }, []);

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
  // The note is for a coupon that is still short of its minimum; once the items reach it again the suggestion takes over.
  const droppedOffer =
    droppedCode === null ? undefined : SAMPLE_COUPONS.find((offer) => offer.code === droppedCode);
  const dropped =
    droppedOffer !== undefined && applied === undefined && !isEligible(droppedOffer, itemTotal)
      ? { offer: droppedOffer, shortBy: shortBy(droppedOffer, itemTotal) }
      : undefined;

  // With one applied, a different coupon that would save more is worth a mention.
  const other =
    applied === undefined
      ? undefined
      : bestCoupon(
          SAMPLE_COUPONS.filter((offer) => offer.code !== applied.offer.code),
          itemTotal,
        );
  const better =
    applied !== undefined && other !== undefined && other.discount > applied.discount
      ? { offer: other.coupon, extra: money(other.discount - applied.discount) }
      : undefined;

  return {
    loaded,
    offers,
    applied,
    better,
    best: best === undefined ? undefined : { offer: best.coupon, discount: best.discount },
    dropped,
    discount: applied?.discount ?? money(0),
    apply,
    remove,
    dismissDropped,
  };
}
