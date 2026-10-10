import type { Money, OrderDelivery, OrderItem, PaymentMethod } from '@quibo/contracts';
import { ZONE, type ZoneSettings } from '../home/delivery';
import type { Delivery } from '../home/slots';

/** One way of paying, and whether it can be used for this order. */
export interface PaymentOption {
  method: PaymentMethod;
  /** False when this order is too big for it. UPI is always allowed. */
  allowed: boolean;
}

/**
 * The ways to pay for an order of this total. UPI is always there. Cash on delivery is there too, but only up to the zone's limit
 * for a new customer, so a rider never carries a large amount of someone else's cash on a first order. The limit is data, not
 * code (it comes from the zone's settings).
 */
export function paymentOptions(total: Money, zone: ZoneSettings = ZONE): PaymentOption[] {
  return [
    { method: 'cod', allowed: total <= zone.payment.codMaxNewCustomer },
    { method: 'upi', allowed: true },
  ];
}

/** What is selected when checkout opens: cash on delivery when it is allowed, otherwise UPI. */
export function defaultPayment(total: Money, zone: ZoneSettings = ZONE): PaymentMethod {
  return paymentOptions(total, zone).find((option) => option.allowed)?.method ?? 'upi';
}

/**
 * What is selected now: the shopper's own choice while it is still allowed, and otherwise the default. A choice stops being
 * allowed when the bill grows past the cash limit while checkout is open.
 */
export function effectivePayment(
  chosen: PaymentMethod | null,
  total: Money,
  zone: ZoneSettings = ZONE,
): PaymentMethod {
  const options = paymentOptions(total, zone);
  if (chosen !== null && options.some((option) => option.method === chosen && option.allowed)) {
    return chosen;
  }
  return defaultPayment(total, zone);
}

/** One shop's part of the order, as checkout lists it. */
export interface ShopLine {
  /** The shop's name, or `fallback` where the town has one store and the items do not say. */
  name: string;
  /** How many different items come from this shop. */
  items: number;
}

/** The shops the order comes from, in the order they first appear, with how many items each gives. */
export function shopLines(items: readonly { soldBy?: string }[], fallback: string): ShopLine[] {
  const lines: ShopLine[] = [];
  for (const item of items) {
    const name = item.soldBy ?? fallback;
    const found = lines.find((line) => line.name === name);
    if (found === undefined) lines.push({ name, items: 1 });
    else found.items += 1;
  }
  return lines;
}

/**
 * How the order will be delivered, as the order remembers it: the one-hour window the shopper picked, or the quick-delivery estimate
 * as a range of minutes. A window is kept as the times it starts and ends.
 */
export function orderDeliveryOf(
  current: Delivery | undefined,
  eta: { from: number; to: number },
): OrderDelivery {
  if (current?.kind === 'slot') {
    const start = new Date(current.slot.date);
    start.setHours(current.slot.hour, 0, 0, 0);
    const end = new Date(start.getTime() + 3_600_000);
    return { kind: 'slot', start: start.toISOString(), end: end.toISOString() };
  }
  return { kind: 'quick', fromMinutes: eta.from, toMinutes: eta.to };
}

/** What was bought, as the order keeps it, from the cart's lines. */
export function orderItemsOf(
  lines: readonly {
    id: string;
    name: string;
    pack: string;
    emoji: string;
    category: string;
    quantity: number;
    loose?: true;
    lineTotal: Money;
  }[],
): OrderItem[] {
  return lines.map((line) => ({
    packId: line.id,
    name: line.name,
    pack: line.pack,
    emoji: line.emoji,
    category: line.category,
    quantity: line.quantity,
    ...(line.loose === true ? { loose: true } : {}),
    lineTotal: line.lineTotal,
  }));
}
