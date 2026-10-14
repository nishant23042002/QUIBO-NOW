import { describe, expect, it } from 'vitest';
import { FRESH_LIMIT, FRESH_TABS, UNDER_LIMIT, freshItems } from './fresh';
import type { ItemCategory } from './items';

const item = (
  type: string,
  category: ItemCategory,
  price: number,
  stock?: { kind: 'out' | 'low' },
) => ({ type, category, price, ...(stock !== undefined ? { stock } : {}) });

const SAMPLE = [
  item('milk', 'dairy', 2900),
  item('paneer', 'dairy', 9000, { kind: 'out' }),
  item('tomato', 'vegetables', 2000),
  item('potato', 'vegetables', 3200),
  item('banana', 'fruits', 4200),
  item('popcorn', 'snacks', 2500),
  item('chips', 'snacks', 1800),
];

describe('freshItems', () => {
  it('leaves out what is out of stock, on every tab', () => {
    for (const tab of FRESH_TABS) {
      expect(freshItems(tab.id, SAMPLE).some((entry) => entry.type === 'paneer')).toBe(false);
    }
  });

  it('puts the cheapest first on the under tab, and nothing above the limit', () => {
    const under = freshItems('under', SAMPLE);
    expect(under.map((entry) => entry.type)).toEqual(['chips', 'tomato', 'popcorn', 'milk']);
    expect(under.every((entry) => entry.price <= UNDER_LIMIT)).toBe(true);
  });

  it('holds a category on its own tab', () => {
    expect(freshItems('veg', SAMPLE).map((entry) => entry.type)).toEqual(['tomato', 'potato']);
    expect(freshItems('fruit', SAMPLE).map((entry) => entry.type)).toEqual(['banana']);
    expect(freshItems('dairy', SAMPLE).map((entry) => entry.type)).toEqual(['milk']);
  });

  it('holds the types marked new on the new tab', () => {
    expect(freshItems('new', SAMPLE).map((entry) => entry.type)).toEqual(['popcorn']);
  });

  it('shows no more than the limit', () => {
    const many = Array.from({ length: FRESH_LIMIT + 5 }, (_, index) =>
      item(`kind${index}`, 'vegetables', 1000),
    );
    expect(freshItems('veg', many)).toHaveLength(FRESH_LIMIT);
  });
});
