import { describe, expect, it } from 'vitest';
import { advance, type Ending } from './machine';
import { samplePlacedOrder } from './sample';
import { exitOf, shopParts, timelineOf } from './timeline';

const T0 = Date.parse('2026-10-09T10:00:00.000Z');
const at = (seconds: number) => new Date(T0 + seconds * 1000);

function after(acceptance: 'by_shop' | 'automatic', seconds: number, ending: Ending = 'delivered') {
  return advance({ order: samplePlacedOrder(acceptance), ending, speed: 'fast' }, at(seconds))
    .order;
}

const shape = (order: ReturnType<typeof after>) =>
  timelineOf(order).map((step) => `${step.status}:${step.state}`);

describe('timelineOf', () => {
  it('shows five steps for a shop order, the first done and the next in progress', () => {
    expect(shape(after('by_shop', 0))).toEqual([
      'placed:done',
      'accepted:current',
      'ready:upcoming',
      'picked_up:upcoming',
      'delivered:upcoming',
    ]);
  });

  it('shows four steps for an automatic order, with no step for a shop saying yes', () => {
    expect(shape(after('automatic', 0))).toEqual([
      'placed:done',
      'ready:current',
      'picked_up:upcoming',
      'delivered:upcoming',
    ]);
  });

  it('has the same steps in both modes once the order is on its way, bar the missing one', () => {
    const shop = shape(after('by_shop', 35)).filter((step) => !step.startsWith('accepted'));
    expect(shop).toEqual(shape(after('automatic', 35)));
  });

  it('marks everything done when the order has arrived', () => {
    expect(timelineOf(after('by_shop', 600)).every((step) => step.state === 'done')).toBe(true);
  });

  it('carries the time each step was reached', () => {
    const steps = timelineOf(after('by_shop', 20));
    expect(steps.map((step) => step.at)).toEqual([
      at(0).toISOString(),
      at(8).toISOString(),
      at(20).toISOString(),
      null,
      null,
    ]);
  });

  it('stops at the exit and shows nothing after it', () => {
    expect(shape(after('by_shop', 600, 'rejected'))).toEqual(['placed:done', 'rejected:stopped']);
    expect(shape(after('by_shop', 600, 'cancelled'))).toEqual([
      'placed:done',
      'accepted:done',
      'cancelled:stopped',
    ]);
    expect(shape(after('by_shop', 600, 'undelivered'))).toEqual([
      'placed:done',
      'accepted:done',
      'ready:done',
      'picked_up:done',
      'undelivered:stopped',
    ]);
  });

  it('does not show a hidden accepted step even on an automatic order that was cancelled', () => {
    expect(shape(after('automatic', 600, 'cancelled'))).toEqual([
      'placed:done',
      'cancelled:stopped',
    ]);
  });
});

describe('exitOf', () => {
  it('is null while going and after arriving, and the exit otherwise', () => {
    expect(exitOf(after('by_shop', 0))).toBeNull();
    expect(exitOf(after('by_shop', 600))).toBeNull();
    expect(exitOf(after('by_shop', 600, 'rejected'))).toBe('rejected');
    expect(exitOf(after('by_shop', 600, 'undelivered'))).toBe('undelivered');
  });
});

describe('shopParts', () => {
  it('gives every shop in the order the same part, because one rider takes it all (ADR 0009)', () => {
    const parts = shopParts(after('by_shop', 20));
    expect(parts.map((part) => part.name)).toEqual(['Sharma Dairy', 'Gupta Vegetables']);
    expect(new Set(parts.map((part) => part.part)).size).toBe(1);
  });

  it('goes waiting, packing, packed, picked up', () => {
    expect(shopParts(after('by_shop', 0))[0]?.part).toBe('waiting');
    expect(shopParts(after('by_shop', 8))[0]?.part).toBe('packing');
    expect(shopParts(after('by_shop', 20))[0]?.part).toBe('packed');
    expect(shopParts(after('by_shop', 30))[0]?.part).toBe('picked_up');
    expect(shopParts(after('by_shop', 600))[0]?.part).toBe('picked_up');
  });

  it('keeps how far the shops got when the order ended early', () => {
    expect(shopParts(after('by_shop', 600, 'rejected'))[0]?.part).toBe('waiting');
    expect(shopParts(after('by_shop', 600, 'cancelled'))[0]?.part).toBe('packing');
    expect(shopParts(after('by_shop', 600, 'undelivered'))[0]?.part).toBe('picked_up');
  });
});
