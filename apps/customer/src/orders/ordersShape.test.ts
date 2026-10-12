import { describe, expect, it } from 'vitest';
import { ORDERS_SKELETON_MAX, ordersShape } from './ordersShape';

const order = (items: number, shops: string[] = ['Shree Dairy']) => ({
  items: Array.from({ length: items }, () => ({})),
  shops: shops.map((name) => ({ name })),
});

describe('ordersShape', () => {
  it('is the empty page when there are no orders at all', () => {
    expect(ordersShape([], [], true)).toEqual({ kind: 'empty' });
  });

  it('is the dashed note when there are orders but none under the chosen filter', () => {
    expect(ordersShape([order(2)], [], true)).toEqual({ kind: 'none' });
  });

  it('draws a card for each order shown, up to three, with the filter deciding the outline', () => {
    const shown = [order(1), order(2), order(3), order(4)];
    const shape = ordersShape(shown, shown, true);
    expect(shape.kind).toBe('cards');
    if (shape.kind !== 'cards') return;
    expect(shape.cards).toHaveLength(ORDERS_SKELETON_MAX);
    expect(shape.cards.every((card) => card.active)).toBe(true);
    const past = ordersShape(shown, shown, false);
    if (past.kind === 'cards') expect(past.cards.every((card) => !card.active)).toBe(true);
  });

  it('counts the pictures a card shows and whether a plus tile follows', () => {
    const shown = [order(2), order(4), order(9)];
    const shape = ordersShape(shown, shown, true);
    if (shape.kind !== 'cards') throw new Error('expected cards');
    expect(shape.cards.map((card) => card.thumbs)).toEqual([2, 4, 4]);
    expect(shape.cards.map((card) => card.more)).toEqual([false, false, true]);
  });

  it('takes the length of the shops line from the shop names', () => {
    const shown = [order(1, ['Shree Dairy', 'Patil Kirana'])];
    const shape = ordersShape(shown, shown, true);
    if (shape.kind !== 'cards') throw new Error('expected cards');
    expect(shape.cards[0]?.shopLetters).toBe('Shree Dairy, Patil Kirana'.length);
  });
});
