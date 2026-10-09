import type { Order, OrderStatus } from '@quibo/contracts';

/** The steps the customer sees, in order. A shop confirming is only a step when there is a shop to confirm. */
function visibleSteps(order: Order): readonly OrderStatus[] {
  return order.acceptance === 'by_shop'
    ? ['placed', 'accepted', 'ready', 'picked_up', 'delivered']
    : ['placed', 'ready', 'picked_up', 'delivered'];
}

export type StepState = 'done' | 'current' | 'upcoming' | 'stopped';

export interface TimelineStep {
  status: OrderStatus;
  state: StepState;
  /** When the order reached it, as an ISO time, or null if it has not. */
  at: string | null;
}

function reachedAt(order: Order, status: OrderStatus): string | null {
  return order.events.find((event) => event.status === status)?.at ?? null;
}

/** How the order ended early, or null while it is still going or once it has arrived. */
export function exitOf(order: Order): 'rejected' | 'cancelled' | 'undelivered' | null {
  return order.status === 'rejected' ||
    order.status === 'cancelled' ||
    order.status === 'undelivered'
    ? order.status
    : null;
}

/**
 * The timeline of an order: what is done, what is in progress, what is still to come. It reads the order, never the town's mode
 * (ADR 0002): an automatically accepted order simply has no "accepted" step. An order that ended early shows the steps it
 * reached and then the exit, and nothing after it.
 */
export function timelineOf(order: Order): TimelineStep[] {
  const exit = exitOf(order);
  const steps: TimelineStep[] = [];
  let currentTaken = false;
  for (const status of visibleSteps(order)) {
    const at = reachedAt(order, status);
    if (at !== null) {
      steps.push({ status, state: 'done', at });
    } else if (exit === null) {
      steps.push({ status, state: currentTaken ? 'upcoming' : 'current', at: null });
      currentTaken = true;
    }
  }
  if (exit !== null) {
    steps.push({ status: exit, state: 'stopped', at: reachedAt(order, exit) });
  }
  return steps;
}

/** Where one shop's part of the order is. */
export type ShopPart = 'waiting' | 'packing' | 'packed' | 'picked_up';

const PART_OF: Partial<Record<OrderStatus, ShopPart>> = {
  placed: 'waiting',
  accepted: 'packing',
  ready: 'packed',
  picked_up: 'picked_up',
  delivered: 'picked_up',
};

/**
 * Each shop's part: waiting, packing, packed, then picked up by the one rider (ADR 0009). It follows the furthest step the order
 * reached, so an order that ended early keeps showing how far the shops got.
 */
export function shopParts(order: Order): { id: string; name: string; part: ShopPart }[] {
  let part: ShopPart = 'waiting';
  for (const event of order.events) {
    part = PART_OF[event.status] ?? part;
  }
  return order.shops.map((shop) => ({ id: shop.id, name: shop.name, part }));
}
