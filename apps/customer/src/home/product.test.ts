import { describe, expect, it } from 'vitest';
import { otherItemsInShop } from './product';

const ITEMS = [
  { id: 'milk', shop: 'one' },
  { id: 'curd', shop: 'one' },
  { id: 'atta', shop: 'two' },
  { id: 'paneer', shop: 'one' },
];

describe('otherItemsInShop', () => {
  it('lists the shop’s other items in their given order, without the item itself', () => {
    expect(otherItemsInShop(ITEMS, { id: 'milk', shop: 'one' }).map((i) => i.id)).toEqual([
      'curd',
      'paneer',
    ]);
  });

  it('is empty when the item is the only one in its shop', () => {
    expect(otherItemsInShop(ITEMS, { id: 'atta', shop: 'two' })).toEqual([]);
  });

  it('is empty for a shop with no items', () => {
    expect(otherItemsInShop(ITEMS, { id: 'bread', shop: 'four' })).toEqual([]);
  });
});
