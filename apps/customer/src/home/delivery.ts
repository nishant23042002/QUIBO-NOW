import { money, type Money } from '@quibo/contracts';

/**
 * How carefully something has to be handled on its way to the door. The most delicate item in the cart sets the
 * handling fee for the whole order, because one rider carries it all in one trip.
 */
export type CareClass = 'standard' | 'fresh' | 'chilled' | 'heavy' | 'fragile';

/** How the delivery fee is worked out: a base from the distance, and extras for busy or difficult times. */
export interface DeliveryRules {
  /** The base fee by distance. A trip is in the first band whose limit it does not pass; beyond the last, the last fee. */
  bands: readonly { upToKm: number; fee: Money }[];
  /** Rush hours, as whole hours of the day on a 24-hour clock: `from` is included, `to` is not. */
  rushHours: readonly { from: number; to: number }[];
  rushExtra: Money;
  festivalExtra: Money;
  rainExtra: Money;
  /** Whatever the extras add up to, delivery never costs more than this. */
  max: Money;
}

/** A town's delivery rules. Fees and limits live in data, not in screens (the town's own rules arrive in Phase 2). */
export interface ZoneSettings {
  /** The item total from which delivery is free. */
  freeDeliveryFrom: Money;
  delivery: DeliveryRules;
  /** The handling fee for each class of care, before any festival surcharge. */
  handling: Readonly<Record<CareClass, Money>>;
  /** What is added to the handling fee on a festival day. */
  festivalSurcharge: Money;
  /** The handling fee never goes above this, whatever the surcharge. */
  handlingMax: Money;
}

/** Sample rules for the pilot town. Prices are integer paise. */
export const ZONE: ZoneSettings = {
  freeDeliveryFrom: money(19_900),
  delivery: {
    bands: [
      { upToKm: 1, fee: money(1_200) },
      { upToKm: 2, fee: money(1_600) },
      { upToKm: 3, fee: money(2_000) },
      { upToKm: 5, fee: money(2_400) },
    ],
    rushHours: [
      { from: 8, to: 10 },
      { from: 17, to: 21 },
    ],
    rushExtra: money(400),
    festivalExtra: money(400),
    rainExtra: money(300),
    max: money(3_000),
  },
  handling: {
    standard: money(600),
    fresh: money(800),
    chilled: money(1_000),
    heavy: money(1_200),
    fragile: money(1_600),
  },
  festivalSurcharge: money(300),
  handlingMax: money(1_700),
};

/**
 * The order total from which delivery is free: 199 rupees. A sample until each town's own fee rules arrive
 * (Phase 2); the offers and the cart both read it from here, so they always agree.
 */
export const FREE_DELIVERY_FROM = ZONE.freeDeliveryFrom;

/** How far the sample address is from the store, until the address section (1e) measures the real trip. */
export const SAMPLE_DISTANCE_KM = 2.4;
