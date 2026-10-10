import {
  ORDER_TRANSITIONS,
  OrderSchema,
  type Acceptance,
  type EventActor,
  type Order,
  type OrderStatus,
} from '@quibo/contracts';

/**
 * Stands in for `OrderStateMachine.transition()` until the server has one (Phase 2): an order's status changes only through here,
 * every change is a new row on its history, and a move the transition table does not allow throws.
 */
export function transition(
  order: Order,
  to: OrderStatus,
  at: Date,
  by: EventActor,
  reason?: string,
): Order {
  const allowed: readonly OrderStatus[] = ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(to)) {
    throw new Error(`An order that is ${order.status} cannot move to ${to}`);
  }
  const event = {
    status: to,
    at: at.toISOString(),
    by,
    ...(reason === undefined ? {} : { reason }),
  };
  return OrderSchema.parse({
    ...order,
    status: to,
    payment: paymentAfter(order, to),
    events: [...order.events, event],
  });
}

/**
 * What happens to the payment when the order moves. Cash is paid at the door, so it is settled when the order arrives. A UPI payment
 * on an order that ended without arriving goes back to the customer. A cash order that did not arrive was never paid.
 */
function paymentAfter(order: Order, to: OrderStatus): Order['payment'] {
  const { payment } = order;
  if (to === 'delivered' && payment.method === 'cod') return { ...payment, status: 'paid' };
  const ended = to === 'rejected' || to === 'cancelled' || to === 'undelivered';
  if (ended && payment.method === 'upi' && payment.status === 'paid') {
    return { ...payment, status: 'refunding' };
  }
  return payment;
}

/** How an order is going to end. Chosen when it is placed; normally it arrives. */
export const ENDINGS = ['delivered', 'rejected', 'cancelled', 'undelivered'] as const;
export type Ending = (typeof ENDINGS)[number];

/** The moves after `placed`, in order, for an order that ends this way. */
export function pathFor(acceptance: Acceptance, ending: Ending): readonly OrderStatus[] {
  switch (ending) {
    case 'delivered':
      return ['accepted', 'ready', 'picked_up', 'delivered'];
    case 'undelivered':
      return ['accepted', 'ready', 'picked_up', 'undelivered'];
    case 'cancelled':
      return ['accepted', 'cancelled'];
    // A shop can turn an order down. An automatically accepted one has no shop to say no, so the same end is a cancellation.
    case 'rejected':
      return acceptance === 'by_shop' ? ['rejected'] : ['accepted', 'cancelled'];
  }
}

/** Who makes each move. */
const ACTOR: Record<OrderStatus, EventActor> = {
  placed: 'customer',
  accepted: 'shop',
  ready: 'shop',
  picked_up: 'rider',
  delivered: 'rider',
  rejected: 'shop',
  cancelled: 'ops',
  undelivered: 'rider',
};

/** Why an order ended early, as the history keeps it. */
const REASON: Partial<Record<OrderStatus, string>> = {
  rejected: 'The shop could not take this order',
  cancelled: 'Cancelled',
  undelivered: 'The rider could not reach the address',
};

/** The mock order clock's pace. `fast` lets a whole order be watched in a minute or two. */
export const SPEEDS = ['fast', 'slow'] as const;
export type ClockSpeed = (typeof SPEEDS)[number];

const SLOW_FACTOR = 6;

/** How long before each move, counted from the one before it, in milliseconds at the fast pace. */
function delayBefore(status: OrderStatus, acceptance: Acceptance): number {
  switch (status) {
    case 'accepted':
      return acceptance === 'automatic' ? 0 : 8_000;
    case 'ready':
      return 12_000;
    case 'picked_up':
      return 10_000;
    case 'delivered':
    case 'undelivered':
      return 15_000;
    case 'rejected':
      return 8_000;
    case 'cancelled':
      return 6_000;
    case 'placed':
      return 0;
  }
}

/** An order together with how the mock clock is to run it. The plan is not part of the order: a real order has no plan. */
export interface TrackedOrder {
  order: Order;
  ending: Ending;
  speed: ClockSpeed;
}

function pace(speed: ClockSpeed): number {
  return speed === 'slow' ? SLOW_FACTOR : 1;
}

/** The move the clock makes next, or null once the plan is used up. */
function upcoming(tracked: TrackedOrder): OrderStatus | null {
  const { order, ending } = tracked;
  const moved = order.events.length - 1;
  return pathFor(order.acceptance, ending)[moved] ?? null;
}

/** When the next move is due, in epoch milliseconds, or null once the order is over or the customer has ended it. */
export function nextDueAt(tracked: TrackedOrder): number | null {
  const next = upcoming(tracked);
  const last = tracked.order.events[tracked.order.events.length - 1];
  if (next === null || last === undefined) return null;
  // The customer's own cancellation ends the order early: whatever the plan said, nothing is left to do.
  if (ORDER_TRANSITIONS[tracked.order.status].length === 0) return null;
  return Date.parse(last.at) + delayBefore(next, tracked.order.acceptance) * pace(tracked.speed);
}

/**
 * Makes every move that is due by `now`. Each is stamped with the time it was due, not the time it was noticed, so an order
 * that is opened again after the app was closed catches up with the same history it would have had.
 */
export function advance(tracked: TrackedOrder, now: Date): TrackedOrder {
  let current = tracked;
  for (;;) {
    const due = nextDueAt(current);
    const next = upcoming(current);
    if (due === null || next === null || due > now.getTime()) return current;
    current = {
      ...current,
      order: transition(current.order, next, new Date(due), ACTOR[next], REASON[next]),
    };
  }
}

/** The customer can still change their mind until the shop has finished packing. */
export function canCancel(order: Order): boolean {
  return order.status === 'placed' || order.status === 'accepted';
}

/** The customer cancels. Anything already due is applied first, so a late tap cannot undo a move that has happened. */
export function cancelByCustomer(tracked: TrackedOrder, now: Date): TrackedOrder {
  const caught = advance(tracked, now);
  if (!canCancel(caught.order)) return caught;
  return {
    ...caught,
    order: transition(caught.order, 'cancelled', now, 'customer', 'Cancelled by you'),
  };
}
