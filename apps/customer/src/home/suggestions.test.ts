import { describe, expect, it } from 'vitest';
import { suggestItems, type Suggestable } from './suggestions';

const item = (id: string, category: string, soldOut = false): Suggestable => ({
  id,
  category,
  soldOut,
});

const catalogue = [
  item('milk', 'dairy'),
  item('curd', 'dairy'),
  item('eggs', 'dairy'),
  item('tomato', 'vegetables'),
  item('potato', 'vegetables'),
  item('banana', 'fruits'),
  item('oil', 'staples'),
  item('sugar', 'staples'),
  item('biscuits', 'snacks'),
  item('chips', 'snacks'),
];

describe('suggestItems', () => {
  it('puts what goes with the cart first, the likeliest partner of each item leading', () => {
    const out = suggestItems([{ id: 'milk', category: 'dairy' }], catalogue, 4);
    // Biscuits is milk's likeliest partner, so it leads, even though eggs shares milk's category.
    expect(out[0]).toBe('biscuits');
    expect(out).toEqual(expect.arrayContaining(['biscuits', 'sugar', 'banana', 'eggs']));
  });

  it('never suggests what is already in the cart, or what is out of stock', () => {
    const stock = catalogue.map((entry) =>
      entry.id === 'sugar' ? { ...entry, soldOut: true } : entry,
    );
    const out = suggestItems(
      [
        { id: 'milk', category: 'dairy' },
        { id: 'biscuits', category: 'snacks' },
      ],
      stock,
      10,
    );
    expect(out).not.toContain('milk');
    expect(out).not.toContain('biscuits');
    expect(out).not.toContain('sugar');
  });

  it('scores an item higher for each cart item it goes with', () => {
    // Potato goes with tomato, and oil goes with both tomato and potato: oil comes before the others.
    const out = suggestItems(
      [
        { id: 'tomato', category: 'vegetables' },
        { id: 'potato', category: 'vegetables' },
      ],
      catalogue,
      3,
    );
    expect(out[0]).toBe('oil');
  });

  it('fills the row with other things when too few go with the cart, and stops at the limit', () => {
    const out = suggestItems([{ id: 'chips', category: 'snacks' }], catalogue, 6);
    expect(out).toHaveLength(6);
    expect(new Set(out).size).toBe(6);
  });

  it('suggests nothing when everything is already in the cart', () => {
    expect(
      suggestItems(
        catalogue.map((entry) => ({ id: entry.id, category: entry.category })),
        catalogue,
      ),
    ).toEqual([]);
  });
});
