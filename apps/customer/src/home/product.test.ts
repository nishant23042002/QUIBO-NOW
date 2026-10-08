import { describe, expect, it } from 'vitest';
import { moreFromShop, similarItems } from './product';

const ITEMS = [
  { id: 'milk', shop: 'one', category: 'dairy' },
  { id: 'curd', shop: 'one', category: 'dairy' },
  { id: 'atta', shop: 'two', category: 'staples' },
  { id: 'chips', shop: 'two', category: 'snacks' },
  { id: 'rice', shop: 'two', category: 'staples' },
  { id: 'oil', shop: 'two', category: 'staples' },
];

const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

describe('moreFromShop', () => {
  it('lists the shop’s products in other categories, in their given order', () => {
    expect(ids(moreFromShop(ITEMS, ITEMS[2] as (typeof ITEMS)[number]))).toEqual(['chips']);
    expect(ids(moreFromShop(ITEMS, ITEMS[3] as (typeof ITEMS)[number]))).toEqual([
      'atta',
      'rice',
      'oil',
    ]);
  });

  it('is empty when the shop sells nothing outside the product’s category', () => {
    expect(moreFromShop(ITEMS, ITEMS[0] as (typeof ITEMS)[number])).toEqual([]);
  });

  it('is empty for a shop with no products', () => {
    expect(moreFromShop(ITEMS, { id: 'bread', shop: 'four', category: 'snacks' })).toEqual([]);
  });
});

describe('similarItems', () => {
  it('lists the other products in the same category, from any shop, without the product itself', () => {
    expect(ids(similarItems(ITEMS, ITEMS[0] as (typeof ITEMS)[number]))).toEqual(['curd']);
    expect(ids(similarItems(ITEMS, ITEMS[2] as (typeof ITEMS)[number]))).toEqual(['rice', 'oil']);
  });

  it('is empty when the product is alone in its category', () => {
    expect(similarItems(ITEMS, ITEMS[3] as (typeof ITEMS)[number])).toEqual([]);
  });
});
