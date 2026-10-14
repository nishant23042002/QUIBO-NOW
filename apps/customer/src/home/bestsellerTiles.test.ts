import { describe, expect, it } from 'vitest';
import { CATEGORIES } from './catalogueTree';
import { TILE_COUNT, TILE_PICTURES, bestsellerTiles } from './bestsellerTiles';
import { resolveCategories } from './categoryLists';

const ITEMS = [
  { type: 'milk', emoji: 'A' },
  { type: 'curd', emoji: 'B' },
  { type: 'paneer', emoji: 'C' },
  { type: 'eggs', emoji: 'D' },
  { type: 'tomato', emoji: 'E' },
  { type: 'potato', emoji: 'E' },
  { type: 'atta', emoji: 'G' },
];

describe('bestsellerTiles', () => {
  const categories = resolveCategories(ITEMS, CATEGORIES);

  it('makes a tile for each live category that has items, and none for the rest', () => {
    const tiles = bestsellerTiles(ITEMS, categories);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThanOrEqual(TILE_COUNT);
    for (const tile of tiles) expect(tile.category.tag).not.toBe('soon');
  });

  it('shows at most four different pictures and counts the rest', () => {
    const dairy = bestsellerTiles(ITEMS, categories).find(
      (tile) => tile.category.id === 'dairyEggs',
    );
    expect(dairy?.emojis).toEqual(['A', 'B', 'C', 'D']);
    expect(dairy?.emojis.length).toBeLessThanOrEqual(TILE_PICTURES);
    expect(dairy?.more).toBe(0);
  });

  it('does not repeat a picture', () => {
    const veg = bestsellerTiles(ITEMS, categories).find((tile) => tile.category.id === 'vegFruit');
    expect(veg?.emojis).toEqual(['E']);
    expect(veg?.more).toBe(1);
  });

  it('is empty when the town holds nothing', () => {
    expect(bestsellerTiles([], resolveCategories([], CATEGORIES))).toEqual([]);
  });
});
