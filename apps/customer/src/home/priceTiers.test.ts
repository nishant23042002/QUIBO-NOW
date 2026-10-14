import { describe, expect, it } from 'vitest';
import { MOST_SHOWN, PRICE_TIERS, pickUnder, priceBand } from './priceTiers';

const item = (id: string, price: number, out = false) => ({
  id,
  price,
  ...(out ? { stock: { kind: 'out' as const } } : {}),
});

describe('the price tiers', () => {
  it('are whole paise, lowest first and all different', () => {
    expect([...PRICE_TIERS].sort((a, b) => a - b)).toEqual([...PRICE_TIERS]);
    expect(new Set(PRICE_TIERS).size).toBe(PRICE_TIERS.length);
    for (const tier of PRICE_TIERS) expect(Number.isInteger(tier)).toBe(true);
  });
});

describe('pickUnder', () => {
  const items = [
    item('a', 4500),
    item('b', 1000),
    item('c', 2900),
    item('d', 9000),
    item('e', 3000),
  ];

  it('keeps what costs no more than the limit, cheapest first', () => {
    expect(pickUnder(items, 3000).map((i) => i.id)).toEqual(['b', 'c', 'e']);
  });

  it('includes an item that costs exactly the limit', () => {
    expect(pickUnder(items, 4500).map((i) => i.id)).toContain('a');
  });

  it('leaves out what is out of stock', () => {
    expect(pickUnder([item('x', 500, true), item('y', 800)], 3000).map((i) => i.id)).toEqual(['y']);
  });

  it('keeps the order of items that cost the same', () => {
    const same = [item('p', 2000), item('q', 2000), item('r', 1500)];
    expect(pickUnder(same, 3000).map((i) => i.id)).toEqual(['r', 'p', 'q']);
  });

  it('shows no more than the most, and says nothing when none fit', () => {
    const many = Array.from({ length: MOST_SHOWN + 5 }, (_, i) => item(`m${i}`, 100 + i));
    expect(pickUnder(many, 10000)).toHaveLength(MOST_SHOWN);
    expect(pickUnder(items, 500)).toEqual([]);
  });

  it('keeps only the chosen category, still cheapest first', () => {
    const mixed = [
      { id: 'milk', price: 2800, category: 'dairy' },
      { id: 'chips', price: 1000, category: 'snacks' },
      { id: 'curd', price: 1500, category: 'dairy' },
    ];
    expect(pickUnder(mixed, 3000, { category: 'dairy' }).map((i) => i.id)).toEqual([
      'curd',
      'milk',
    ]);
    expect(pickUnder(mixed, 3000).map((i) => i.id)).toEqual(['chips', 'curd', 'milk']);
    expect(pickUnder(mixed, 3000, { category: 'fruits' })).toEqual([]);
  });

  it('keeps only what is above the band below, so the bands do not overlap', () => {
    const priced = [
      { id: 'a', price: 2000 },
      { id: 'b', price: 3000 },
      { id: 'c', price: 3001 },
      { id: 'd', price: 5000 },
      { id: 'e', price: 5001 },
      { id: 'f', price: 10000 },
    ];
    const ids = (index: number) => {
      const band = priceBand(index);
      return pickUnder(priced, band.upTo, { above: band.above }).map((i) => i.id);
    };
    expect(ids(0)).toEqual(['a', 'b']);
    expect(ids(1)).toEqual(['c', 'd']);
    expect(ids(2)).toEqual(['e', 'f']);
  });

  it('does not change the list it is given', () => {
    const before = items.map((i) => i.id);
    pickUnder(items, 9000);
    expect(items.map((i) => i.id)).toEqual(before);
  });
});
