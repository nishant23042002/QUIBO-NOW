import { describe, expect, it } from 'vitest';
import { restoreCart, serialiseCart, type PackLimit } from './cartStore';

const limits = new Map<string, PackLimit>([
  ['milk:500ml', { available: true }],
  ['milk:1l', { available: true, maxQuantity: 3 }],
  ['curd:400g', { available: false }],
  ['eggs:6pcs', { available: true }],
]);

describe('serialiseCart', () => {
  it('keeps the order packs were added in and leaves out empty ones', () => {
    const text = serialiseCart(['eggs:6pcs', 'milk:500ml', 'milk:1l'], {
      'milk:500ml': 2,
      'milk:1l': 0,
      'eggs:6pcs': 1,
    });
    expect(JSON.parse(text)).toEqual({
      v: 1,
      lines: [
        ['eggs:6pcs', 1],
        ['milk:500ml', 2],
      ],
    });
  });
});

describe('restoreCart', () => {
  it('gives back what was saved, in the same order', () => {
    const saved = serialiseCart(['eggs:6pcs', 'milk:500ml'], { 'eggs:6pcs': 1, 'milk:500ml': 4 });
    expect(restoreCart(saved, limits, 20)).toEqual({
      order: ['eggs:6pcs', 'milk:500ml'],
      quantities: { 'eggs:6pcs': 1, 'milk:500ml': 4 },
      gone: 0,
      lowered: 0,
    });
  });

  it('drops a pack that is out of stock or no longer sold, and counts it', () => {
    const saved = serialiseCart(['curd:400g', 'gone:1kg', 'milk:500ml'], {
      'curd:400g': 1,
      'gone:1kg': 2,
      'milk:500ml': 1,
    });
    const restored = restoreCart(saved, limits, 20);
    expect(restored.order).toEqual(['milk:500ml']);
    expect(restored.gone).toBe(2);
  });

  it('lowers a quantity to what is in stock now, and to the most one order may hold', () => {
    const saved = serialiseCart(['milk:1l', 'milk:500ml'], { 'milk:1l': 9, 'milk:500ml': 30 });
    const restored = restoreCart(saved, limits, 20);
    expect(restored.quantities).toEqual({ 'milk:1l': 3, 'milk:500ml': 20 });
    expect(restored.lowered).toBe(2);
    expect(restored.gone).toBe(0);
  });

  it('is an empty cart when nothing, or something unreadable, was saved', () => {
    const empty = { order: [], quantities: {}, gone: 0, lowered: 0 };
    expect(restoreCart(null, limits, 20)).toEqual(empty);
    expect(restoreCart('not json', limits, 20)).toEqual(empty);
    expect(restoreCart('{"v":9,"lines":[["milk:500ml",1]]}', limits, 20)).toEqual(empty);
    expect(restoreCart('[1,2]', limits, 20)).toEqual(empty);
  });

  it('skips damaged lines, repeated packs and quantities that are not whole numbers', () => {
    const saved = JSON.stringify({
      v: 1,
      lines: [
        ['milk:500ml', 1],
        ['milk:500ml', 5],
        ['eggs:6pcs', 1.5],
        ['eggs:6pcs', -1],
        [7, 2],
        'junk',
      ],
    });
    const restored = restoreCart(saved, limits, 20);
    expect(restored.quantities).toEqual({ 'milk:500ml': 1 });
    expect(restored.gone).toBe(0);
  });
});
