import { money, type Money } from '@quibo/contracts';

/**
 * How carefully something has to be handled on its way to the door. The most delicate item in the cart sets the
 * handling fee for the whole order, because one rider carries it all in one trip.
 */
export type CareClass = 'standard' | 'fresh' | 'chilled' | 'heavy' | 'fragile';

/** A town's delivery rules. Fees and limits live in data, not in screens (the town's own rules arrive in Phase 2). */
export interface ZoneSettings {
  /** The item total from which delivery is free. */
  freeDeliveryFrom: Money;
  /** What delivery costs below that. */
  deliveryFee: Money;
  /** The smallest item total an order may have. */
  minimumOrder: Money;
  /** The handling fee for each class of care, before any festival surcharge. */
  handling: Readonly<Record<CareClass, Money>>;
  /** What is added to the handling fee on a festival rush. */
  festivalSurcharge: Money;
  /** The handling fee never goes above this, whatever the surcharge. */
  handlingMax: Money;
}

/** Sample rules for the pilot town. Prices are integer paise. */
export const ZONE: ZoneSettings = {
  freeDeliveryFrom: money(19_900),
  deliveryFee: money(2_500),
  minimumOrder: money(9_900),
  handling: {
    standard: money(600),
    fresh: money(800),
    chilled: money(1_000),
    heavy: money(1_200),
    fragile: money(1_800),
  },
  festivalSurcharge: money(400),
  handlingMax: money(1_800),
};

/**
 * The order total from which delivery is free: 199 rupees. A sample until each town's own fee rules arrive
 * (Phase 2); the offers and the cart both read it from here, so they always agree.
 */
export const FREE_DELIVERY_FROM = ZONE.freeDeliveryFrom;
