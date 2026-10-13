import {
  CATEGORIES,
  CATEGORY_GROUPS,
  itemsInCategory,
  type Category,
  type CategoryGroup,
  type SubCategory,
} from './catalogueTree';

/**
 * What the rail, the grid and the index do with the list of categories (ADR 0044, ADR 0046). The list itself lives in
 * `catalogueTree.ts`: a category is live (it has kinds) or soon (listed, holding nothing), and these helpers sort them for each
 * place that shows them.
 */

/** The most categories the header rail shows before "More". */
export const RAIL_LIMIT = 6;
/** The tiles of "Shop by category" before "All categories". */
export const GRID_SIZE = 8;

export function category(id: string | undefined): Category | undefined {
  return CATEGORIES.find((candidate) => candidate.id === id);
}

export function isLive(entry: Category): boolean {
  return entry.tag !== 'soon';
}

/**
 * The categories as the shopper should see them: one with nothing in stock reads "soon" whatever the town says, so no category opens
 * onto an empty shelf. Order is kept.
 */
export function resolveCategories<T extends { type: string }>(
  items: readonly T[],
  categories: readonly Category[] = CATEGORIES,
): Category[] {
  return categories.map((entry) =>
    entry.tag !== 'soon' && itemsInCategory(items, entry).length === 0
      ? { ...entry, tag: 'soon' }
      : entry,
  );
}

/** What the header rail shows: up to `limit` live categories, and whether there are more behind "More". */
export function railCategories(
  categories: readonly Category[],
  limit: number = RAIL_LIMIT,
): { shown: Category[]; more: boolean } {
  const liveOnes = categories.filter(isLive);
  return { shown: liveOnes.slice(0, limit), more: liveOnes.length > limit };
}

/**
 * The tiles of "Shop by category": live ones first, then the ones that are coming to fill the grid, up to `size`. The last tile of a
 * grid that does not show everything is "All categories", which the screen adds.
 */
export function gridCategories(
  categories: readonly Category[],
  size: number = GRID_SIZE,
): Category[] {
  return [...categories.filter(isLive), ...categories.filter((entry) => !isLive(entry))].slice(
    0,
    size,
  );
}

/** The full list: the live categories in their groups (a group with none is left out), then those coming. */
export function categoryIndex(categories: readonly Category[]): {
  groups: { group: CategoryGroup; categories: Category[] }[];
  coming: Category[];
} {
  const groups = CATEGORY_GROUPS.map((group) => ({
    group,
    categories: categories.filter((entry) => entry.group === group.id && isLive(entry)),
  })).filter((entry) => entry.categories.length > 0);
  return { groups, coming: categories.filter((entry) => !isLive(entry)) };
}

/** Where a category's tile goes: a live one opens its own screen, one that is coming opens its "Coming to Roha" page. */
export type CategoryRoute =
  | { pathname: '/category/[id]'; params: { id: string } }
  | { pathname: '/department/[id]'; params: { id: string } };

export function categoryRoute(target: Category): CategoryRoute {
  return isLive(target) && target.subs.length > 0
    ? { pathname: '/category/[id]', params: { id: target.id } }
    : { pathname: '/department/[id]', params: { id: target.id } };
}

/**
 * The categories whose name contains what was typed (ignoring case and the space round it), in their order. Nothing typed keeps them
 * all. `nameOf` gives a category's name in the chosen language. With `subNameOf`, a category also matches when one of its kinds does
 * ("paneer" finds Dairy & Eggs).
 */
export function categoriesMatching(
  categories: readonly Category[],
  query: string,
  nameOf: (entry: Category) => string,
  subNameOf?: (sub: SubCategory) => string,
): Category[] {
  const wanted = query.trim().toLowerCase();
  if (wanted === '') return [...categories];
  const has = (name: string) => name.toLowerCase().includes(wanted);
  return categories.filter(
    (entry) =>
      has(nameOf(entry)) ||
      (subNameOf !== undefined && entry.subs.some((sub) => has(subNameOf(sub)))),
  );
}
