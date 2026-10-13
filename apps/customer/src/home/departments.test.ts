import { describe, expect, it } from 'vitest';
import { MAIN_CATEGORIES } from './catalogueTree';
import {
  DEPARTMENTS,
  DEPARTMENT_GROUPS,
  GRID_SIZE,
  NEEDS,
  RAIL_LIMIT,
  department,
  departmentIndex,
  departmentRoute,
  departmentsMatching,
  gridDepartments,
  isLive,
  itemsInDepartment,
  liveNeeds,
  need,
  needBlurb,
  needItems,
  needKinds,
  needSections,
  railDepartments,
  resolveDepartments,
} from './departments';

/** One item of every kind the catalogue holds. */
const stocked = MAIN_CATEGORIES.flatMap((main) => main.subs.flatMap((sub) => sub.types)).map(
  (type) => ({ id: type, type }),
);

describe('the departments', () => {
  it('have unique ids, each in a group that exists', () => {
    expect(new Set(DEPARTMENTS.map((entry) => entry.id)).size).toBe(DEPARTMENTS.length);
    for (const entry of DEPARTMENTS) {
      expect(DEPARTMENT_GROUPS.some((group) => group.id === entry.group)).toBe(true);
    }
  });

  it('hold only main categories the catalogue has, and none holds the same one twice', () => {
    const known = new Set(MAIN_CATEGORIES.map((main) => main.id));
    const seen = new Set<string>();
    for (const entry of DEPARTMENTS) {
      for (const id of entry.mains) {
        expect(known.has(id), `${entry.id} holds ${id}`).toBe(true);
        expect(seen.has(id), `${id} is in two departments`).toBe(false);
        seen.add(id);
      }
    }
  });

  it('give every main category of the catalogue a live department', () => {
    for (const main of MAIN_CATEGORIES) {
      const owner = DEPARTMENTS.find((entry) => entry.mains.includes(main.id));
      expect(owner && isLive(owner), main.id).toBe(true);
    }
  });

  it('list a department that is not stocked as soon, holding nothing', () => {
    const coming = DEPARTMENTS.filter((entry) => !isLive(entry));
    expect(coming.length).toBeGreaterThan(0);
    for (const entry of coming) {
      expect(entry.tag).toBe('soon');
      expect(entry.mains).toEqual([]);
    }
  });

  it('look a department up by id', () => {
    expect(department('dairyEggs')?.mains).toEqual(['dairyEggs']);
    expect(department('nope')).toBeUndefined();
    expect(department(undefined)).toBeUndefined();
  });
});

describe('items in a department', () => {
  const items = [
    { id: 'a', type: 'milk' },
    { id: 'b', type: 'tomato' },
    { id: 'c', type: 'eggs' },
  ];

  it('are those of its main categories, and none for a department not stocked', () => {
    const dairy = department('dairyEggs');
    const beauty = department('beauty');
    expect(dairy && itemsInDepartment(items, dairy).map((item) => item.id)).toEqual(['a', 'c']);
    expect(beauty && itemsInDepartment(items, beauty)).toEqual([]);
  });

  it('turn a live department with nothing in stock into soon, and change nothing else', () => {
    const resolved = resolveDepartments(items);
    const byId = (id: string) => resolved.find((entry) => entry.id === id);
    expect(byId('dairyEggs')?.tag).toBe('today');
    expect(byId('vegFruit')?.tag).toBe('today');
    expect(byId('oilMasala')?.tag).toBe('soon');
    expect(byId('beauty')?.tag).toBe('soon');
    expect(resolved.map((entry) => entry.id)).toEqual(DEPARTMENTS.map((entry) => entry.id));
  });

  it('keep every live department live when everything is stocked', () => {
    const resolved = resolveDepartments(stocked);
    expect(resolved.filter(isLive).length).toBe(DEPARTMENTS.filter(isLive).length);
  });
});

describe('the header rail', () => {
  it('shows live departments only, up to the limit, with More when there are others', () => {
    const liveCount = DEPARTMENTS.filter(isLive).length;
    const { shown, more } = railDepartments(resolveDepartments(stocked));
    expect(shown.every(isLive)).toBe(true);
    expect(shown.length).toBe(Math.min(RAIL_LIMIT, liveCount));
    expect(more).toBe(liveCount > RAIL_LIMIT);
  });

  it('has no More while the live departments fit', () => {
    const fewer = DEPARTMENTS.filter(isLive).slice(0, RAIL_LIMIT);
    expect(railDepartments(fewer).more).toBe(false);
  });

  it('caps at the limit and says there is more', () => {
    const { shown, more } = railDepartments(DEPARTMENTS, 3);
    expect(shown.map((entry) => entry.id)).toEqual(['vegFruit', 'dairyEggs', 'attaRice']);
    expect(more).toBe(true);
    expect(railDepartments(DEPARTMENTS, 20).more).toBe(false);
  });

  it('is empty, not broken, when nothing is stocked', () => {
    expect(railDepartments(resolveDepartments([]))).toEqual({ shown: [], more: false });
  });
});

describe('Shop by department', () => {
  it('puts live departments first and fills the rest of the grid with those coming', () => {
    const tiles = gridDepartments(DEPARTMENTS);
    expect(tiles.length).toBe(Math.min(GRID_SIZE, DEPARTMENTS.length));
    const firstSoon = tiles.findIndex((entry) => !isLive(entry));
    expect(firstSoon).toBeGreaterThan(0);
    expect(tiles.slice(firstSoon).every((entry) => !isLive(entry))).toBe(true);
  });

  it('shows fewer tiles when there are fewer departments', () => {
    expect(gridDepartments(DEPARTMENTS.slice(0, 2)).length).toBe(2);
  });
});

