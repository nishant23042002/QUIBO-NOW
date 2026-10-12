import { describe, expect, it } from 'vitest';
import {
  activeBrand,
  brandsOfItems,
  filterByBrand,
  itemsOfBrand,
  kindsOfBrand,
  shopsOfBrand,
} from './brandPage';

const ITEMS = [
  {
    id: 'milk',
    type: 'milk',
    name: 'Toned milk',
    shop: 'one',
    otherShops: 2,
    brand: { id: 'amul' },
  },
  { id: 'curd', type: 'curd', name: 'Fresh curd', shop: 'one', brand: { id: 'gokul' } },
  { id: 'paneer', type: 'paneer', name: 'Paneer', shop: 'one', brand: { id: 'amul' } },
  { id: 'curdAmul', type: 'curd', name: 'Masti dahi', shop: 'one', brand: { id: 'amul' } },
  { id: 'eggs', type: 'eggs', name: 'Farm eggs', shop: 'one' },
  {
    id: 'atta',
    type: 'atta',
    name: 'Wheat atta',
    shop: 'two',
    otherShops: 1,
    brand: { id: 'ashirvaad' },
  },
];

describe('itemsOfBrand', () => {
  it('lists the brand’s items in their given order', () => {
    expect(itemsOfBrand(ITEMS, 'amul').map((item) => item.id)).toEqual([
      'milk',
      'paneer',
      'curdAmul',
    ]);
  });

  it('is empty for an unknown brand, and never includes an item with no brand', () => {
    expect(itemsOfBrand(ITEMS, 'nobody')).toEqual([]);
    expect(itemsOfBrand(ITEMS, 'amul').some((item) => item.id === 'eggs')).toBe(false);
  });
});

describe('kindsOfBrand', () => {
  it('lists each kind once, in the order it first appears, named by its first item', () => {
    expect(kindsOfBrand(itemsOfBrand(ITEMS, 'amul'))).toEqual([
      { type: 'milk', name: 'Toned milk', count: 1 },
      { type: 'paneer', name: 'Paneer', count: 1 },
      { type: 'curd', name: 'Masti dahi', count: 1 },
    ]);
  });

  it('counts the items of a kind', () => {
    const two = [
      { type: 'milk', name: 'Toned milk' },
      { type: 'milk', name: 'Full cream milk' },
    ];
    expect(kindsOfBrand(two)).toEqual([{ type: 'milk', name: 'Toned milk', count: 2 }]);
  });

  it('is empty for no items', () => {
    expect(kindsOfBrand([])).toEqual([]);
  });
});

describe('shopsOfBrand', () => {
  it('counts the shops of its items and the most others any item says also stock it', () => {
    expect(shopsOfBrand(itemsOfBrand(ITEMS, 'amul'))).toBe(3);
    expect(shopsOfBrand(itemsOfBrand(ITEMS, 'gokul'))).toBe(1);
    expect(shopsOfBrand(itemsOfBrand(ITEMS, 'ashirvaad'))).toBe(2);
  });

  it('is 0 when there are no items', () => {
    expect(shopsOfBrand([])).toBe(0);
  });
});

describe('brandsOfItems', () => {
  const branded = [
    { id: 'a', brand: { id: 'amul', name: 'Amul', mark: 'A' } },
    { id: 'b' },
    { id: 'c', brand: { id: 'gokul', name: 'Gokul', mark: 'G' } },
    { id: 'd', brand: { id: 'amul', name: 'Amul', mark: 'A' } },
  ];

  it('lists each brand once, in the order it first appears, with its count', () => {
    expect(brandsOfItems(branded)).toEqual([
      { id: 'amul', name: 'Amul', mark: 'A', count: 2 },
      { id: 'gokul', name: 'Gokul', mark: 'G', count: 1 },
    ]);
  });

  it('is empty when no item has a brand', () => {
    expect(brandsOfItems([{}, {}])).toEqual([]);
    expect(brandsOfItems([])).toEqual([]);
  });
});

describe('filterByBrand', () => {
  const list = [
    { id: 'a', brand: { id: 'amul' } },
    { id: 'b' },
    { id: 'c', brand: { id: 'gokul' } },
  ];

  it('keeps everything, including items with no brand, when no brand is chosen', () => {
    expect(filterByBrand(list, null).map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps only that brand’s items when one is chosen', () => {
    expect(filterByBrand(list, 'amul').map((item) => item.id)).toEqual(['a']);
    expect(filterByBrand(list, 'nobody')).toEqual([]);
  });
});

describe('activeBrand', () => {
  it('is the chosen brand while it is on offer', () => {
    expect(activeBrand('amul', [{ id: 'amul' }, { id: 'gokul' }])).toBe('amul');
  });

  it('falls back to all when it is not on offer any more, or none was chosen', () => {
    expect(activeBrand('amul', [{ id: 'gokul' }])).toBeNull();
    expect(activeBrand(null, [{ id: 'gokul' }])).toBeNull();
  });
});
