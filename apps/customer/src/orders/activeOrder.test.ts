import type { Order } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { activeOrder } from './activeOrder';
import { transition, type TrackedOrder } from './machine';
import { samplePlacedOrder } from './sample';

const track = (order: Order): TrackedOrder => ({ order, ending: 'delivered', speed: 'fast' });
const at = (seconds: number) => new Date(Date.parse('2026-10-09T10:00:00.000Z') + seconds * 1000);

describe('activeOrder', () => {
  it('is nothing when there are no orders', () => {
    expect(activeOrder([])).toBeUndefined();
  });

  it('is the order that is still going', () => {
    const going = track(samplePlacedOrder());
    expect(activeOrder([going])).toBe(going);
  });

  it('skips an order that has ended and finds an older one that has not', () => {
    const placed = samplePlacedOrder();
    const cancelled = track(transition(placed, 'cancelled', at(5), 'customer'));
    const going = track(placed);
    expect(activeOrder([cancelled, going])).toBe(going);
  });

  it('is nothing when every order is over', () => {
    const cancelled = track(transition(samplePlacedOrder(), 'cancelled', at(5), 'customer'));
    expect(activeOrder([cancelled])).toBeUndefined();
  });
});
