import { money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import type { Coupon } from './coupons';

/** A coupon with the words that describe it, in the message files. */
export interface Offer extends Coupon {
  descKey: MessageKey;
}

/**
 * Sample coupons, only to build and test the screens (Phase 1d, phase C). Real offers and coupons come from the town's
 * settings later (Phase 2), and the app says these are samples. Amounts are integer paise.
 */
export const SAMPLE_COUPONS: readonly Offer[] = [
  {
    code: 'WELCOME50',
    kind: 'percent',
    value: 20,
    maxDiscount: money(5_000),
    minOrder: money(14_900),
    descKey: 'coupons.descWelcome',
  },
  {
    code: 'SAVE30',
    kind: 'flat',
    value: 3_000,
    minOrder: money(29_900),
    descKey: 'coupons.descSave',
  },
  {
    code: 'SMALL15',
    kind: 'flat',
    value: 1_500,
    minOrder: money(9_900),
    descKey: 'coupons.descSmall',
  },
];
