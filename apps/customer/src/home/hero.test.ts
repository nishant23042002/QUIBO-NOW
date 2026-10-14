import { describe, expect, it } from 'vitest';
import { MAIN_CATEGORIES } from './catalogueTree';
import { HERO_TILES, lowestPrice } from './hero';
import { NEEDS } from './needs';

describe('HERO_TILES', () => {
  it('holds a tall tile and four small ones, each once', () => {
    expect(HERO_TILES).toHaveLength(5);
    expect(new Set(HERO_TILES.map((tile) => tile.id)).size).toBe(5);
  });

  it('only opens categories and needs that exist and are stocked', () => {
    for (const tile of HERO_TILES) {
      if (tile.target.kind === 'category') {
        const id = tile.target.id;
        const found = MAIN_CATEGORIES.find((entry) => entry.id === id);
        expect(found, id).toBeDefined();
        expect(found?.tag, id).not.toBe('soon');
      } else {
        const id = tile.target.id;
        expect(
          NEEDS.some((entry) => entry.id === id),
          id,
        ).toBe(true);
      }
    }
  });

  it('gives only the tall tile a second line and a price', () => {
    const [tall, ...small] = HERO_TILES;
    expect(tall?.sub).toBeDefined();
    expect(tall?.fromType).toBe('milk');
    for (const tile of small) {
      expect(tile.sub).toBeUndefined();
      expect(tile.fromType).toBeUndefined();
    }
  });
});

describe('lowestPrice', () => {
  const items = [
    { type: 'milk', price: 3500 },
    { type: 'milk', price: 2900 },
    { type: 'curd', price: 1200 },
  ];

  it('is the lowest price of that type', () => {
    expect(lowestPrice(items, 'milk')).toBe(2900);
  });

  it('is undefined when the town holds none of the type', () => {
    expect(lowestPrice(items, 'paneer')).toBeUndefined();
    expect(lowestPrice([], 'milk')).toBeUndefined();
  });
});
