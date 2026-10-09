import { add, money, subtract, type Money } from '@quibo/contracts';
import { ZONE, type CareClass, type ZoneSettings } from './delivery';

export interface BillInput {
  /** What the items cost at today's prices, from every shop. */
  itemTotal: Money;
  /** What the items save against their printed prices. */
  saved: Money;
  /** The care class of each item in the cart. The most delicate one sets the handling fee. */
  cares: readonly CareClass[];
  /** Whether a festival rush is on, which adds a little to the handling fee. */
  festival: boolean;
}

export interface Bill {
  itemTotal: Money;
  /** The items at their printed prices: `itemTotal` plus `saved`. */
  printedTotal: Money;
  /** What the items save against their printed prices. */
  saved: Money;
  delivery: {
    /** What is charged: nothing when delivery is free. */
    fee: Money;
    free: boolean;
    /** What free delivery saves: the usual fee, when delivery is free. */
    waived: Money;
  };
  handling: {
    fee: Money;
    /** The class of care that set the fee, for the line that explains it. Absent when the cart is empty. */
    reason?: CareClass;
    /** Whether a festival rush added to it. */
    festival: boolean;
  };
  /** Everything the customer pays. */
  toPay: Money;
  /** Everything the order saves: the printed-price discount plus the delivery fee waived. */
  totalSaved: Money;
  minimum: { met: boolean; shortBy: Money };
}

const ZERO = money(0);

/**
 * The bill for one order. Delivery is free once the items reach the zone's line; below it the delivery fee applies. The
 * handling fee pays for care in carrying: the cart pays for its most delicate item, plus a small surcharge on a festival
 * rush, and never more than the zone's top fee. All of it is integer paise.
 */
export function computeBill(input: BillInput, zone: ZoneSettings = ZONE): Bill {
  const { itemTotal, saved, cares, festival } = input;
  const empty = cares.length === 0;

  const free = !empty && itemTotal >= zone.freeDeliveryFrom;
  const deliveryFee = empty || free ? ZERO : zone.deliveryFee;
  const waived = free ? zone.deliveryFee : ZERO;

  let reason: CareClass | undefined;
  let handlingFee: Money = ZERO;
  for (const care of cares) {
    if (reason === undefined || zone.handling[care] > handlingFee) {
      reason = care;
      handlingFee = zone.handling[care];
    }
  }
  const surcharged = festival && reason !== undefined;
  if (surcharged) handlingFee = add(handlingFee, zone.festivalSurcharge);
  if (handlingFee > zone.handlingMax) handlingFee = zone.handlingMax;

  const met = itemTotal >= zone.minimumOrder;

  return {
    itemTotal,
    printedTotal: add(itemTotal, saved),
    saved,
    delivery: { fee: deliveryFee, free, waived },
    handling: {
      fee: handlingFee,
      ...(reason !== undefined ? { reason } : {}),
      festival: surcharged,
    },
    toPay: add(add(itemTotal, deliveryFee), handlingFee),
    totalSaved: add(saved, waived),
    minimum: {
      met: empty || met,
      shortBy: empty || met ? ZERO : subtract(zone.minimumOrder, itemTotal),
    },
  };
}
