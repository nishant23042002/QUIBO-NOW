import { ORDER_TRANSITIONS, type Order } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import {
  advance,
  canCancel,
  cancelByCustomer,
  nextDueAt,
  pathFor,
  transition,
  type Ending,
  type TrackedOrder,
} from './machine';
import { samplePlacedOrder } from './sample';

const T0 = Date.parse('2026-10-09T10:00:00.000Z');
const at = (seconds: number) => new Date(T0 + seconds * 1000);
const track = (order: Order, ending: Ending = 'delivered'): TrackedOrder => ({
  order,
  ending,
  speed: 'fast',
});
const statuses = (order: Order) => order.events.map((event) => event.status);

describe('transition', () => {
  it('adds a row to the history and changes the status', () => {
    const next = transition(samplePlacedOrder(), 'accepted', at(8), 'shop');
    expect(next.status).toBe('accepted');
    expect(statuses(next)).toEqual(['placed', 'accepted']);
    expect(next.events[1]).toMatchObject({ by: 'shop', at: at(8).toISOString() });
  });

  it('does not change the order it was given', () => {
    const order = samplePlacedOrder();
    transition(order, 'accepted', at(8), 'shop');
    expect(order.status).toBe('placed');
    expect(order.events).toHaveLength(1);
  });

  it('throws for a move the table does not allow', () => {
    expect(() => transition(samplePlacedOrder(), 'delivered', at(8), 'rider')).toThrow(
      /cannot move/,
    );
  });

  it('throws for any move out of a finished order', () => {
    const done = transition(samplePlacedOrder(), 'cancelled', at(5), 'customer');
    for (const to of ['accepted', 'ready', 'picked_up', 'delivered'] as const) {
      expect(() => transition(done, to, at(9), 'ops')).toThrow();
    }
  });

  it('settles cash when the order arrives, and not before', () => {
    let order = samplePlacedOrder();
    for (const status of ['accepted', 'ready', 'picked_up'] as const) {
      order = transition(order, status, at(10), 'shop');
      expect(order.payment.status).toBe('to_collect');
    }
    expect(transition(order, 'delivered', at(60), 'rider').payment.status).toBe('paid');
  });

  it('sends a UPI payment back when the order ends without arriving', () => {
    for (const path of [
      ['rejected'],
      ['accepted', 'cancelled'],
      ['accepted', 'ready', 'picked_up', 'undelivered'],
    ] as const) {
      let order = samplePlacedOrder('by_shop', at(0), 'upi');
      for (const to of path) order = transition(order, to, at(10), 'shop');
      expect(order.payment).toEqual({ method: 'upi', status: 'refunding' });
    }
  });

  it('keeps a UPI payment paid when the order arrives', () => {
    let order = samplePlacedOrder('by_shop', at(0), 'upi');
    for (const to of ['accepted', 'ready', 'picked_up', 'delivered'] as const) {
      order = transition(order, to, at(10), 'shop');
    }
    expect(order.payment.status).toBe('paid');
  });

  it('leaves a cash order that did not arrive with nothing paid', () => {
    const order = transition(samplePlacedOrder(), 'rejected', at(10), 'shop');
    expect(order.payment).toEqual({ method: 'cod', status: 'to_collect' });
  });

  it('keeps a UPI order paid throughout', () => {
    const order = samplePlacedOrder('by_shop', at(0), 'upi');
    expect(order.payment.status).toBe('paid');
    expect(transition(order, 'accepted', at(8), 'shop').payment.status).toBe('paid');
  });
});

describe('pathFor', () => {
  it.each(['by_shop', 'automatic'] as const)(
    'every path only makes allowed moves (%s)',
    (acceptance) => {
      for (const ending of ['delivered', 'rejected', 'cancelled', 'undelivered'] as const) {
        let from: keyof typeof ORDER_TRANSITIONS = 'placed';
        for (const to of pathFor(acceptance, ending)) {
          expect(ORDER_TRANSITIONS[from] as readonly string[]).toContain(to);
          from = to;
        }
        expect(ORDER_TRANSITIONS[from]).toHaveLength(0);
      }
    },
  );

  it("lets a shop reject, but turns an automatic order's rejection into a cancellation", () => {
    expect(pathFor('by_shop', 'rejected')).toEqual(['rejected']);
    expect(pathFor('automatic', 'rejected')).toEqual(['accepted', 'cancelled']);
  });
});

