import {
  OrderSchema,
  type Acceptance,
  type FulfilmentMode,
  type Money,
  type Order,
  type OrderDelivery,
  type OrderItem,
  type OrderShop,
  type PaymentMethod,
  type TownId,
} from '@quibo/contracts';
import { ENDINGS, SPEEDS, type ClockSpeed, type Ending, type TrackedOrder } from './machine';

/**
 * The "accept" part of the fulfilment strategy (ADR 0002): who has to say yes to an order. A partner shop does; a company dark
 * store accepts by itself. This is the one place the town's mode is looked at when an order is placed. Everything after it reads
 * the order's own `acceptance`.
 */
export function acceptanceFor(mode: FulfilmentMode): Acceptance {
  return mode === 'dark' ? 'automatic' : 'by_shop';
}

/** Everything needed to place an order. */
export interface PlaceRequest {
  /** Made when checkout opens. Asking twice with the same key gives back the same order. */
  key: string;
  /** The new order's id, used only if the key has not been seen. */
  id: string;
  townId: TownId;
  mode: FulfilmentMode;
  shops: readonly OrderShop[];
  items: readonly OrderItem[];
  address: string;
  delivery: OrderDelivery;
  method: PaymentMethod;
  total: Money;
  now: Date;
}

/** How the mock clock will run an order. A real order has no plan. */
export interface ClockPlan {
  ending: Ending;
  speed: ClockSpeed;
}

export const DEFAULT_PLAN: ClockPlan = { ending: 'delivered', speed: 'fast' };

/** The most orders kept on the phone: the newest. */
const KEEP = 50;

/** A freshly placed order: it has one event, "placed". Cash is still to be collected; UPI has already been paid. */
export function buildOrder(request: PlaceRequest): Order {
  const at = request.now.toISOString();
  return OrderSchema.parse({
    id: request.id,
    townId: request.townId,
    idempotencyKey: request.key,
    status: 'placed',
    acceptance: acceptanceFor(request.mode),
    shops: request.shops,
    items: request.items,
    address: request.address,
    delivery: request.delivery,
    payment: {
      method: request.method,
      status: request.method === 'cod' ? 'to_collect' : 'paid',
    },
    total: request.total,
    placedAt: at,
    events: [{ status: 'placed', at, by: 'customer' }],
  });
}

export interface Placed {
  /** The orders after placing, newest first. */
  orders: TrackedOrder[];
  order: Order;
  /** False when the key had been used before and the earlier order was given back. */
  created: boolean;
}

/**
 * Places an order once. If an order with the same key already exists (a double tap, or a retry after a slow answer) that one is
 * returned and nothing is added: the same request can be made any number of times and makes one order.
 */
export function placeOnce(
  existing: readonly TrackedOrder[],
  request: PlaceRequest,
  plan: ClockPlan = DEFAULT_PLAN,
): Placed {
  const found = existing.find((tracked) => tracked.order.idempotencyKey === request.key);
  if (found !== undefined) return { orders: [...existing], order: found.order, created: false };
  const order = buildOrder(request);
  return {
    orders: [{ order, ...plan }, ...existing].slice(0, KEEP),
    order,
    created: true,
  };
}

/** Bumped when the saved shape changes, so an old one is ignored rather than misread. */
const VERSION = 1;

export function serialiseOrders(orders: readonly TrackedOrder[]): string {
  return JSON.stringify({ v: VERSION, orders });
}

/**
 * Reads the saved orders back. Anything that is not a well-formed order (a tampered or damaged copy, or one from an older
 * version) is dropped rather than shown, so a bad entry can never crash the Orders screen.
 */
export function parseOrders(saved: string | null): TrackedOrder[] {
  if (saved === null) return [];
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object' || parsed.v !== VERSION) return [];
    const list = Array.isArray(parsed.orders) ? (parsed.orders as unknown[]) : [];
    return list.flatMap((item): TrackedOrder[] => {
      if (item === null || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const order = OrderSchema.safeParse(entry.order);
      const ending = ENDINGS.find((candidate) => candidate === entry.ending);
      const speed = SPEEDS.find((candidate) => candidate === entry.speed);
      if (!order.success || ending === undefined || speed === undefined) return [];
      return [{ order: order.data, ending, speed }];
    });
  } catch {
    return [];
  }
}
