import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { summariseCart, type CartEntry } from './cartMath';

const entry = (over: Partial<CartEntry> & Pick<CartEntry, 'packId' | 'quantity'>): CartEntry => ({
  productId: 'milk',
  shopId: 'one',
  shopName: 'Sharma Dairy',
  price: money(2900),
  ...over,
});

describe('summariseCart', () => {
  it('is empty for an empty cart, and leaves out lines with nothing in them', () => {
    expect(summariseCart([]).count).toBe(0);
    expect(summariseCart([entry({ packId: 'milk:500ml', quantity: 0 })]).baskets).toEqual([]);
  });

  it('keeps two sizes of one product as two lines with their own prices', () => {
    const sum = summariseCart([
      entry({ packId: 'milk:500ml', quantity: 2, price: money(2900), mrp: money(3000) }),
      entry({ packId: 'milk:1l', quantity: 1, price: money(5600), mrp: money(5800) }),
    ]);
    expect(sum.count).toBe(3);
    expect(sum.total).toBe(money(2 * 2900 + 5600));
    expect(sum.saved).toBe(money(2 * 100 + 200));
    expect(sum.baskets).toHaveLength(1);
    expect(sum.baskets[0]?.lines.map((line) => line.entry.packId)).toEqual([
      'milk:500ml',
      'milk:1l',
    ]);
    expect(sum.baskets[0]?.lines.map((line) => line.lineTotal)).toEqual([money(5800), money(5600)]);
  });

  it('counts a loose item as one item however many kilograms, and prices it by the kilogram', () => {
    const sum = summariseCart([
      entry({
        packId: 'tomato:loose',
        productId: 'tomato',
        price: money(4200),
        mrp: money(4600),
        quantity: 1.5,
        loose: true,
      }),
      entry({ packId: 'milk:500ml', quantity: 2 }),
    ]);
    expect(sum.count).toBe(3);
    expect(sum.total).toBe(money(6300 + 5800));
    expect(sum.saved).toBe(money(600));
    expect(sum.baskets[0]?.count).toBe(3);
  });

  it('groups by shop, in the order the shops first appear, and adds the baskets to the cart total', () => {
    const sum = summariseCart([
      entry({ packId: 'milk:500ml', quantity: 1 }),
      entry({
        packId: 'atta:1kg',
        productId: 'atta',
        shopId: 'two',
        shopName: 'Joshi Kirana',
        price: money(5200),
        quantity: 1,
      }),
      entry({ packId: 'curd:400g', productId: 'curd', quantity: 1, price: money(3500) }),
    ]);
    expect(sum.baskets.map((basket) => basket.shopId)).toEqual(['one', 'two']);
    expect(sum.baskets[0]?.total).toBe(money(2900 + 3500));
    expect(sum.baskets[1]?.total).toBe(money(5200));
    expect(sum.total).toBe(money(2900 + 3500 + 5200));
    expect(sum.count).toBe(3);
  });

  it('counts a saving only when the printed price is higher', () => {
    const sum = summariseCart([
      entry({ packId: 'a', quantity: 3, price: money(1000), mrp: money(1000) }),
      entry({ packId: 'b', quantity: 1, price: money(1000) }),
    ]);
    expect(sum.saved).toBe(money(0));
  });
});
