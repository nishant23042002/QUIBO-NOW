import type { MessageKey } from '@quibo/i18n';
import type { TileTint } from './categoryGroups';

/**
 * How the shop's catalogue is organised for browsing (the Categories tab, Shop by category, the header rail and the category
 * screen): a few categories in groups, each holding the kinds shown in the category screen's left rail. A kind is a set of product
 * types (an item's `type`: "milk", "tomato"), so a type is found in exactly one place and a new brand of a kind needs nothing here.
 *
 * A category is either **live** (it has kinds, and the town stocks it) or **soon** (listed with a tag, with no kinds, and opening a
 * "Coming to Roha" page). Both are the same shape, so adding Gaming is a data change and not an app release (ADR 0044, ADR 0046).
 * Sample data until the catalogue comes from the API (Phase 2).
 */

/** The groups the Categories tab and the header rail's index sort categories into. */
export type CategoryGroupId = 'grocery' | 'snacks' | 'care' | 'tech' | 'style';

export type MainCategoryId =
  'vegFruit' | 'dairyEggs' | 'attaRice' | 'oilMasala' | 'chips' | 'biscuits' | 'sweets';

/** The categories that are listed but not stocked yet. */
export type SoonCategoryId =
  | 'beauty'
  | 'babyCare'
  | 'gym'
  | 'electronics'
  | 'kids'
  | 'gaming'
  | 'jewellery'
  | 'decor'
  | 'automotive';

export type CategoryId = MainCategoryId | SoonCategoryId;

/** When a category's items arrive: today, tomorrow, or not yet stocked. Never a number of minutes (ADR 0012). */
export type CategoryTag = 'today' | 'tomorrow' | 'soon';

export interface SubCategory {
  id: string;
  label: MessageKey;
  /** A stand-in for the round picture, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  /** The kinds of product it holds. */
  types: readonly string[];
}

export interface Category {
  id: CategoryId;
  group: CategoryGroupId;
  /** What the shop says about when it arrives. A category with no stock is shown as "soon" whatever it says here. */
  tag: CategoryTag;
  label: MessageKey;
  /** The short name the header rail has room for ("Dairy" for "Dairy & Eggs"). */
  rail: MessageKey;
  /** A stand-in for the picture, until real artwork exists. */
  emoji: string;
  /** The colour of the category screen's right-hand side and of the tile's picture. */
  tint: TileTint;
  /** Its kinds, in order. Empty for a category that is not stocked yet. */
  subs: readonly SubCategory[];
}

/** A category the catalogue holds today: it has kinds and its own screen. */
export interface MainCategory extends Category {
  id: MainCategoryId;
}

export interface CategoryGroup {
  id: CategoryGroupId;
  label: MessageKey;
}

export const CATEGORY_GROUPS: readonly CategoryGroup[] = [
  { id: 'grocery', label: 'catalogue.sections.grocery' },
  { id: 'snacks', label: 'catalogue.sections.snacks' },
  { id: 'care', label: 'departments.groups.care' },
  { id: 'tech', label: 'departments.groups.tech' },
  { id: 'style', label: 'departments.groups.style' },
];

const live = (
  id: MainCategoryId,
  group: CategoryGroupId,
  emoji: string,
  tint: TileTint,
  subs: readonly SubCategory[],
): MainCategory => ({
  id,
  group,
  tag: 'today',
  label: `catalogue.mains.${id}`,
  rail: `departments.rail.${id}`,
  emoji,
  tint,
  subs,
});

const soon = (id: SoonCategoryId, group: CategoryGroupId, emoji: string): Category => ({
  id,
  group,
  tag: 'soon',
  label: `departments.soon.${id}`,
  rail: `departments.soon.${id}`,
  emoji,
  tint: 'neutral',
  subs: [],
});

