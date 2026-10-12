import type { MessageKey } from '@quibo/i18n';
import type { ThemeColors } from '@/theme';
import type { ItemCategory } from './items';

/**
 * Where a category tile goes. The five main categories open Home with that tab chosen; a finer tile (Atta, Curd, Soap) opens
 * search for its word, because the sample items only carry five categories.
 */
export type TileTarget =
  { kind: 'category'; category: ItemCategory } | { kind: 'search'; term: string };

/** The colours a tile can sit on: the header's category tints, and the quiet block colour for everything else. */
export type TileTint = 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks' | 'neutral';

export interface CategoryTileSample {
  /** The words under the picture. */
  label: MessageKey;
  /** A stand-in for the picture, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  tint: TileTint;
  target: TileTarget;
}

export interface CategoryGroupSample {
  /** The group's title, which carries on in a dotted line like every row title. */
  title: MessageKey;
  tiles: readonly CategoryTileSample[];
}

const category = (value: ItemCategory): TileTarget => ({ kind: 'category', category: value });
const search = (term: string): TileTarget => ({ kind: 'search', term });

/**
 * The grouped tiles of the Categories tab, until the mock API supplies them (Phase 1b). The words are in the message files.
 * Each group is a short row of up to six tiles; the screen lays them four across.
 */
export const CATEGORY_GROUPS: readonly CategoryGroupSample[] = [
  {
    title: 'categoriesTab.groups.market',
    tiles: [
      {
        label: 'categoriesTab.tiles.dailyVegetables',
        emoji: '\u{1F345}',
        tint: 'vegetables',
        target: category('vegetables'),
      },
      {
        label: 'categoriesTab.tiles.potatoOnion',
        emoji: '\u{1F954}',
        tint: 'vegetables',
        target: search('potato'),
      },
      {
        label: 'categoriesTab.tiles.fruits',
        emoji: '\u{1F34E}',
        tint: 'fruits',
        target: category('fruits'),
      },
      {
        label: 'categoriesTab.tiles.rootsLeaves',
        emoji: '\u{1F955}',
        tint: 'vegetables',
        target: search('carrot'),
      },
    ],
  },
  {
    title: 'categoriesTab.groups.dairy',
    tiles: [
      {
        label: 'categoriesTab.tiles.milk',
        emoji: '\u{1F95B}',
        tint: 'dairy',
        target: search('milk'),
      },
      {
        label: 'categoriesTab.tiles.curd',
        emoji: '\u{1F963}',
        tint: 'dairy',
        target: search('curd'),
      },
      {
        label: 'categoriesTab.tiles.paneer',
        emoji: '\u{1F9C0}',
        tint: 'dairy',
        target: search('paneer'),
      },
      {
        label: 'categoriesTab.tiles.eggs',
        emoji: '\u{1F95A}',
        tint: 'dairy',
        target: search('eggs'),
      },
      {
        label: 'categoriesTab.tiles.butterGhee',
        emoji: '\u{1F36F}',
        tint: 'dairy',
        target: search('ghee'),
      },
    ],
  },
  {
    title: 'categoriesTab.groups.staples',
    tiles: [
      {
        label: 'categoriesTab.tiles.atta',
        emoji: '\u{1F33E}',
        tint: 'staples',
        target: search('atta'),
      },
      {
        label: 'categoriesTab.tiles.rice',
        emoji: '\u{1F35A}',
        tint: 'staples',
        target: search('rice'),
      },
      {
        label: 'categoriesTab.tiles.cookingOil',
        emoji: '\u{1F373}',
        tint: 'staples',
        target: search('oil'),
      },
      {
        label: 'categoriesTab.tiles.dal',
        emoji: '\u{1F330}',
        tint: 'staples',
        target: search('dal'),
      },
      {
        label: 'categoriesTab.tiles.masala',
        emoji: '\u{1F336}',
        tint: 'staples',
        target: search('masala'),
      },
      {
        label: 'categoriesTab.tiles.sugarSalt',
        emoji: '\u{1F36C}',
        tint: 'staples',
        target: search('sugar'),
      },
    ],
  },
  {
    title: 'categoriesTab.groups.snacks',
    tiles: [
      {
        label: 'categoriesTab.tiles.chips',
        emoji: '\u{1F37F}',
        tint: 'snacks',
        target: search('chips'),
      },
      {
        label: 'categoriesTab.tiles.biscuits',
        emoji: '\u{1F36A}',
        tint: 'snacks',
        target: search('biscuits'),
      },
      {
        label: 'categoriesTab.tiles.sweets',
        emoji: '\u{1F369}',
        tint: 'snacks',
        target: search('sweets'),
      },
      {
        label: 'categoriesTab.tiles.teaCoffee',
        emoji: '☕',
        tint: 'neutral',
        target: search('tea'),
      },
      {
        label: 'categoriesTab.tiles.instant',
        emoji: '\u{1F35C}',
        tint: 'snacks',
        target: search('noodles'),
      },
      {
        label: 'categoriesTab.tiles.coldDrinks',
        emoji: '\u{1F964}',
        tint: 'neutral',
        target: search('cold drink'),
      },
    ],
  },
  {
    title: 'categoriesTab.groups.home',
    tiles: [
      {
        label: 'categoriesTab.tiles.soap',
        emoji: '\u{1F6C1}',
        tint: 'neutral',
        target: search('soap'),
      },
      {
        label: 'categoriesTab.tiles.cleaning',
        emoji: '\u{1F6BF}',
        tint: 'neutral',
        target: search('cleaner'),
      },
      {
        label: 'categoriesTab.tiles.kitchenNeeds',
        emoji: '\u{1F374}',
        tint: 'neutral',
        target: search('kitchen'),
      },
      {
        label: 'categoriesTab.tiles.pooja',
        emoji: '\u{1F549}',
        tint: 'fruits',
        target: search('pooja'),
      },
    ],
  },
];

/** The eight tiles under "Shop by category" on Home, until the mock API supplies them (Phase 1b). Two rows of four. */
export const HOME_CATEGORY_TILES: readonly CategoryTileSample[] = [
  {
    label: 'home.shopByCategory.tiles.milkCurd',
    emoji: '\u{1F95B}',
    tint: 'dairy',
    target: category('dairy'),
  },
  {
    label: 'home.shopByCategory.tiles.eggsPaneer',
    emoji: '\u{1F95A}',
    tint: 'dairy',
    target: search('eggs'),
  },
  {
    label: 'home.shopByCategory.tiles.vegetables',
    emoji: '\u{1F955}',
    tint: 'vegetables',
    target: category('vegetables'),
  },
  {
    label: 'home.shopByCategory.tiles.fruits',
    emoji: '\u{1F34E}',
    tint: 'fruits',
    target: category('fruits'),
  },
  {
    label: 'home.shopByCategory.tiles.attaRice',
    emoji: '\u{1F33E}',
    tint: 'staples',
    target: search('atta'),
  },
  {
    label: 'home.shopByCategory.tiles.oilMasala',
    emoji: '\u{1F336}',
    tint: 'staples',
    target: search('oil'),
  },
  {
    label: 'home.shopByCategory.tiles.snacksBiscuits',
    emoji: '\u{1F36A}',
    tint: 'snacks',
    target: category('snacks'),
  },
  {
    label: 'home.shopByCategory.tiles.teaMore',
    emoji: '☕',
    tint: 'neutral',
    target: search('tea'),
  },
];

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
