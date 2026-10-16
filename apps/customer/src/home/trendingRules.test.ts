import { describe, expect, it } from 'vitest';
import {
  TRENDING_MOST,
  TRENDING_UNDER,
  TRENDING_TABS,
  inTwoRows,
  trendingItems,
} from './trendingRules';

const item = (
  id: string,
  price: number,
  extra: { mrp?: number; nonveg?: true; out?: true } = {},
) => ({
  id,
  price,
  ...(extra.mrp !== undefined ? { mrp: extra.mrp } : {}),
  diet: { kind: extra.nonveg === true ? ('nonveg' as const) : ('veg' as const) },
  ...(extra.out === true ? { stock: { kind: 'out' as const } } : {}),
});

const shelf = [
  item('milk', 2900, { mrp: 3000 }),
  item('eggs', 4800, { nonveg: true }),
  item('atta', 5200, { mrp: 5600 }),
  item('ghee', 62000),
  item('out', 1000, { out: true }),
];

const ids = (list: readonly { id: string }[]) => list.map((entry) => entry.id);

describe('trendingItems', () => {
  it('lists everything in stock on "all", in the order given', () => {
    expect(ids(trendingItems('all', shelf))).toEqual(['milk', 'eggs', 'atta', 'ghee']);
  });

  it('keeps only what costs less than its printed price on "offers"', () => {
    expect(ids(trendingItems('offers', shelf))).toEqual(['milk', 'atta']);
  });

  it('keeps what costs no more than the under price on "under"', () => {
    expect(TRENDING_UNDER).toBe(5000);
    expect(ids(trendingItems('under', shelf))).toEqual(['milk', 'eggs']);
  });

  it('keeps the vegetarian items on "veg"', () => {
    expect(ids(trendingItems('veg', shelf))).toEqual(['milk', 'atta', 'ghee']);
  });

  it('shows no more than the most', () => {
    const many = Array.from({ length: TRENDING_MOST + 5 }, (_, i) => item(`p${i}`, 100));
    expect(trendingItems('all', many)).toHaveLength(TRENDING_MOST);
  });

  it('has four tabs, starting with all', () => {
    expect(TRENDING_TABS).toHaveLength(4);
    expect(TRENDING_TABS[0]).toBe('all');
  });
});

describe('inTwoRows', () => {
  it('deals the items one after the other, so each row keeps their order', () => {
    expect(inTwoRows([1, 2, 3, 4, 5])).toEqual([
      [1, 3, 5],
      [2, 4],
    ]);
  });

  it('leaves the second row empty for one item, and both empty for none', () => {
    expect(inTwoRows([1])).toEqual([[1], []]);
    expect(inTwoRows([])).toEqual([[], []]);
  });
});
