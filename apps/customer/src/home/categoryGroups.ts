import type { ThemeColors } from '@/theme';
import type { ItemCategory } from './items';

/**
 * Where a category tile goes: a main category's own screen (optionally on one of its kinds), Home with a category's tab chosen, or
 * search for a word.
 */
export type TileTarget =
  | { kind: 'main'; id: string; sub?: string }
  | { kind: 'category'; category: ItemCategory }
  | { kind: 'search'; term: string };

/** The colours a tile can sit on: the header's category tints, and the quiet block colour for everything else. */
export type TileTint = 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks' | 'neutral';

/**
 * The screen a tile opens, with a stamp that makes each press new (so choosing the same tile twice still reacts). A category
 * opens Home with that tab chosen; a word opens search for it.
 */
export type TileRoute =
  | { pathname: '/category/[id]'; params: { id: string; sub?: string } }
  | { pathname: '/'; params: { category: ItemCategory; at: string } }
  | { pathname: '/search'; params: { fresh: string; q: string } };

export function tileRoute(target: TileTarget, stamp: string): TileRoute {
  if (target.kind === 'main') {
    return {
      pathname: '/category/[id]',
      params: { id: target.id, ...(target.sub !== undefined ? { sub: target.sub } : {}) },
    };
  }
  return target.kind === 'category'
    ? { pathname: '/', params: { category: target.category, at: stamp } }
    : { pathname: '/search', params: { fresh: stamp, q: target.term } };
}

/** The colour behind a tile's picture, from the theme so it follows light and dark. */
export function tintColor(colors: ThemeColors, tint: TileTint): string {
  switch (tint) {
    case 'dairy':
      return colors.tintDairy;
    case 'vegetables':
      return colors.tintVegetables;
    case 'fruits':
      return colors.tintFruits;
    case 'staples':
      return colors.tintStaples;
    case 'snacks':
      return colors.tintSnacks;
    case 'neutral':
      return colors.muted;
  }
}
