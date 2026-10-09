import { z } from 'zod';
import { OrderIdSchema, TownIdSchema } from './ids';
import { MoneySchema } from './money';
import { ORDER_TRANSITIONS, OrderStatusSchema } from './order-status';

/** How the customer pays. Cash on delivery is collected by the rider; UPI is paid before the order is placed. */
export const PAYMENT_METHODS = ['cod', 'upi'] as const;
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/** `to_collect` is cash the rider will take at the door; it becomes `paid` when the order is delivered. */
export const PAYMENT_STATUSES = ['to_collect', 'paid'] as const;
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/**
 * Who has to say yes to the order. Set when the order is placed, from the fulfilment strategy, so the screens read it from the
 * order and never from the town's mode (ADR 0002): a shop accepts, or the order is accepted automatically (a company dark store).
 */
export const ACCEPTANCES = ['by_shop', 'automatic'] as const;
export const AcceptanceSchema = z.enum(ACCEPTANCES);
export type Acceptance = z.infer<typeof AcceptanceSchema>;

/** Who made a move. */
export const EVENT_ACTORS = ['customer', 'shop', 'rider', 'ops', 'system'] as const;
export const EventActorSchema = z.enum(EVENT_ACTORS);
export type EventActor = z.infer<typeof EventActorSchema>;

/** One row of an order's history, the shape of an `order_events` row. Append-only. */
export const OrderEventSchema = z.object({
  status: OrderStatusSchema,
  at: z.iso.datetime(),
  by: EventActorSchema,
  reason: z.string().min(1).optional(),
});
export type OrderEvent = z.infer<typeof OrderEventSchema>;

/** One shop's part of the order. One order can hold several shops; there is still one rider and one delivery (ADR 0009). */
export const OrderShopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type OrderShop = z.infer<typeof OrderShopSchema>;

/**
 * A placed order. `status` is always the last event's status, the history starts at `placed`, and every move in it is one the
 * transition table allows, so a stored order that breaks those rules fails to parse.
 */
export const OrderSchema = z
  .object({
    id: OrderIdSchema,
    townId: TownIdSchema,
    /** Kept so placing the same order twice (a double tap, a retry) gives back the same order. */
    idempotencyKey: z.string().min(8),
    status: OrderStatusSchema,
    acceptance: AcceptanceSchema,
    shops: z.array(OrderShopSchema).min(1),
    payment: z.object({ method: PaymentMethodSchema, status: PaymentStatusSchema }),
    /** What the customer pays, in paise. For cash on delivery this is the amount the rider collects. */
    total: MoneySchema,
    placedAt: z.iso.datetime(),
    events: z.array(OrderEventSchema).min(1),
  })
  .superRefine((order, ctx) => {
    const first = order.events[0];
    const last = order.events[order.events.length - 1];
    if (first?.status !== 'placed') {
      ctx.addIssue({
        code: 'custom',
        path: ['events', 0],
        message: 'The history starts at placed',
      });
    }
    if (last?.status !== order.status) {
      ctx.addIssue({
        code: 'custom',
        path: ['status'],
        message: 'Status must match the last event',
      });
    }
    order.events.forEach((event, index) => {
      const before = order.events[index - 1];
      if (before === undefined) return;
      const allowed: readonly string[] = ORDER_TRANSITIONS[before.status];
      if (!allowed.includes(event.status)) {
        ctx.addIssue({
          code: 'custom',
          path: ['events', index, 'status'],
          message: `${before.status} cannot move to ${event.status}`,
        });
      }
      if (Date.parse(event.at) < Date.parse(before.at)) {
        ctx.addIssue({
          code: 'custom',
          path: ['events', index, 'at'],
          message: 'Events go forwards in time',
        });
      }
    });
  });
export type Order = z.infer<typeof OrderSchema>;
