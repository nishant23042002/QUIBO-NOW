import { add, money, subtract, type Money } from '@quibo/contracts';
import { ZONE, type CareClass, type ZoneSettings } from './delivery';
import { deliveryFee, type DeliveryFee, type TripConditions } from './deliveryFee';

export interface BillInput {
  /** What the items cost at today's prices, from every shop. */
  itemTotal: Money;
  /** What the items save against their printed prices. */
  saved: Money;
  /** The care class of each item in the cart. The most delicate one sets the handling fee. */
  cares: readonly CareClass[];
  /** How far, when and in what weather the order is delivered, which sets the delivery fee. */
  trip: TripConditions;
  /** The coupon applied, and what it takes off the items. Leave out when there is none or it takes off nothing. */
  coupon?: { code: string; discount: Money };
}

export interface Bill {
  itemTotal: Money;
  /** The items at their printed prices: `itemTotal` plus `saved`. */
  printedTotal: Money;
  /** What the items save against their printed prices. */
  saved: Money;
  /** The coupon taken off the items, when there is one. */
  coupon?: { code: string; discount: Money };
  delivery: {
    /** What is charged: nothing when delivery is free. */
    fee: Money;
    free: boolean;
    /** What free delivery saves: the fee that would have been charged. */
    waived: Money;
    /** What the fee is made of, to explain it. */
    parts: DeliveryFee;
  };
  handling: {
    fee: Money;
    /** The class of care that set the fee, for the line that explains it. Absent when the cart is empty. */
    reason?: CareClass;
    /** Whether a festival day added to it. */
    festival: boolean;
  };
  /** Everything the customer pays. */
  toPay: Money;
  /** Everything the order saves: the printed-price discount, the coupon, and the delivery fee waived. */
  totalSaved: Money;
}

const ZERO = money(0);

/**
 * The bill for one order. There is no minimum order: any total can be placed. A coupon comes off the items. Delivery
 * costs what the trip costs (see `deliveryFee`) and is free once the items reach the zone's line; that line is judged on
 * the items before the coupon, so a coupon never takes free delivery away. The handling fee pays for care in carrying: the cart
 * pays for its most delicate item, plus a small surcharge on a festival day, and never more than the zone's top fee.
 * All of it is integer paise.
 */
export function computeBill(input: BillInput, zone: ZoneSettings = ZONE): Bill {
  const { itemTotal, saved, cares, trip } = input;
  const couponOff = input.coupon?.discount ?? ZERO;
  const empty = cares.length === 0;

  const parts = deliveryFee(trip, zone.delivery);
  const free = !empty && itemTotal >= zone.freeDeliveryFrom;
  const charged = empty || free ? ZERO : parts.fee;
  const waived = free ? parts.fee : ZERO;

  let reason: CareClass | undefined;
  let handlingFee: Money = ZERO;
  for (const care of cares) {
    if (reason === undefined || zone.handling[care] > handlingFee) {
      reason = care;
      handlingFee = zone.handling[care];
    }
  }
  const surcharged = trip.festival && reason !== undefined;
  if (surcharged) handlingFee = add(handlingFee, zone.festivalSurcharge);
  if (handlingFee > zone.handlingMax) handlingFee = zone.handlingMax;

  return {
    itemTotal,
    printedTotal: add(itemTotal, saved),
    saved,
    ...(input.coupon !== undefined && couponOff > 0 ? { coupon: input.coupon } : {}),
    delivery: { fee: charged, free, waived, parts },
    handling: {
      fee: handlingFee,
      ...(reason !== undefined ? { reason } : {}),
      festival: surcharged,
    },
    toPay: add(add(subtract(itemTotal, couponOff), charged), handlingFee),
    totalSaved: add(add(saved, couponOff), waived),
  };
}
