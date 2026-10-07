import { describe, expect, it } from 'vitest';
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  OrderStatusSchema,
  type OrderStatus,
} from './order-status';

const next = (from: OrderStatus): readonly OrderStatus[] => ORDER_TRANSITIONS[from];

describe('OrderStatus (STUB, see order-status.ts)', () => {
  it('has the five states and three exits', () => {
    expect([...ORDER_STATUSES]).toEqual([
      'placed',
      'accepted',
      'ready',
      'picked_up',
      'delivered',
      'rejected',
      'cancelled',
      'undelivered',
    ]);
  });

  it.each(ORDER_STATUSES)('accepts %s', (status) => {
    expect(OrderStatusSchema.safeParse(status).success).toBe(true);
  });

  it.each(['Delivered', 'DELIVERED', 'shipped', 'picked up', '', null, undefined, 3])(
    'rejects %j',
    (bad) => {
      expect(OrderStatusSchema.safeParse(bad).success).toBe(false);
    },
  );
});

describe('ORDER_TRANSITIONS', () => {
  it('has an entry for every status and nothing else', () => {
    expect(Object.keys(ORDER_TRANSITIONS).sort()).toEqual([...ORDER_STATUSES].sort());
  });

  it.each(ORDER_STATUSES)('%s only leads to valid statuses, without repeats or self-loops', (s) => {
    const targets = next(s);
    for (const target of targets) {
      expect(OrderStatusSchema.safeParse(target).success).toBe(true);
      expect(target).not.toBe(s);
    }
    expect(new Set(targets).size).toBe(targets.length);
  });

  it('ends in exactly the four final statuses', () => {
    const final = ORDER_STATUSES.filter((s) => next(s).length === 0);
    expect(final).toEqual(['delivered', 'rejected', 'cancelled', 'undelivered']);
  });

  it('allows the whole happy path in order', () => {
    const path: OrderStatus[] = ['placed', 'accepted', 'ready', 'picked_up', 'delivered'];
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i] as OrderStatus;
      const to = path[i + 1] as OrderStatus;
      expect(next(from)).toContain(to);
    }
  });

  it('cannot reach Delivered before Picked up, or skip a step', () => {
    expect(next('placed')).not.toContain('delivered');
    expect(next('accepted')).not.toContain('delivered');
    expect(next('ready')).not.toContain('delivered');
    expect(next('placed')).not.toContain('ready');
    expect(next('accepted')).not.toContain('picked_up');
  });

  it('never leaves a final status', () => {
    for (const final of ['delivered', 'rejected', 'cancelled', 'undelivered'] as const) {
      expect(next(final)).toEqual([]);
    }
  });

  it('lets every status be reached from placed', () => {
    const seen = new Set<OrderStatus>(['placed']);
    const queue: OrderStatus[] = ['placed'];
    for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
      for (const target of next(current)) {
        if (!seen.has(target)) {
          seen.add(target);
          queue.push(target);
        }
      }
    }
    expect([...seen].sort()).toEqual([...ORDER_STATUSES].sort());
  });

  it('has no cycles, so an order can never move backwards', () => {
    const visiting = new Set<OrderStatus>();
    const done = new Set<OrderStatus>();
    const visit = (status: OrderStatus): void => {
      expect(visiting.has(status), `cycle through ${status}`).toBe(false);
      if (done.has(status)) return;
      visiting.add(status);
      for (const target of next(status)) visit(target);
      visiting.delete(status);
      done.add(status);
    };
    for (const status of ORDER_STATUSES) visit(status);
  });
});
