import type { MessageKey } from '@quibo/i18n';
import {
  MAIN_CATEGORIES,
  itemsInCategory,
  mainCategory,
  type MainCategoryId,
} from './catalogueTree';
import type { TileTint } from './categoryGroups';

/**
 * The departments and needs Home is organised by (ADR 0044). Both are data: a town lists the departments it serves and the needs it
 * offers, so adding one is a change to this list (a record per town once the API exists) and not a change to the app. Sample data
 * until the catalogue comes from the API (Phase 2).
 *
 * - A **department** is a shelf of the shop: the header rail, the "Shop by department" grid and the All departments screen show it.
 *   A live department holds catalogue main categories; one that is not stocked yet is listed as Soon and holds nothing.
 * - A **need** cuts across departments ("Tea time" is milk, sugar, biscuits and chips): a list of product kinds, not a department.
 */

/** When a department's items arrive: today, tomorrow, or not yet stocked. Never a number of minutes (ADR 0012). */
export type DepartmentTag = 'today' | 'tomorrow' | 'soon';

export type DepartmentGroupId = 'grocery' | 'snacks' | 'care' | 'tech' | 'style';

export type DepartmentId =
  | MainCategoryId
  | 'beauty'
  | 'babyCare'
  | 'gym'
  | 'electronics'
  | 'kids'
  | 'gaming'
  | 'jewellery'
  | 'decor'
  | 'automotive';

export interface Department {
  id: DepartmentId;
  group: DepartmentGroupId;
  /** What the shop says about when it arrives. A department with no stock is shown as "soon" whatever it says here. */
  tag: DepartmentTag;
  label: MessageKey;
  /** The short name the header rail has room for ("Dairy" for "Dairy & Eggs"). */
  rail: MessageKey;
  /** A stand-in for the picture, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  tint: TileTint;
  /** The catalogue's main categories it holds, in order. Empty for a department that is not stocked yet. */
  mains: readonly MainCategoryId[];
}

export interface DepartmentGroup {
  id: DepartmentGroupId;
  label: MessageKey;
}

export type NeedId = 'breakfast' | 'teaTime' | 'partySnacks' | 'cookingBasics';

export interface Need {
  id: NeedId;
  label: MessageKey;
  emoji: string;
  tint: TileTint;
  /** The product kinds (an item's `type`) it gathers, in the order its page lists them. */
  kinds: readonly string[];
}

/** The most departments the header rail shows before "More". */
export const RAIL_LIMIT = 6;
/** The tiles of "Shop by department" before "All departments". */
export const GRID_SIZE = 8;

export const DEPARTMENT_GROUPS: readonly DepartmentGroup[] = [
  { id: 'grocery', label: 'catalogue.sections.grocery' },
  { id: 'snacks', label: 'catalogue.sections.snacks' },
  { id: 'care', label: 'departments.groups.care' },
  { id: 'tech', label: 'departments.groups.tech' },
  { id: 'style', label: 'departments.groups.style' },
];

const live = (
  id: MainCategoryId,
  group: DepartmentGroupId,
  emoji: string,
  tint: TileTint,
  tag: DepartmentTag = 'today',
): Department => ({
  id,
  group,
  tag,
  label: `catalogue.mains.${id}`,
  rail: `departments.rail.${id}`,
  emoji,
  tint,
  mains: [id],
});

const soon = (
  id: Exclude<DepartmentId, MainCategoryId>,
  group: DepartmentGroupId,
  emoji: string,
): Department => ({
  id,
  group,
  tag: 'soon',
  label: `departments.soon.${id}`,
  rail: `departments.soon.${id}`,
  emoji,
  tint: 'neutral',
  mains: [],
});

