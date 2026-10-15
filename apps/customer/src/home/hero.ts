import type { MessageKey } from '@quibo/i18n';
import type { TileTint } from './categoryGroups';
import type { MainCategoryId } from './catalogueTree';
import type { Need, NeedId } from './needs';

/**
 * The mosaic at the top of Home, "Picks for your routine" (ADR 0055, and the clean-up plan): a tall tile (morning milk, with the
 * lowest price in town) and four small ones, the moments the town can supply today. A tile opens a category (on Home's own page for
 * it) or a moment's page. It is data, so a town can change the mosaic without an app release. Sample data until the API supplies it
 * (Phase 2).
 */

export type HeroTarget = { kind: 'category'; id: MainCategoryId } | { kind: 'need'; id: NeedId };

export interface HeroTile {
  id: 'milk' | NeedId;
  label: MessageKey;
  /** A second line under the label, for the tall tile only. */
  sub?: MessageKey;
  emoji: string;
  tint: TileTint;
  target: HeroTarget;
  /** The tile shows "from" and the lowest price of this product type. Only the tall tile has one. */
  fromType?: string;
}

/** The tall tile: the morning milk. */
const MILK_TILE: HeroTile = {
  id: 'milk',
  label: 'home.hero.milk',
  sub: 'home.hero.milkSub',
  emoji: '\u{1F95B}',
  tint: 'dairy',
  target: { kind: 'category', id: 'dairyEggs' },
  fromType: 'milk',
};

/** Most small tiles the mosaic has room for. */
const SMALL_TILES = 4;

/** The tall tile first, then the moments in reading order, as many as there is room for. */
export function heroTiles(needs: readonly Need[]): HeroTile[] {
  return [
    MILK_TILE,
    ...needs.slice(0, SMALL_TILES).map((entry): HeroTile => ({
      id: entry.id,
      label: entry.label,
      emoji: entry.emoji,
      tint: entry.tint,
      target: { kind: 'need', id: entry.id },
    })),
  ];
}

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
