import { describe, expect, it } from 'vitest';
import { AGAIN_MOST, againItems, againPackIds, type AgainOrder } from './againRules';

const order = (status: string, ...packIds: string[]): AgainOrder => ({
  status,
  items: packIds.map((packId) => ({ packId })),
});

describe('againPackIds, last order', () => {
  it('is what was in the newest order that happened, in its order', () => {
    const orders = [order('delivered', 'milk:500ml', 'eggs:6'), order('delivered', 'atta:1kg')];
    expect(againPackIds(orders, 'last')).toEqual(['milk:500ml', 'eggs:6']);
  });

  it('skips an order that was cancelled, rejected or not delivered', () => {
    const orders = [
      order('cancelled', 'chips:1'),
      order('rejected', 'curd:400g'),
      order('undelivered', 'rice:1kg'),
      order('delivered', 'milk:500ml'),
    ];
    expect(againPackIds(orders, 'last')).toEqual(['milk:500ml']);
  });

  it('counts an order that is still on its way', () => {
    expect(againPackIds([order('accepted', 'milk:500ml')], 'last')).toEqual(['milk:500ml']);
  });

  it('is empty with no orders', () => {
    expect(againPackIds([], 'last')).toEqual([]);
    expect(againPackIds([order('cancelled', 'milk:500ml')], 'last')).toEqual([]);
  });

  it('lists a pack once even when it is in the order twice', () => {
    expect(againPackIds([order('delivered', 'milk:500ml', 'milk:500ml')], 'last')).toEqual([
      'milk:500ml',
    ]);
  });
});

describe('againPackIds, most ordered', () => {
  it('puts what is in the most orders first', () => {
    const orders = [
      order('delivered', 'eggs:6', 'milk:500ml'),
      order('delivered', 'milk:500ml', 'atta:1kg'),
      order('delivered', 'milk:500ml', 'atta:1kg'),
    ];
    expect(againPackIds(orders, 'most')).toEqual(['milk:500ml', 'atta:1kg', 'eggs:6']);
  });

  it('gives a tie to what was in the more recent order', () => {
    const orders = [order('delivered', 'newer:1'), order('delivered', 'older:1')];
    expect(againPackIds(orders, 'most')).toEqual(['newer:1', 'older:1']);
  });

  it('shows no more than the most', () => {
    const many = [order('delivered', ...Array.from({ length: AGAIN_MOST + 4 }, (_, i) => `p${i}`))];
    expect(againPackIds(many, 'most')).toHaveLength(AGAIN_MOST);
    expect(againPackIds(many, 'last')).toHaveLength(AGAIN_MOST);
  });
});

describe('againItems', () => {
  const catalogue = [
    { id: 'milk', packs: [{ id: 'milk:500ml' }, { id: 'milk:1l' }] },
    { id: 'eggs', packs: [{ id: 'eggs:6' }] },
  ];

  it('finds the item a pack belongs to, once each, in order', () => {
    expect(againItems(['milk:1l', 'eggs:6', 'milk:500ml'], catalogue).map((i) => i.id)).toEqual([
      'milk',
      'eggs',
    ]);
  });

  it('leaves out a pack the catalogue no longer lists', () => {
    expect(againItems(['gone:1', 'eggs:6'], catalogue).map((i) => i.id)).toEqual(['eggs']);
  });
});
