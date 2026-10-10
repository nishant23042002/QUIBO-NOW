import { money, OrderIdSchema, TownIdSchema } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { newUuid, orderNumber } from './ids';
import { advance, type TrackedOrder } from './machine';
import {
  DEFAULT_PLAN,
  acceptanceFor,
  buildOrder,
  parseOrders,
  placeOnce,
  serialiseOrders,
  type PlaceRequest,
} from './place';

const NOW = new Date('2026-10-09T10:00:00.000Z');
const TOWN = TownIdSchema.parse('0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a11');

function request(overrides: Partial<PlaceRequest> = {}): PlaceRequest {
  return {
    key: 'key-aaaaaaaa',
    id: newUuid(),
    townId: TOWN,
    mode: 'partner',
    shops: [
      { id: 'dairy', name: 'Sharma Dairy' },
      { id: 'veg', name: 'Patil Vegetables' },
    ],
    delivery: { kind: 'quick', fromMinutes: 25, toMinutes: 30 },
    method: 'cod',
    total: money(34_100),
    now: NOW,
    ...overrides,
  };
}

describe('newUuid and orderNumber', () => {
  it('makes ids that the order contract accepts, and different each time', () => {
    const first = newUuid();
    expect(OrderIdSchema.safeParse(first).success).toBe(true);
    expect(newUuid()).not.toBe(first);
  });

  it('shows the last four characters in capitals', () => {
    expect(orderNumber('0192f3c4-7a10-7c3e-8b21-5d6a4e9fa1b2')).toBe('#A1B2');
  });
});

describe('acceptanceFor', () => {
  it('has a shop accept in partner and hybrid towns, and accepts itself in a dark-store town', () => {
    expect(acceptanceFor('partner')).toBe('by_shop');
    expect(acceptanceFor('hybrid')).toBe('by_shop');
    expect(acceptanceFor('dark')).toBe('automatic');
  });
});

describe('buildOrder', () => {
  it('starts at placed with the customer as the one who did it', () => {
    const order = buildOrder(request());
    expect(order.status).toBe('placed');
    expect(order.events).toEqual([{ status: 'placed', at: NOW.toISOString(), by: 'customer' }]);
    expect(order.placedAt).toBe(NOW.toISOString());
    expect(order.idempotencyKey).toBe('key-aaaaaaaa');
  });

  it('remembers how the order is delivered', () => {
    const slot = {
      kind: 'slot',
      start: '2026-10-10T07:00:00.000Z',
      end: '2026-10-10T08:00:00.000Z',
    } as const;
    expect(buildOrder(request({ delivery: slot })).delivery).toEqual(slot);
    expect(buildOrder(request()).delivery).toEqual({
      kind: 'quick',
      fromMinutes: 25,
      toMinutes: 30,
    });
  });

  it('keeps the total as integer paise and the shops it came from', () => {
    const order = buildOrder(request());
    expect(order.total).toBe(34_100);
    expect(order.shops.map((shop) => shop.name)).toEqual(['Sharma Dairy', 'Patil Vegetables']);
  });

  it('leaves cash to collect and marks UPI as paid', () => {
    expect(buildOrder(request({ method: 'cod' })).payment).toEqual({
      method: 'cod',
      status: 'to_collect',
    });
    expect(buildOrder(request({ method: 'upi' })).payment).toEqual({
      method: 'upi',
      status: 'paid',
    });
  });

  it('takes who accepts from the town mode', () => {
    expect(buildOrder(request({ mode: 'partner' })).acceptance).toBe('by_shop');
    expect(buildOrder(request({ mode: 'dark' })).acceptance).toBe('automatic');
  });
});

describe('placeOnce', () => {
  it('adds a new order at the front, with the plan the clock will follow', () => {
    const first = placeOnce([], request());
    const second = placeOnce(first.orders, request({ key: 'key-bbbbbbbb' }));
    expect(second.created).toBe(true);
    expect(second.orders).toHaveLength(2);
    expect(second.orders[0]?.order.idempotencyKey).toBe('key-bbbbbbbb');
    expect(second.orders[0]).toMatchObject(DEFAULT_PLAN);
  });

  it('gives back the same order for the same key, however often it is asked', () => {
    const first = placeOnce([], request());
    const again = placeOnce(first.orders, request({ id: newUuid(), total: money(1) }));
    expect(again.created).toBe(false);
    expect(again.order).toBe(first.order);
    expect(again.orders).toHaveLength(1);
    const thrice = placeOnce(again.orders, request());
    expect(thrice.orders).toHaveLength(1);
  });

  it('keeps only the newest fifty', () => {
    let orders: TrackedOrder[] = [];
    for (let index = 0; index < 55; index += 1) {
      orders = placeOnce(orders, request({ key: `key-${String(index).padStart(8, '0')}` })).orders;
    }
    expect(orders).toHaveLength(50);
    expect(orders[0]?.order.idempotencyKey).toBe('key-00000054');
  });
});

describe('saving and reading orders back', () => {
  it('gives back what was saved, including a clock that has moved on', () => {
    const placed = placeOnce([], request()).orders;
    const moved = [advance(placed[0] as TrackedOrder, new Date(NOW.getTime() + 25_000))];
    expect(parseOrders(serialiseOrders(moved))).toEqual(moved);
  });

  it('gives back orders that have ended, whichever way they ended', () => {
    for (const ending of ['delivered', 'rejected', 'cancelled', 'undelivered'] as const) {
      for (const method of ['cod', 'upi'] as const) {
        const placed = placeOnce([], request({ method })).orders[0] as TrackedOrder;
        const done = advance({ ...placed, ending }, new Date(NOW.getTime() + 600_000));
        expect(parseOrders(serialiseOrders([done]))).toEqual([done]);
      }
    }
  });

  it('is empty when nothing was saved, or the saving is damaged', () => {
    expect(parseOrders(null)).toEqual([]);
    expect(parseOrders('not json')).toEqual([]);
    expect(parseOrders('{"v":9,"orders":[]}')).toEqual([]);
    expect(parseOrders('null')).toEqual([]);
  });

  it('drops an entry that is not a well-formed order, and keeps the good ones', () => {
    const good = placeOnce([], request()).orders[0] as TrackedOrder;
    const tampered = {
      ...good,
      order: { ...good.order, events: [{ ...good.order.events[0], status: 'delivered' }] },
    };
    const text = JSON.stringify({
      v: 1,
      orders: [tampered, good, { order: good.order, ending: 'sideways', speed: 'fast' }, 7, null],
    });
    expect(parseOrders(text)).toEqual([good]);
  });
});
