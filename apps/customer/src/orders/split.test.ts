import { describe, expect, it } from 'vitest';
import { advance, type Ending, type TrackedOrder } from './machine';
import { samplePlacedOrder } from './sample';
import { lastEventAt, splitOrders, thumbRow } from './split';

const T0 = new Date('2026-10-09T10:00:00.000Z');
const made = (seconds: number, ending: Ending = 'delivered'): TrackedOrder =>
  advance(
    { order: samplePlacedOrder('by_shop', T0), ending, speed: 'fast' },
    new Date(T0.getTime() + seconds * 1000),
  );

describe('splitOrders', () => {
  it('puts orders still moving in one list and finished ones in the other', () => {
    const going = made(10);
    const arrived = made(600);
    const cancelled = made(600, 'cancelled');
    const { active, past } = splitOrders([going, arrived, cancelled]);
    expect(active).toEqual([going]);
    expect(past).toEqual([arrived, cancelled]);
  });

  it('keeps the order it was given', () => {
    const a = made(600);
    const b = made(600, 'rejected');
    expect(splitOrders([a, b]).past).toEqual([a, b]);
  });

  it('is empty on both sides for no orders', () => {
    expect(splitOrders([])).toEqual({ active: [], past: [] });
  });
});

describe('lastEventAt', () => {
  it('is when the order was placed while nothing else has happened', () => {
    expect(lastEventAt(made(0).order)).toEqual(T0);
  });

  it('is when it arrived once it has', () => {
    expect(lastEventAt(made(600).order)).toEqual(new Date(T0.getTime() + 45_000));
  });
});

describe('thumbRow', () => {
  it('shows what fits and counts the rest', () => {
    expect(thumbRow([1, 2, 3, 4, 5, 6], 4)).toEqual({ shown: [1, 2, 3, 4], more: 2 });
  });

  it('has no rest when everything fits', () => {
    expect(thumbRow([1, 2], 4)).toEqual({ shown: [1, 2], more: 0 });
    expect(thumbRow([], 4)).toEqual({ shown: [], more: 0 });
  });
});
