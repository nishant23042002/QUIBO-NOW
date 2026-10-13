import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  MAIN_CATEGORIES,
  itemsInCategory,
  type Category,
} from './catalogueTree';
import {
  GRID_SIZE,
  RAIL_LIMIT,
  categoriesMatching,
  category,
  categoryIndex,
  categoryRoute,
  gridCategories,
  isLive,
  railCategories,
  resolveCategories,
} from './categoryLists';

/** One item of every kind the catalogue holds. */
const stocked = MAIN_CATEGORIES.flatMap((main) => main.subs.flatMap((sub) => sub.types)).map(
  (type) => ({ id: type, type }),
);

describe('the categories', () => {
  it('have unique ids, each in a group that exists', () => {
    expect(new Set(CATEGORIES.map((entry) => entry.id)).size).toBe(CATEGORIES.length);
    for (const entry of CATEGORIES) {
      expect(CATEGORY_GROUPS.some((group) => group.id === entry.group)).toBe(true);
    }
  });

  it('give every category the catalogue holds kinds, so it has a shelf', () => {
    for (const main of MAIN_CATEGORIES) {
      expect(main.subs.length, main.id).toBeGreaterThan(0);
      expect(isLive(main), main.id).toBe(true);
    }
  });

  it('list a category that is not stocked as soon, holding nothing', () => {
    const coming = CATEGORIES.filter((entry) => !isLive(entry));
    expect(coming.length).toBeGreaterThan(0);
    for (const entry of coming) {
      expect(entry.tag).toBe('soon');
      expect(entry.subs).toEqual([]);
    }
  });

  it('list the live ones first, then those coming', () => {
    const firstSoon = CATEGORIES.findIndex((entry) => !isLive(entry));
    expect(firstSoon).toBe(MAIN_CATEGORIES.length);
    expect(CATEGORIES.slice(firstSoon).every((entry) => !isLive(entry))).toBe(true);
  });

  it('look a category up by id', () => {
    expect(category('dairyEggs')?.subs.map((sub) => sub.id)).toEqual([
      'milk',
      'curd',
      'paneer',
      'eggs',
    ]);
    expect(category('beauty')?.tag).toBe('soon');
    expect(category('nope')).toBeUndefined();
    expect(category(undefined)).toBeUndefined();
  });
});

describe('items in a category', () => {
  const items = [
    { id: 'a', type: 'milk' },
    { id: 'b', type: 'tomato' },
    { id: 'c', type: 'eggs' },
  ];

  it('are those of its kinds, and none for a category not stocked', () => {
    const dairy = category('dairyEggs');
    const beauty = category('beauty');
    expect(dairy && itemsInCategory(items, dairy).map((item) => item.id)).toEqual(['a', 'c']);
    expect(beauty && itemsInCategory(items, beauty)).toEqual([]);
  });

  it('turn a live category with nothing in stock into soon, and change nothing else', () => {
    const resolved = resolveCategories(items);
    const byId = (id: string) => resolved.find((entry) => entry.id === id);
    expect(byId('dairyEggs')?.tag).toBe('today');
    expect(byId('vegFruit')?.tag).toBe('today');
    expect(byId('oilMasala')?.tag).toBe('soon');
    expect(byId('beauty')?.tag).toBe('soon');
    expect(resolved.map((entry) => entry.id)).toEqual(CATEGORIES.map((entry) => entry.id));
  });

  it('keep every live category live when everything is stocked', () => {
    const resolved = resolveCategories(stocked);
    expect(resolved.filter(isLive).length).toBe(CATEGORIES.filter(isLive).length);
  });
});

describe('the header rail', () => {
  it('shows live categories only, up to the limit, with More when there are others', () => {
    const liveCount = CATEGORIES.filter(isLive).length;
    const { shown, more } = railCategories(resolveCategories(stocked));
    expect(shown.every(isLive)).toBe(true);
    expect(shown.length).toBe(Math.min(RAIL_LIMIT, liveCount));
    expect(more).toBe(liveCount > RAIL_LIMIT);
  });

  it('has no More while the live categories fit', () => {
    const fewer = CATEGORIES.filter(isLive).slice(0, RAIL_LIMIT);
    expect(railCategories(fewer).more).toBe(false);
  });

  it('caps at the limit and says there is more', () => {
    const { shown, more } = railCategories(CATEGORIES, 3);
    expect(shown.map((entry) => entry.id)).toEqual(['vegFruit', 'dairyEggs', 'attaRice']);
    expect(more).toBe(true);
    expect(railCategories(CATEGORIES, 20).more).toBe(false);
  });

  it('is empty, not broken, when nothing is stocked', () => {
    expect(railCategories(resolveCategories([]))).toEqual({ shown: [], more: false });
  });

  it('gives every live category a short name for the rail', () => {
    for (const main of MAIN_CATEGORIES) expect(main.rail.length, main.id).toBeGreaterThan(0);
  });
});

