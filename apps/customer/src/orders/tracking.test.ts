import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { advance, type Ending } from './machine';
import { samplePlacedOrder } from './sample';
import {
  cashToKeep,
  clockParts,
  endNoteOf,
  endedBy,
  dayRelativeTo,
  etaOf,
  headlineOf,
  isFinished,
  mockShopPhone,
  riderShown,
  shopsCallable,
} from './tracking';

const T0 = Date.parse('2026-10-09T10:00:00.000Z');
const after = (
  acceptance: 'by_shop' | 'automatic',
  seconds: number,
  ending: Ending = 'delivered',
  method: 'cod' | 'upi' = 'cod',
) =>
  advance(
    {
      order: samplePlacedOrder(acceptance, new Date(T0), method),
      ending,
      speed: 'fast',
    },
    new Date(T0 + seconds * 1000),
  ).order;

describe('headlineOf', () => {
  it('follows the order through its states for a shop', () => {
    expect(headlineOf(after('by_shop', 0))).toBe('waitingShop');
    expect(headlineOf(after('by_shop', 8))).toBe('packingShop');
    expect(headlineOf(after('by_shop', 20))).toBe('readyForRider');
    expect(headlineOf(after('by_shop', 30))).toBe('onTheWay');
    expect(headlineOf(after('by_shop', 600))).toBe('delivered');
  });

  it('never says the shop is being waited for on an automatic order', () => {
    expect(headlineOf(after('automatic', 0))).toBe('packingStore');
    expect(headlineOf(after('automatic', 600, 'cancelled'))).toBe('cancelled');
  });

  it('has a line for each way an order can end early', () => {
    expect(headlineOf(after('by_shop', 600, 'rejected'))).toBe('rejected');
    expect(headlineOf(after('by_shop', 600, 'cancelled'))).toBe('cancelled');
    expect(headlineOf(after('by_shop', 600, 'undelivered'))).toBe('undelivered');
  });
});

describe('isFinished', () => {
  it('is true only once the order is over', () => {
    expect(isFinished(after('by_shop', 30))).toBe(false);
    expect(isFinished(after('by_shop', 600))).toBe(true);
    expect(isFinished(after('by_shop', 600, 'rejected'))).toBe(true);
  });
});

describe('what shows when', () => {
  it('shows the rider from the moment the order is packed', () => {
    expect(riderShown(after('by_shop', 8))).toBe(false);
    expect(riderShown(after('by_shop', 20))).toBe(true);
    expect(riderShown(after('by_shop', 600, 'rejected'))).toBe(false);
  });

  it('lets shops be called only where a shop accepts', () => {
    expect(shopsCallable(after('by_shop', 0))).toBe(true);
    expect(shopsCallable(after('automatic', 0))).toBe(false);
  });

  it('asks for cash only while there is cash left to hand over', () => {
    expect(cashToKeep(after('by_shop', 30))).toBe(money(24_900));
    expect(cashToKeep(after('by_shop', 600))).toBeNull();
    expect(cashToKeep(after('by_shop', 600, 'undelivered'))).toBeNull();
    expect(cashToKeep(after('by_shop', 30, 'delivered', 'upi'))).toBeNull();
  });
});

describe('etaOf', () => {
  it('is the range of minutes for a quick order, while it goes', () => {
    expect(etaOf(after('by_shop', 8))).toEqual({ kind: 'range', from: 25, to: 30 });
  });

  it('is nothing once the order is over', () => {
    expect(etaOf(after('by_shop', 600))).toBeNull();
    expect(etaOf(after('by_shop', 600, 'cancelled'))).toBeNull();
  });

  it('is the window for a scheduled order', () => {
    const order = {
      ...samplePlacedOrder(),
      delivery: {
        kind: 'slot' as const,
        start: '2026-10-10T07:00:00.000Z',
        end: '2026-10-10T08:00:00.000Z',
      },
    };
    expect(etaOf(order)).toEqual({
      kind: 'window',
      start: new Date('2026-10-10T07:00:00.000Z'),
      end: new Date('2026-10-10T08:00:00.000Z'),
    });
  });
});

describe('dayRelativeTo', () => {
  const now = new Date(2026, 9, 9, 22, 46);
  it('says today, tomorrow or neither', () => {
    expect(dayRelativeTo(new Date(2026, 9, 9, 7), now)).toBe('today');
    expect(dayRelativeTo(new Date(2026, 9, 10, 7), now)).toBe('tomorrow');
    expect(dayRelativeTo(new Date(2026, 9, 11, 7), now)).toBe('other');
    expect(dayRelativeTo(new Date(2026, 9, 8, 7), now)).toBe('other');
  });
});

describe('clockParts', () => {
  it('uses a 12-hour clock, with noon and midnight as 12', () => {
    expect(clockParts(new Date(2026, 9, 9, 10, 2))).toEqual({
      hour: 10,
      minutes: '02',
      morning: true,
    });
    expect(clockParts(new Date(2026, 9, 9, 12, 30))).toEqual({
      hour: 12,
      minutes: '30',
      morning: false,
    });
    expect(clockParts(new Date(2026, 9, 9, 0, 5))).toEqual({
      hour: 12,
      minutes: '05',
      morning: true,
    });
    expect(clockParts(new Date(2026, 9, 9, 17, 45))).toEqual({
      hour: 5,
      minutes: '45',
      morning: false,
    });
  });
});

describe('mockShopPhone', () => {
  it('is ten digits and different for each shop', () => {
    expect(mockShopPhone(0)).toBe('9876500001');
    expect(mockShopPhone(1)).toBe('9876500002');
    expect(mockShopPhone(0)).toHaveLength(10);
  });
});

describe('endNoteOf', () => {
  it('is nothing while the order is going, and after it arrives', () => {
    expect(endNoteOf(after('by_shop', 30))).toBeNull();
    expect(endNoteOf(after('by_shop', 600))).toBeNull();
  });

  it('says a UPI payment is on its way back, with the amount', () => {
    for (const ending of ['rejected', 'cancelled', 'undelivered'] as const) {
      expect(endNoteOf(after('by_shop', 600, ending, 'upi'))).toEqual({
        kind: 'refund',
        amount: money(24_900),
      });
    }
  });

  it('says nothing was charged for cash', () => {
    expect(endNoteOf(after('by_shop', 600, 'cancelled', 'cod'))).toEqual({ kind: 'nothing' });
  });
});

describe('endedBy', () => {
  it('names who ended an order that did not arrive', () => {
    expect(endedBy(after('by_shop', 600, 'rejected'))).toBe('shop');
    expect(endedBy(after('by_shop', 600, 'undelivered'))).toBe('rider');
    expect(endedBy(after('by_shop', 600, 'cancelled'))).toBe('ops');
    expect(endedBy(after('by_shop', 600))).toBeNull();
  });
});
