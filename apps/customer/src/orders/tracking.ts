import type { Money, Order, OrderStatus } from '@quibo/contracts';

/** Which line the tracking screen opens with. One per state, and the words for the two modes differ without the screen asking the mode. */
export type Headline =
  | 'waitingShop'
  | 'gettingStarted'
  | 'packingShop'
  | 'packingStore'
  | 'readyForRider'
  | 'onTheWay'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'undelivered';

/**
 * The headline for an order. It depends on the state and on who accepts the order, which the order itself carries: a dark-store
 * order is never "waiting for the shop", so no screen has to look at the town's mode.
 */
export function headlineOf(order: Order): Headline {
  const byShop = order.acceptance === 'by_shop';
  switch (order.status) {
    case 'placed':
      return byShop ? 'waitingShop' : 'gettingStarted';
    case 'accepted':
      return byShop ? 'packingShop' : 'packingStore';
    case 'ready':
      return 'readyForRider';
    case 'picked_up':
      return 'onTheWay';
    case 'delivered':
      return 'delivered';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
      return 'cancelled';
    case 'undelivered':
      return 'undelivered';
  }
}

const FINAL: readonly OrderStatus[] = ['delivered', 'rejected', 'cancelled', 'undelivered'];

/** Whether the order is over, one way or another. */
export function isFinished(order: Order): boolean {
  return FINAL.includes(order.status);
}

/** When the order reached a state, as a date, or null if it has not. */
export function reachedOn(order: Order, status: OrderStatus): Date | null {
  const event = order.events.find((candidate) => candidate.status === status);
  return event === undefined ? null : new Date(event.at);
}

/** The rider is known from the moment the order is packed. A shop that turned it down never gets one. */
export function riderShown(order: Order): boolean {
  return reachedOn(order, 'ready') !== null;
}

/** Shops can be called when a shop is the one accepting the order; a dark store has no shop to call. */
export function shopsCallable(order: Order): boolean {
  return order.acceptance === 'by_shop';
}

/** The cash the rider will collect at the door, while there is still some to hand over. */
export function cashToKeep(order: Order): Money | null {
  return order.payment.method === 'cod' &&
    order.payment.status === 'to_collect' &&
    !isFinished(order)
    ? order.total
    : null;
}

/** When the order is expected, while it is still going: a range of minutes, or a window. Never a countdown. */
export type Eta =
  { kind: 'range'; from: number; to: number } | { kind: 'window'; start: Date; end: Date };

export function etaOf(order: Order): Eta | null {
  if (isFinished(order)) return null;
  const { delivery } = order;
  return delivery.kind === 'quick'
    ? { kind: 'range', from: delivery.fromMinutes, to: delivery.toMinutes }
    : { kind: 'window', start: new Date(delivery.start), end: new Date(delivery.end) };
}

/** Where a day falls against today, for "Today" and "Tomorrow" and, otherwise, a date. */
export function dayRelativeTo(day: Date, now: Date): 'today' | 'tomorrow' | 'other' {
  const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const gap = Math.round((midnight(day).getTime() - midnight(now).getTime()) / 86_400_000);
  return gap === 0 ? 'today' : gap === 1 ? 'tomorrow' : 'other';
}

/** Hours and minutes on a 12-hour clock, for example 10:02, and whether it is before noon. */
export function clockParts(date: Date): { hour: number; minutes: string; morning: boolean } {
  const hour = date.getHours();
  return {
    hour: hour % 12 === 0 ? 12 : hour % 12,
    minutes: String(date.getMinutes()).padStart(2, '0'),
    morning: hour < 12,
  };
}

/** Stand-in people to call. Real names and numbers come from the server in Phase 2; these are made up. */
export const MOCK_RIDER = { name: 'Ramesh', phone: '9876500099' } as const;

/** A made-up number for the shop at this position in the order, ten digits. */
export function mockShopPhone(index: number): string {
  return `98765${String(index + 1).padStart(5, '0')}`;
}

/** What an order that ended without arriving means for the customer's money. */
export type EndNote = { kind: 'refund'; amount: Money } | { kind: 'nothing' };

/** The note under an order that did not arrive: a UPI payment is on its way back, and cash was never taken. Null otherwise. */
export function endNoteOf(order: Order): EndNote | null {
  const ended =
    order.status === 'rejected' || order.status === 'cancelled' || order.status === 'undelivered';
  if (!ended) return null;
  return order.payment.status === 'refunding'
    ? { kind: 'refund', amount: order.total }
    : { kind: 'nothing' };
}

/** Who ended an order that did not arrive, from its last event: the customer, the shop, the rider or us. */
export function endedBy(order: Order): 'customer' | 'shop' | 'rider' | 'ops' | null {
  const last = order.events[order.events.length - 1];
  if (last === undefined || endNoteOf(order) === null) return null;
  return last.by === 'system' ? 'ops' : last.by;
}