/** The categories the catalogue holds today, in the order the rail, the grid and the index show them. */
export const MAIN_CATEGORIES: readonly MainCategory[] = [
  live('vegFruit', 'grocery', '\u{1F96C}', 'vegetables', [
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
  ]),
  live('dairyEggs', 'grocery', '\u{1F95B}', 'dairy', [
    { id: 'milk', label: 'catalogue.subs.milk', emoji: '\u{1F95B}', types: ['milk'] },
    { id: 'curd', label: 'catalogue.subs.curd', emoji: '\u{1F963}', types: ['curd'] },
    { id: 'paneer', label: 'catalogue.subs.paneer', emoji: '\u{1F9C0}', types: ['paneer'] },
    { id: 'eggs', label: 'catalogue.subs.eggs', emoji: '\u{1F95A}', types: ['eggs'] },
  ]),
  live('attaRice', 'grocery', '\u{1F33E}', 'staples', [
    { id: 'atta', label: 'catalogue.subs.atta', emoji: '\u{1F33E}', types: ['atta'] },
    { id: 'rice', label: 'catalogue.subs.rice', emoji: '\u{1F35A}', types: ['rice'] },
    { id: 'sugar', label: 'catalogue.subs.sugar', emoji: '\u{1F36C}', types: ['sugar'] },
  ]),
  live('oilMasala', 'grocery', '\u{1F33B}', 'staples', [
    { id: 'oil', label: 'catalogue.subs.oil', emoji: '\u{1F33B}', types: ['oil'] },
  ]),
  live('chips', 'snacks', '\u{1F35F}', 'snacks', [
    { id: 'chips', label: 'catalogue.subs.chips', emoji: '\u{1F35F}', types: ['chips'] },
    { id: 'popcorn', label: 'catalogue.subs.popcorn', emoji: '\u{1F37F}', types: ['popcorn'] },
  ]),
  live('biscuits', 'snacks', '\u{1F36A}', 'snacks', [
    { id: 'biscuits', label: 'catalogue.subs.biscuits', emoji: '\u{1F36A}', types: ['biscuits'] },
  ]),
  live('sweets', 'snacks', '\u{1F36B}', 'snacks', [
    {
      id: 'chocolates',
      label: 'catalogue.subs.chocolates',
      emoji: '\u{1F36B}',
      types: ['chocolate'],
    },
  ]),
];

/** Listed with a Soon tag and no kinds: they open a "Coming to Roha" page, never an empty shelf. */
const SOON_CATEGORIES: readonly Category[] = [
  soon('beauty', 'care', '\u{1F484}'),
  soon('babyCare', 'care', '\u{1F37C}'),
  soon('gym', 'care', '\u{1F4AA}'),
  soon('electronics', 'tech', '\u{1F50C}'),
  soon('kids', 'tech', '\u{1F9F8}'),
  soon('gaming', 'tech', '\u{1F3AE}'),
  soon('jewellery', 'style', '\u{1F48D}'),
  soon('decor', 'style', '\u{1F3EE}'),
  soon('automotive', 'style', '\u{1F697}'),
];

/** Every category, in the order the rail, the grid and the index show them: what the town stocks first, then what is coming. */
export const CATEGORIES: readonly Category[] = [...MAIN_CATEGORIES, ...SOON_CATEGORIES];

export function mainCategory(id: string | undefined): MainCategory | undefined {
  return MAIN_CATEGORIES.find((candidate) => candidate.id === id);
}

/** The sub-category of a category by id, or undefined (which means "All"). */
export function subCategory(main: Category, id: string | undefined): SubCategory | undefined {
  return main.subs.find((candidate) => candidate.id === id);
}

/**
 * The items of one sub-category, or of the whole category when `sub` is undefined, in the order the sub-categories list them. A
 * category that is not stocked has no sub-categories, so it has no items.
 */
export function itemsInCategory<T extends { type: string }>(
  items: readonly T[],
  main: Category,
  sub?: SubCategory,
): T[] {
  const subs = sub === undefined ? main.subs : [sub];
  return subs.flatMap((entry) => items.filter((item) => entry.types.includes(item.type)));
}

/** The sub-categories of a category that have at least one item, so the rail never offers an empty shelf. */
export function subsWithItems<T extends { type: string }>(
  items: readonly T[],
  main: Category,
): SubCategory[] {
  return main.subs.filter((sub) => items.some((item) => sub.types.includes(item.type)));
}

/** The live categories of one group, in order. */
export function mainsOfGroup(group: CategoryGroupId): MainCategory[] {
  return MAIN_CATEGORIES.filter((candidate) => candidate.group === group);
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