describe('the order clock', () => {
  it('does nothing before the first move is due', () => {
    const tracked = track(samplePlacedOrder());
    expect(advance(tracked, at(7)).order.status).toBe('placed');
    expect(nextDueAt(tracked)).toBe(T0 + 8_000);
  });

  it('walks a shop order from placed to delivered', () => {
    const done = advance(track(samplePlacedOrder('by_shop')), at(600));
    expect(statuses(done.order)).toEqual(['placed', 'accepted', 'ready', 'picked_up', 'delivered']);
    expect(done.order.payment.status).toBe('paid');
    expect(nextDueAt(done)).toBeNull();
  });

  it('accepts an automatic order at once', () => {
    const now = advance(track(samplePlacedOrder('automatic')), at(0));
    expect(statuses(now.order)).toEqual(['placed', 'accepted']);
    expect(now.order.events[1]?.by).toBe('shop');
  });

  it('stamps each move with the time it was due, however late it is noticed', () => {
    const late = advance(track(samplePlacedOrder('by_shop')), at(600));
    expect(late.order.events.map((event) => event.at)).toEqual([
      at(0).toISOString(),
      at(8).toISOString(),
      at(20).toISOString(),
      at(30).toISOString(),
      at(45).toISOString(),
    ]);
  });

  it('gives the same history whether it ticks along or catches up once', () => {
    let ticking = track(samplePlacedOrder());
    for (let second = 1; second <= 100; second += 1) ticking = advance(ticking, at(second));
    expect(ticking).toEqual(advance(track(samplePlacedOrder()), at(100)));
  });

  it('runs six times slower at the slow pace', () => {
    const slow: TrackedOrder = { ...track(samplePlacedOrder()), speed: 'slow' };
    expect(nextDueAt(slow)).toBe(T0 + 48_000);
    expect(advance(slow, at(47)).order.status).toBe('placed');
    expect(advance(slow, at(48)).order.status).toBe('accepted');
  });

  it.each([
    ['rejected', 'rejected'],
    ['cancelled', 'cancelled'],
    ['undelivered', 'undelivered'],
  ] as const)('can end as %s', (ending, last) => {
    const done = advance(track(samplePlacedOrder(), ending), at(600));
    expect(done.order.status).toBe(last);
    expect(nextDueAt(done)).toBeNull();
    expect(done.order.events.at(-1)?.reason).toBeDefined();
  });

  it('leaves cash to collect on an order that was not delivered', () => {
    const done = advance(track(samplePlacedOrder(), 'undelivered'), at(600));
    expect(done.order.payment.status).toBe('to_collect');
  });
});

describe('cancelling', () => {
  it('is possible only until packing is finished', () => {
    const statusOrder = (status: 'placed' | 'accepted' | 'ready' | 'picked_up') => {
      let order = samplePlacedOrder();
      for (const next of ['accepted', 'ready', 'picked_up'] as const) {
        if (order.status === status) break;
        order = transition(order, next, at(10), 'shop');
      }
      return order;
    };
    expect(canCancel(statusOrder('placed'))).toBe(true);
    expect(canCancel(statusOrder('accepted'))).toBe(true);
    expect(canCancel(statusOrder('ready'))).toBe(false);
    expect(canCancel(statusOrder('picked_up'))).toBe(false);
  });

  it("ends the order in the customer's name and stops the clock", () => {
    const cancelled = cancelByCustomer(track(samplePlacedOrder()), at(3));
    expect(cancelled.order.status).toBe('cancelled');
    expect(cancelled.order.events.at(-1)).toMatchObject({
      by: 'customer',
      at: at(3).toISOString(),
    });
    expect(nextDueAt(cancelled)).toBeNull();
    expect(advance(cancelled, at(600)).order.status).toBe('cancelled');
  });

  it('is too late once the shop has packed: the moves already due happen first', () => {
    const tried = cancelByCustomer(track(samplePlacedOrder()), at(25));
    expect(tried.order.status).toBe('ready');
  });
});
