import type { Order } from '@quibo/contracts';
import type { TrackedOrder } from './machine';
import { isFinished } from './tracking';

/** The orders still moving, and the ones that are over. Each keeps its order (newest first, as they are kept). */
export function splitOrders(orders: readonly TrackedOrder[]): {
  active: TrackedOrder[];
  past: TrackedOrder[];
} {
  const active: TrackedOrder[] = [];
  const past: TrackedOrder[] = [];
  for (const tracked of orders) {
    (isFinished(tracked.order) ? past : active).push(tracked);
  }
  return { active, past };
}

/** The last thing that happened to an order: when it arrived, or when it ended. */
export function lastEventAt(order: Order): Date {
  const last = order.events[order.events.length - 1];
  return new Date(last?.at ?? order.placedAt);
}

/** How many pictures to show in a row of overlapping ones, and how many more there are than fit. */
export function thumbRow<T>(items: readonly T[], fit: number): { shown: T[]; more: number } {
  const shown = items.slice(0, fit);
  return { shown, more: Math.max(0, items.length - shown.length) };
}