/** In the order the rail, the grid and the index show them: what the town stocks first, then what is coming. */
export const DEPARTMENTS: readonly Department[] = [
  live('vegFruit', 'grocery', '\u{1F96C}', 'vegetables'),
  live('dairyEggs', 'grocery', '\u{1F95B}', 'dairy'),
  live('attaRice', 'grocery', '\u{1F33E}', 'staples'),
  live('oilMasala', 'grocery', '\u{1F33B}', 'staples'),
  live('chips', 'snacks', '\u{1F35F}', 'snacks'),
  live('biscuits', 'snacks', '\u{1F36A}', 'snacks'),
  live('sweets', 'snacks', '\u{1F36B}', 'snacks'),
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

/** Made only of kinds the catalogue holds today, so no need page is empty. */
export const NEEDS: readonly Need[] = [
  {
    id: 'breakfast',
    label: 'departments.needs.breakfast',
    emoji: '\u{1F373}',
    tint: 'dairy',
    kinds: ['milk', 'eggs', 'atta', 'sugar', 'oil'],
  },
  {
    id: 'teaTime',
    label: 'departments.needs.teaTime',
    emoji: '\u{2615}',
    tint: 'snacks',
    kinds: ['milk', 'sugar', 'biscuits', 'chips'],
  },
  {
    id: 'partySnacks',
    label: 'departments.needs.partySnacks',
    emoji: '\u{1F389}',
    tint: 'snacks',
    kinds: ['chips', 'popcorn', 'chocolate', 'biscuits'],
  },
  {
    id: 'cookingBasics',
    label: 'departments.needs.cookingBasics',
    emoji: '\u{1F958}',
    tint: 'staples',
    kinds: ['atta', 'rice', 'oil', 'sugar', 'tomato', 'potato'],
  },
];

export function department(id: string | undefined): Department | undefined {
  return DEPARTMENTS.find((candidate) => candidate.id === id);
}

export function need(id: string | undefined): Need | undefined {
  return NEEDS.find((candidate) => candidate.id === id);
}

/** The items of a department, in the order of its main categories. A department that is not stocked has none. */
export function itemsInDepartment<T extends { type: string }>(
  items: readonly T[],
  target: Department,
): T[] {
  return target.mains.flatMap((id) => {
    const main = mainCategory(id);
    return main === undefined ? [] : itemsInCategory(items, main);
  });
}

/**
 * The departments as the shopper should see them: one with nothing in stock reads "soon" whatever the town says, so no department
 * opens onto an empty shelf. Order is kept.
 */
export function resolveDepartments<T extends { type: string }>(
  items: readonly T[],
  departments: readonly Department[] = DEPARTMENTS,
): Department[] {
  return departments.map((entry) =>
    entry.tag !== 'soon' && itemsInDepartment(items, entry).length === 0
      ? { ...entry, tag: 'soon' }
      : entry,
  );
}

export function isLive(entry: Department): boolean {
  return entry.tag !== 'soon';
}

/** What the header rail shows: up to `limit` live departments, and whether there are more behind "More". */
export function railDepartments(
  departments: readonly Department[],
  limit: number = RAIL_LIMIT,
): { shown: Department[]; more: boolean } {
  const liveOnes = departments.filter(isLive);
  return { shown: liveOnes.slice(0, limit), more: liveOnes.length > limit };
}

/**
 * The tiles of "Shop by department": live ones first, then the ones that are coming to fill the grid, up to `size`. The last tile of
 * a grid that does not show everything is "All departments", which the screen adds.
 */
export function gridDepartments(
  departments: readonly Department[],
  size: number = GRID_SIZE,
): Department[] {
  return [...departments.filter(isLive), ...departments.filter((entry) => !isLive(entry))].slice(
    0,
    size,
  );
}

/** The All departments screen: the live departments in their groups (a group with none is left out), then those coming. */
export function departmentIndex(departments: readonly Department[]): {
  groups: { group: DepartmentGroup; departments: Department[] }[];
  coming: Department[];
} {
  const groups = DEPARTMENT_GROUPS.map((group) => ({
    group,
    departments: departments.filter((entry) => entry.group === group.id && isLive(entry)),
  })).filter((entry) => entry.departments.length > 0);
  return { groups, coming: departments.filter((entry) => !isLive(entry)) };
}

/** The items of a need, in the order of its kinds. */
export function needItems<T extends { type: string }>(items: readonly T[], target: Need): T[] {
  return target.kinds.flatMap((kind) => items.filter((item) => item.type === kind));
}

/** The kinds of a need that have at least one item, so its page never offers an empty tab. */
export function needKinds<T extends { type: string }>(items: readonly T[], target: Need): string[] {
  return target.kinds.filter((kind) => items.some((item) => item.type === kind));
}

/** The needs worth showing: those with at least one item. */
export function liveNeeds<T extends { type: string }>(
  items: readonly T[],
  needs: readonly Need[] = NEEDS,
): Need[] {
  return needs.filter((entry) => needKinds(items, entry).length > 0);
}

/** Where a department's tile goes: a live one opens its main category's screen, one that is coming opens its "Coming to Roha" page. */
export type DepartmentRoute =
  | { pathname: '/category/[id]'; params: { id: string } }
  | { pathname: '/department/[id]'; params: { id: string } };

export function departmentRoute(target: Department): DepartmentRoute {
  const main = target.mains[0];
  return isLive(target) && main !== undefined
    ? { pathname: '/category/[id]', params: { id: main } }
    : { pathname: '/department/[id]', params: { id: target.id } };
}

/**
 * The departments whose name contains what was typed (ignoring case and the space round it), in their order. Nothing typed keeps them
 * all. `nameOf` gives a department's name in the chosen language.
 */
export function departmentsMatching(
  departments: readonly Department[],
  query: string,
  nameOf: (entry: Department) => string,
): Department[] {
  const wanted = query.trim().toLowerCase();
  if (wanted === '') return [...departments];
  return departments.filter((entry) => nameOf(entry).toLowerCase().includes(wanted));
}

/** One shelf of a need's page: a sub-category of the catalogue, with the items of the need's kinds that sit in it. */
export interface NeedSection<T> {
  /** The sub-category's id. */
  id: string;
  label: MessageKey;
  emoji: string;
  items: T[];
}

interface SectionDraft {
  id: string;
  label: MessageKey;
  emoji: string;
  kinds: string[];
}

/** The sub-categories a need's kinds sit in, in the order the kinds list them, each with the kinds of the need it holds. */
function needDrafts(target: Need): SectionDraft[] {
  const drafts: SectionDraft[] = [];
  for (const kind of target.kinds) {
    const subs = MAIN_CATEGORIES.flatMap((main) => main.subs);
    const sub = subs.find((candidate) => candidate.types.includes(kind));
    if (sub === undefined) continue;
    const existing = drafts.find((draft) => draft.id === sub.id);
    if (existing === undefined) {
      drafts.push({ id: sub.id, label: sub.label, emoji: sub.emoji, kinds: [kind] });
    } else {
      existing.kinds.push(kind);
    }
  }
  return drafts;
}

/**
 * The shelves of a need's page: its kinds grouped by the sub-category they sit in ("Fresh Vegetables" holds tomato and potato), in
 * the order the need lists them, each with its items. A shelf with nothing in stock is left out.
 */
export function needSections<T extends { type: string }>(
  items: readonly T[],
  target: Need,
): NeedSection<T>[] {
  return needDrafts(target)
    .map((draft) => ({
      id: draft.id,
      label: draft.label,
      emoji: draft.emoji,
      items: draft.kinds.flatMap((kind) => items.filter((item) => item.type === kind)),
    }))
    .filter((section) => section.items.length > 0);
}

/** The names (message keys) of the first few shelves of a need, for the line on its card on Home, whatever is in stock. */
export function needBlurb(target: Need, count = 3): MessageKey[] {
  return needDrafts(target)
    .slice(0, count)
    .map((draft) => draft.label);
}
