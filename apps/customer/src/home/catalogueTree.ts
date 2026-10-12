import type { MessageKey } from '@quibo/i18n';
import type { TileTint } from './categoryGroups';

/**
 * How the shop's catalogue is organised for browsing (the Categories tab, Shop by category and the category screen): a few main
 * categories in two sections, each holding the sub-categories shown in the category screen's left rail. A sub-category is a set of
 * product kinds (an item's `type`: "milk", "tomato"), so a kind is found in exactly one place and a new brand of a kind needs nothing
 * here. Sample data until the catalogue comes from the API (Phase 2).
 */

export type CatalogueSection = 'grocery' | 'snacks';

export type MainCategoryId =
  'vegFruit' | 'dairyEggs' | 'attaRice' | 'oilMasala' | 'chips' | 'biscuits' | 'sweets';

export interface SubCategory {
  id: string;
  label: MessageKey;
  /** A stand-in for the round picture, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  /** The kinds of product it holds. */
  types: readonly string[];
}

export interface MainCategory {
  id: MainCategoryId;
  section: CatalogueSection;
  label: MessageKey;
  emoji: string;
  /** The colour of the category screen's right-hand side and of the tile's picture. */
  tint: TileTint;
  subs: readonly SubCategory[];
}

export const SECTIONS: readonly { id: CatalogueSection; label: MessageKey }[] = [
  { id: 'grocery', label: 'catalogue.sections.grocery' },
  { id: 'snacks', label: 'catalogue.sections.snacks' },
];

export const MAIN_CATEGORIES: readonly MainCategory[] = [
  {
    id: 'vegFruit',
    section: 'grocery',
    label: 'catalogue.mains.vegFruit',
    emoji: '\u{1F96C}',
    tint: 'vegetables',
    subs: [
      {
        id: 'freshVegetables',
        label: 'catalogue.subs.freshVegetables',
        emoji: '\u{1F345}',
        types: ['tomato', 'potato', 'carrot', 'brinjal'],
      },
      {
        id: 'freshFruits',
        label: 'catalogue.subs.freshFruits',
        emoji: '\u{1F34E}',
        types: ['banana', 'apple', 'orange', 'grapes'],
      },
    ],
  },
  {
    id: 'dairyEggs',
    section: 'grocery',
    label: 'catalogue.mains.dairyEggs',
    emoji: '\u{1F95B}',
    tint: 'dairy',
    subs: [
      { id: 'milk', label: 'catalogue.subs.milk', emoji: '\u{1F95B}', types: ['milk'] },
      { id: 'curd', label: 'catalogue.subs.curd', emoji: '\u{1F963}', types: ['curd'] },
      { id: 'paneer', label: 'catalogue.subs.paneer', emoji: '\u{1F9C0}', types: ['paneer'] },
      { id: 'eggs', label: 'catalogue.subs.eggs', emoji: '\u{1F95A}', types: ['eggs'] },
    ],
  },
  {
    id: 'attaRice',
    section: 'grocery',
    label: 'catalogue.mains.attaRice',
    emoji: '\u{1F33E}',
    tint: 'staples',
    subs: [
      { id: 'atta', label: 'catalogue.subs.atta', emoji: '\u{1F33E}', types: ['atta'] },
      { id: 'rice', label: 'catalogue.subs.rice', emoji: '\u{1F35A}', types: ['rice'] },
      { id: 'sugar', label: 'catalogue.subs.sugar', emoji: '\u{1F36C}', types: ['sugar'] },
    ],
  },
  {
    id: 'oilMasala',
    section: 'grocery',
    label: 'catalogue.mains.oilMasala',
    emoji: '\u{1F33B}',
    tint: 'staples',
    subs: [{ id: 'oil', label: 'catalogue.subs.oil', emoji: '\u{1F33B}', types: ['oil'] }],
  },
  {
    id: 'chips',
    section: 'snacks',
    label: 'catalogue.mains.chips',
    emoji: '\u{1F35F}',
    tint: 'snacks',
    subs: [
      { id: 'chips', label: 'catalogue.subs.chips', emoji: '\u{1F35F}', types: ['chips'] },
      { id: 'popcorn', label: 'catalogue.subs.popcorn', emoji: '\u{1F37F}', types: ['popcorn'] },
    ],
  },
  {
    id: 'biscuits',
    section: 'snacks',
    label: 'catalogue.mains.biscuits',
    emoji: '\u{1F36A}',
    tint: 'snacks',
    subs: [
      { id: 'biscuits', label: 'catalogue.subs.biscuits', emoji: '\u{1F36A}', types: ['biscuits'] },
    ],
  },
  {
    id: 'sweets',
    section: 'snacks',
    label: 'catalogue.mains.sweets',
    emoji: '\u{1F36B}',
    tint: 'snacks',
    subs: [
      {
        id: 'chocolates',
        label: 'catalogue.subs.chocolates',
        emoji: '\u{1F36B}',
        types: ['chocolate'],
      },
    ],
  },
];

export function mainCategory(id: string | undefined): MainCategory | undefined {
  return MAIN_CATEGORIES.find((candidate) => candidate.id === id);
}

/** The sub-category of a main category by id, or undefined (which means "All"). */
export function subCategory(main: MainCategory, id: string | undefined): SubCategory | undefined {
  return main.subs.find((candidate) => candidate.id === id);
}

/** The items of one sub-category, or of the whole main category when `sub` is undefined, in the order the sub-categories list them. */
export function itemsInCategory<T extends { type: string }>(
  items: readonly T[],
  main: MainCategory,
  sub?: SubCategory,
): T[] {
  const subs = sub === undefined ? main.subs : [sub];
  return subs.flatMap((entry) => items.filter((item) => entry.types.includes(item.type)));
}

/** The sub-categories of a main category that have at least one item, so the rail never offers an empty shelf. */
export function subsWithItems<T extends { type: string }>(
  items: readonly T[],
  main: MainCategory,
): SubCategory[] {
  return main.subs.filter((sub) => items.some((item) => sub.types.includes(item.type)));
}

/** The main categories of one section, in order. */
export function mainsOfSection(section: CatalogueSection): MainCategory[] {
  return MAIN_CATEGORIES.filter((candidate) => candidate.section === section);
}

/**
 * The category screen a Home row's "See all" (and a featured pick) opens. Home's rows are per broad category; each opens the main
 * category that holds most of it, on the kind that fits when there is one.
 */
export function seeAllTarget(category: 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks'): {
  id: MainCategoryId;
  sub?: string;
} {
  switch (category) {
    case 'dairy':
      return { id: 'dairyEggs' };
    case 'vegetables':
      return { id: 'vegFruit', sub: 'freshVegetables' };
    case 'fruits':
      return { id: 'vegFruit', sub: 'freshFruits' };
    case 'staples':
      return { id: 'attaRice' };
    case 'snacks':
      return { id: 'chips' };
  }
}
