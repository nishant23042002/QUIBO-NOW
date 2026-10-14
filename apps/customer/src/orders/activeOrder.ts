import { isFinished } from './tracking';
import type { TrackedOrder } from './machine';

/**
 * The order Home's live card follows: the newest one that is still going. An order that has arrived, or ended early, is not
 * "live", so the card goes when the last one is over. The list is newest first, as the provider keeps it.
 */
export function activeOrder(orders: readonly TrackedOrder[]): TrackedOrder | undefined {
  return orders.find((tracked) => !isFinished(tracked.order));
}
