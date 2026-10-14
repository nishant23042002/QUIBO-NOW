import { itemsInCategory, type Category } from './catalogueTree';
import { isLive } from './categoryLists';

/** One collage tile of "Bestsellers" (ADR 0055, step 3). */
export interface BestsellerTile {
  category: Category;
  /** Up to four pictures from the category's items, each different. */
  emojis: string[];
  /** How many more items the category has than the tile shows. 0 when the tile shows them all. */
  more: number;
}

/** How many pictures a tile shows, and how many tiles the section shows. */
export const TILE_PICTURES = 4;
export const TILE_COUNT = 6;

/**
 * The tiles: the live categories that have items, in the order the town lists them, each with up to four of its pictures and how many
 * more there are. There is no sales data in Phase 1, so "Bestsellers" is the town's own order; the API supplies real ranking later.
 */
export function bestsellerTiles(
  items: readonly { type: string; emoji: string }[],
  categories: readonly Category[],
  limit: number = TILE_COUNT,
): BestsellerTile[] {
  const tiles: BestsellerTile[] = [];
  for (const category of categories) {
    if (!isLive(category)) continue;
    const held = itemsInCategory(items, category);
    if (held.length === 0) continue;
    const emojis = [...new Set(held.map((item) => item.emoji))].slice(0, TILE_PICTURES);
    tiles.push({ category, emojis, more: Math.max(held.length - emojis.length, 0) });
    if (tiles.length === limit) break;
  }
  return tiles;
}