describe('the All departments index', () => {
  it('groups the live departments and lists the rest as coming, leaving out empty groups', () => {
    const { groups, coming } = departmentIndex(DEPARTMENTS);
    expect(groups.map((entry) => entry.group.id)).toEqual(['grocery', 'snacks']);
    expect(groups.flatMap((entry) => entry.departments).every(isLive)).toBe(true);
    expect(coming.length).toBe(DEPARTMENTS.filter((entry) => !isLive(entry)).length);
  });

  it('puts a department in its group in the order given', () => {
    const grocery = departmentIndex(DEPARTMENTS).groups[0];
    expect(grocery?.departments.map((entry) => entry.id)).toEqual([
      'vegFruit',
      'dairyEggs',
      'attaRice',
      'oilMasala',
    ]);
  });
});

describe('the needs', () => {
  it('have unique ids and gather only kinds the catalogue holds', () => {
    expect(new Set(NEEDS.map((entry) => entry.id)).size).toBe(NEEDS.length);
    const kinds = new Set(stocked.map((item) => item.type));
    for (const entry of NEEDS) {
      expect(entry.kinds.length).toBeGreaterThan(0);
      for (const kind of entry.kinds) expect(kinds.has(kind), `${entry.id}: ${kind}`).toBe(true);
    }
  });

  it('list their items in the order of their kinds', () => {
    const tea = need('teaTime');
    const items = [
      { id: 'chips', type: 'chips' },
      { id: 'milk', type: 'milk' },
      { id: 'tomato', type: 'tomato' },
      { id: 'biscuits', type: 'biscuits' },
    ];
    expect(tea && needItems(items, tea).map((item) => item.id)).toEqual([
      'milk',
      'biscuits',
      'chips',
    ]);
    expect(tea && needKinds(items, tea)).toEqual(['milk', 'biscuits', 'chips']);
  });

  it('leave out a need with nothing in stock, so its card is never an empty page', () => {
    expect(liveNeeds([{ id: 'x', type: 'tomato' }]).map((entry) => entry.id)).toEqual([
      'cookingBasics',
    ]);
    expect(liveNeeds([])).toEqual([]);
    expect(need('nope')).toBeUndefined();
  });

  it('are all live when everything is stocked', () => {
    expect(liveNeeds(stocked).length).toBe(NEEDS.length);
  });
});

describe('where a department opens', () => {
  it('sends a live one to its main category and one that is coming to its own page', () => {
    const dairy = department('dairyEggs');
    const beauty = department('beauty');
    expect(dairy && departmentRoute(dairy)).toEqual({
      pathname: '/category/[id]',
      params: { id: 'dairyEggs' },
    });
    expect(beauty && departmentRoute(beauty)).toEqual({
      pathname: '/department/[id]',
      params: { id: 'beauty' },
    });
  });

  it('sends a live department that has gone out of stock to its own page, not an empty shelf', () => {
    const resolved = resolveDepartments([]);
    const dairy = resolved.find((entry) => entry.id === 'dairyEggs');
    expect(dairy && departmentRoute(dairy).pathname).toBe('/department/[id]');
  });
});

describe('finding a department by name', () => {
  const names: Record<string, string> = {
    vegFruit: 'Vegetables & Fruits',
    dairyEggs: 'Dairy & Eggs',
  };
  const nameOf = (entry: { id: string }) => names[entry.id] ?? entry.id;

  it('keeps every department when nothing is typed', () => {
    expect(departmentsMatching(DEPARTMENTS, '   ', nameOf).length).toBe(DEPARTMENTS.length);
  });

  it('matches a part of the name, ignoring case and the space round it', () => {
    expect(departmentsMatching(DEPARTMENTS, ' EGG ', nameOf).map((entry) => entry.id)).toEqual([
      'dairyEggs',
    ]);
    expect(departmentsMatching(DEPARTMENTS, 'zzz', nameOf)).toEqual([]);
  });
});

describe('the shelves of a need', () => {
  const items = [
    { id: 'tomato', type: 'tomato' },
    { id: 'milk', type: 'milk' },
    { id: 'potato', type: 'potato' },
    { id: 'milk2', type: 'milk' },
    { id: 'rice', type: 'rice' },
  ];

  it('group kinds by the sub-category they sit in, in the order the need lists them', () => {
    const basics = need('cookingBasics');
    const sections = basics ? needSections(items, basics) : [];
    // rice (Rice), then tomato and potato together (Fresh Vegetables): atta, oil and sugar have no items so they are left out.
    expect(sections.map((section) => section.id)).toEqual(['rice', 'freshVegetables']);
    expect(sections[1]?.items.map((item) => item.id)).toEqual(['tomato', 'potato']);
  });

  it('keep every brand of a kind in its shelf', () => {
    const breakfast = need('breakfast');
    const sections = breakfast ? needSections(items, breakfast) : [];
    expect(sections.map((section) => section.id)).toEqual(['milk']);
    expect(sections[0]?.items.map((item) => item.id)).toEqual(['milk', 'milk2']);
  });

  it('are empty for a need with nothing in stock', () => {
    const party = need('partySnacks');
    expect(party && needSections(items, party)).toEqual([]);
  });

  it('name the first shelves of a need whatever is in stock', () => {
    const tea = need('teaTime');
    expect(tea && needBlurb(tea)).toEqual([
      'catalogue.subs.milk',
      'catalogue.subs.sugar',
      'catalogue.subs.biscuits',
    ]);
    expect(tea && needBlurb(tea, 1)).toEqual(['catalogue.subs.milk']);
  });
});