describe('Shop by category', () => {
  it('puts live categories first and fills the rest of the grid with those coming', () => {
    const tiles = gridCategories(CATEGORIES);
    expect(tiles.length).toBe(Math.min(GRID_SIZE, CATEGORIES.length));
    const firstSoon = tiles.findIndex((entry) => !isLive(entry));
    expect(firstSoon).toBeGreaterThan(0);
    expect(tiles.slice(firstSoon).every((entry) => !isLive(entry))).toBe(true);
  });

  it('shows fewer tiles when there are fewer categories', () => {
    expect(gridCategories(CATEGORIES.slice(0, 2)).length).toBe(2);
  });
});

describe('the index of all categories', () => {
  it('groups the live categories and lists the rest as coming, leaving out empty groups', () => {
    const { groups, coming } = categoryIndex(CATEGORIES);
    expect(groups.map((entry) => entry.group.id)).toEqual(['grocery', 'snacks']);
    expect(groups.flatMap((entry) => entry.categories).every(isLive)).toBe(true);
    expect(coming.length).toBe(CATEGORIES.filter((entry) => !isLive(entry)).length);
  });

  it('puts a category in its group in the order given', () => {
    const grocery = categoryIndex(CATEGORIES).groups[0];
    expect(grocery?.categories.map((entry) => entry.id)).toEqual([
      'vegFruit',
      'dairyEggs',
      'attaRice',
      'oilMasala',
    ]);
  });
});

describe('where a category opens', () => {
  it('sends a live one to its own screen and one that is coming to its own page', () => {
    const dairy = category('dairyEggs');
    const beauty = category('beauty');
    expect(dairy && categoryRoute(dairy)).toEqual({
      pathname: '/category/[id]',
      params: { id: 'dairyEggs' },
    });
    expect(beauty && categoryRoute(beauty)).toEqual({
      pathname: '/coming/[id]',
      params: { id: 'beauty' },
    });
  });

  it('sends a live category that has gone out of stock to its own page, not an empty shelf', () => {
    const resolved = resolveCategories([]);
    const dairy = resolved.find((entry) => entry.id === 'dairyEggs');
    expect(dairy && categoryRoute(dairy).pathname).toBe('/coming/[id]');
  });
});

describe('finding a category by name', () => {
  const names: Record<string, string> = {
    vegFruit: 'Vegetables & Fruits',
    dairyEggs: 'Dairy & Eggs',
  };
  const nameOf = (entry: Category) => names[entry.id] ?? entry.id;

  it('keeps every category when nothing is typed', () => {
    expect(categoriesMatching(CATEGORIES, '   ', nameOf).length).toBe(CATEGORIES.length);
  });

  it('matches a part of the name, ignoring case and the space round it', () => {
    expect(categoriesMatching(CATEGORIES, ' EGG ', nameOf).map((entry) => entry.id)).toEqual([
      'dairyEggs',
    ]);
    expect(categoriesMatching(CATEGORIES, 'zzz', nameOf)).toEqual([]);
  });

  it('also finds a category by the name of one of its kinds, when asked to', () => {
    const subNameOf = (sub: { id: string }) => sub.id;
    expect(categoriesMatching(CATEGORIES, 'paneer', nameOf).length).toBe(0);
    expect(
      categoriesMatching(CATEGORIES, 'paneer', nameOf, subNameOf).map((entry) => entry.id),
    ).toEqual(['dairyEggs']);
    expect(
      categoriesMatching(CATEGORIES, 'fruits', nameOf, subNameOf).map((entry) => entry.id),
    ).toEqual(['vegFruit']);
  });
});
