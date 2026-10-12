import { describe, expect, it } from 'vitest';
import {
  brandsInCategory,
  cheaperPerUnit,
  oneOfEachKind,
  otherBrands,
  similarItems,
  startingPackId,
} from './product';

const ITEMS = [
  { id: 'milk', shop: 'one', category: 'dairy' },
  { id: 'curd', shop: 'one', category: 'dairy' },
  { id: 'atta', shop: 'two', category: 'staples' },
  { id: 'chips', shop: 'two', category: 'snacks' },
  { id: 'rice', shop: 'two', category: 'staples' },
  { id: 'oil', shop: 'two', category: 'staples' },
];

const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

describe('similarItems', () => {
  it('lists the other products in the same category, from any shop, without the product itself', () => {
    expect(ids(similarItems(ITEMS, ITEMS[0] as (typeof ITEMS)[number]))).toEqual(['curd']);
    expect(ids(similarItems(ITEMS, ITEMS[2] as (typeof ITEMS)[number]))).toEqual(['rice', 'oil']);
  });

  it('is empty when the product is alone in its category', () => {
    expect(similarItems(ITEMS, ITEMS[3] as (typeof ITEMS)[number])).toEqual([]);
  });
});

const BRANDED = [
  { id: 'milk', type: 'milk', category: 'dairy', brand: { id: 'amul', name: 'Amul', mark: 'A' } },
  {
    id: 'milkGokul',
    type: 'milk',
    category: 'dairy',
    brand: { id: 'gokul', name: 'Gokul', mark: 'G' },
  },
  {
    id: 'milkChitale',
    type: 'milk',
    category: 'dairy',
    brand: { id: 'chitale', name: 'Chitale', mark: 'C' },
  },
  {
    id: 'paneer',
    type: 'paneer',
    category: 'dairy',
    brand: { id: 'amul', name: 'Amul', mark: 'A' },
  },
  { id: 'eggs', type: 'eggs', category: 'dairy' },
  { id: 'tomato', type: 'tomato', category: 'vegetables' },
];

describe('otherBrands', () => {
  it('lists the same kind of product from other brands, in their given order', () => {
    expect(ids(otherBrands(BRANDED, BRANDED[0] as (typeof BRANDED)[number]))).toEqual([
      'milkGokul',
      'milkChitale',
    ]);
    expect(ids(otherBrands(BRANDED, BRANDED[1] as (typeof BRANDED)[number]))).toEqual([
      'milk',
      'milkChitale',
    ]);
  });

  it('is empty for an item with no brand, whatever else shares its type', () => {
    expect(otherBrands(BRANDED, BRANDED[4] as (typeof BRANDED)[number])).toEqual([]);
    expect(otherBrands(BRANDED, BRANDED[5] as (typeof BRANDED)[number])).toEqual([]);
  });

  it('is empty when no other brand makes the same kind of product', () => {
    expect(otherBrands(BRANDED, BRANDED[3] as (typeof BRANDED)[number])).toEqual([]);
  });

  it('never lists another product of the item’s own brand', () => {
    const same = [
      { id: 'a', type: 'milk', brand: { id: 'amul' } },
      { id: 'b', type: 'milk', brand: { id: 'amul' } },
    ];
    expect(otherBrands(same, same[0] as (typeof same)[number])).toEqual([]);
  });
});

describe('brandsInCategory', () => {
  it('lists each brand once, in the order it first appears, with how many items it has', () => {
    expect(brandsInCategory(BRANDED, 'dairy')).toEqual([
      { id: 'amul', name: 'Amul', mark: 'A', count: 2 },
      { id: 'gokul', name: 'Gokul', mark: 'G', count: 1 },
      { id: 'chitale', name: 'Chitale', mark: 'C', count: 1 },
    ]);
  });

  it('is empty for a category with no branded items', () => {
    expect(brandsInCategory(BRANDED, 'vegetables')).toEqual([]);
    expect(brandsInCategory(BRANDED, 'snacks')).toEqual([]);
  });
});

describe('cheaperPerUnit', () => {
  it('is true only when it is lower and per the same kind of unit', () => {
    expect(cheaperPerUnit({ kind: 'l', paise: 5400 }, { kind: 'l', paise: 5800 })).toBe(true);
    expect(cheaperPerUnit({ kind: 'l', paise: 5800 }, { kind: 'l', paise: 5800 })).toBe(false);
    expect(cheaperPerUnit({ kind: 'l', paise: 6000 }, { kind: 'l', paise: 5800 })).toBe(false);
    expect(cheaperPerUnit({ kind: 'kg', paise: 100 }, { kind: 'l', paise: 5800 })).toBe(false);
  });

  it('is false when either price per unit is unknown', () => {
    expect(cheaperPerUnit(undefined, { kind: 'l', paise: 5800 })).toBe(false);
    expect(cheaperPerUnit({ kind: 'l', paise: 5400 }, undefined)).toBe(false);
  });
});

describe('startingPackId', () => {
  const item = {
    defaultPackId: 'milk:500ml',
    packs: [
      { id: 'milk:500ml', bestValue: false, available: true },
      { id: 'milk:1l', bestValue: true, available: true },
    ],
  };

  it('is the best-value size when the trial is on', () => {
    expect(startingPackId(item, true)).toBe('milk:1l');
  });

  it('is the size the card showed when the trial is off', () => {
    expect(startingPackId(item, false)).toBe('milk:500ml');
  });

  it('is the size the card showed when the best-value size cannot be bought, or there is none', () => {
    const out = { ...item, packs: [item.packs[0], { ...item.packs[1], available: false }] };
    expect(startingPackId(out as typeof item, true)).toBe('milk:500ml');
    const none = { ...item, packs: [{ ...item.packs[0] }, { ...item.packs[1], bestValue: false }] };
    expect(startingPackId(none as typeof item, true)).toBe('milk:500ml');
  });
});

describe('oneOfEachKind', () => {
  const item = (id: string, type: string, out = false) => ({
    id,
    type,
    ...(out ? { stock: { kind: 'out' as const } } : {}),
  });

  it('shows a kind once, as the first one listed', () => {
    const listed = [item('milk', 'milk'), item('curd', 'curd'), item('milkGokul', 'milk')];
    expect(oneOfEachKind(listed).map((entry) => entry.id)).toEqual(['milk', 'curd']);
  });

  it('shows the first that is in stock when the first is sold out', () => {
    const listed = [
      item('milk', 'milk', true),
      item('milkGokul', 'milk'),
      item('milkChitale', 'milk'),
    ];
    expect(oneOfEachKind(listed).map((entry) => entry.id)).toEqual(['milkGokul']);
  });

  it('keeps the first listed when every brand of a kind is sold out', () => {
    const listed = [item('milk', 'milk', true), item('milkGokul', 'milk', true)];
    expect(oneOfEachKind(listed).map((entry) => entry.id)).toEqual(['milk']);
  });

  it('leaves single items alone and keeps the order of first appearance', () => {
    const listed = [item('a', 'a'), item('b', 'b'), item('a2', 'a'), item('c', 'c')];
    expect(oneOfEachKind(listed).map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
  });

  it('is empty for nothing', () => {
    expect(oneOfEachKind([])).toEqual([]);
  });
});
