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

/**
 * How long quick delivery is estimated to take. It is an estimate shown as a range, never a promise: the minutes come from
 * packing, the distance, the items and how busy or wet the day is.
 */
export interface QuickRules {
  /** Packing and pickup. */
  baseMinutes: number;
  /** Riding time for each kilometre. */
  perKm: number;
  rushExtra: number;
  rainExtra: number;
  festivalExtra: number;
  /** Extra packing time for each four items after the first four, and the most that can add. */
  extraPerFourItems: number;
  maxItemExtra: number;
  /** The estimate is rounded down to a multiple of this many minutes, and shown as a range this wide. */
  step: number;
  /** However slow things get, the estimate never goes above this. */
  maxMinutes: number;
}

/** When orders can be delivered, in one-hour windows. */
export interface SlotRules {
  /** The first hour a window can start, on a 24-hour clock. */
  firstHour: number;
  /** The hour the last window ends. The last window starts one hour before it. */
  lastEndHour: number;
  /** A window can be chosen only if it starts at least this long from now, so the shop has time to pack. */
  leadMinutes: number;
  /** Windows that are full, as "today-18" or "tomorrow-9" (the day, then the hour the window starts). */
  full: readonly string[];
}

/** A town's delivery rules. Fees and limits live in data, not in screens (the town's own rules arrive in Phase 2). */
export interface ZoneSettings {
  /** The item total from which delivery is free. */
  freeDeliveryFrom: Money;
  delivery: DeliveryRules;
  slots: SlotRules;
  quick: QuickRules;
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
  quick: {
    baseMinutes: 6,
    perKm: 3,
    rushExtra: 5,
    rainExtra: 4,
    festivalExtra: 3,
    extraPerFourItems: 1,
    maxItemExtra: 4,
    step: 5,
    maxMinutes: 40,
  },
  slots: {
    firstHour: 7,
    lastEndHour: 21,
    leadMinutes: 60,
    full: ['today-18', 'today-19', 'tomorrow-8', 'tomorrow-9', 'tomorrow-18'],
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
