import { z } from 'zod';

/**
 * STUB. Phase 0 reconstruction of the order lifecycle from PLAN sections 6, 7 and 10.
 *
 * The lifecycle diagram in PLAN section 7 ("5 states, 3 exceptions") did not survive the
 * export to Markdown, so these names and arrows are inferred, not copied. Confirm them
 * against the original diagram at Phase 0 sign-off.
 *
 * Five states: placed, accepted, ready, picked_up, delivered.
 * Three exits ops handles by phone: rejected, cancelled, undelivered.
 *
 * This is only the table of allowed moves. Who may make each move, and the single function
 * that applies it (OrderStateMachine.transition(), which writes an order_events row), are
 * built in Phase 2. Nothing may update an order's status any other way.
 */
export const ORDER_STATUSES = [
  'placed',
  'accepted',
  'ready',
  'picked_up',
  'delivered',
  'rejected',
  'cancelled',
  'undelivered',
] as const;
export const OrderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/** Allowed next statuses from each status. An empty list means the status is final. */
export const ORDER_TRANSITIONS = {
  placed: ['accepted', 'rejected', 'cancelled'],
  accepted: ['ready', 'cancelled'],
  ready: ['picked_up', 'cancelled'],
  picked_up: ['delivered', 'undelivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
  undelivered: [],
} as const satisfies Record<OrderStatus, readonly OrderStatus[]>;
