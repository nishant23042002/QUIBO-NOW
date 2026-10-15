import type { MessageKey } from '@quibo/i18n';
import type { TileTint } from './categoryGroups';
import type { MainCategoryId } from './catalogueTree';
import type { NeedId } from './needs';

/**
 * The "Right now in Roha" mosaic at the top of Home (ADR 0055): a tall tile and four small ones, each a way into something the town
 * can supply today. A tile opens a category (on Home's own page for it) or a need page. It is data, so a town can change the mosaic
 * without an app release. Sample data until the API supplies it (Phase 2).
 */

export type HeroTarget = { kind: 'category'; id: MainCategoryId } | { kind: 'need'; id: NeedId };

export interface HeroTile {
  id: 'milk' | 'veg' | 'chai' | 'kirana' | 'fruit';
  label: MessageKey;
  /** A second line under the label, for the tall tile only. */
  sub?: MessageKey;
  emoji: string;
  tint: TileTint;
  target: HeroTarget;
  /** The tile shows "from" and the lowest price of this product type. Only the tall tile has one. */
  fromType?: string;
}

/** The tall tile first, then the four small ones in reading order. */
export const HERO_TILES: readonly HeroTile[] = [
  {
    id: 'milk',
    label: 'home.hero.milk',
    sub: 'home.hero.milkSub',
    emoji: '\u{1F95B}',
    tint: 'dairy',
    target: { kind: 'category', id: 'dairyEggs' },
    fromType: 'milk',
  },
  {
    id: 'veg',
    label: 'home.hero.veg',
    emoji: '\u{1F966}',
    tint: 'vegetables',
    target: { kind: 'category', id: 'vegFruit' },
  },
  {
    id: 'chai',
    label: 'home.hero.chai',
    emoji: '\u{2615}',
    tint: 'snacks',
    target: { kind: 'need', id: 'teaBreak' },
  },
  {
    id: 'kirana',
    label: 'home.hero.kirana',
    emoji: '\u{1F33E}',
    tint: 'staples',
    target: { kind: 'category', id: 'attaRice' },
  },
  {
    id: 'fruit',
    label: 'home.hero.fruit',
    emoji: '\u{1F34E}',
    tint: 'fruits',
    target: { kind: 'category', id: 'vegFruit' },
  },
];

/** The lowest price among the items of one product type, in paise, or undefined when the town holds none. */
export function lowestPrice(
  items: readonly { type: string; price: number }[],
  type: string,
): number | undefined {
  let best: number | undefined;
  for (const item of items) {
    if (item.type !== type) continue;
    if (best === undefined || item.price < best) best = item.price;
  }
  return best;
}
