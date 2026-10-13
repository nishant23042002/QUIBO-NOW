import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  MAIN_CATEGORIES,
  itemsInCategory,
  mainCategory,
  mainsOfGroup,
  subCategory,
  subsWithItems,
} from './catalogueTree';

describe('the catalogue tree', () => {
  it('holds every kind of product in exactly one place', () => {
    const seen = new Map<string, string>();
    for (const main of CATEGORIES) {
      for (const sub of main.subs) {
        for (const type of sub.types) {
          expect(seen.has(type), `${type} is in ${seen.get(type) ?? ''} and ${main.id}`).toBe(
            false,
          );
          seen.set(type, main.id);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  it('has unique ids and a group for every category', () => {
    expect(new Set(CATEGORIES.map((entry) => entry.id)).size).toBe(CATEGORIES.length);
    for (const entry of CATEGORIES) {
      expect(CATEGORY_GROUPS.some((group) => group.id === entry.group)).toBe(true);
    }
    for (const main of MAIN_CATEGORIES) expect(main.subs.length).toBeGreaterThan(0);
    const inGroups = CATEGORY_GROUPS.reduce((sum, group) => sum + mainsOfGroup(group.id).length, 0);
    expect(inGroups).toBe(MAIN_CATEGORIES.length);
  });

  it('looks a category up by id', () => {
    expect(mainCategory('attaRice')?.subs.map((sub) => sub.id)).toEqual([
      'atta',
      'rice',
      'dal',
      'sugar',
    ]);
    expect(mainCategory('beauty')).toBeUndefined();
    expect(mainCategory('nope')).toBeUndefined();
    expect(mainCategory(undefined)).toBeUndefined();
    const dairy = mainCategory('dairyEggs');
    expect(dairy && subCategory(dairy, 'eggs')?.id).toBe('eggs');
    expect(dairy && subCategory(dairy, undefined)).toBeUndefined();
  });
});

describe('items in a category', () => {
  const items = [
    { id: 'milk', type: 'milk' },
    { id: 'tomato', type: 'tomato' },
    { id: 'milkGokul', type: 'milk' },
    { id: 'eggs', type: 'eggs' },
    { id: 'apple', type: 'apple' },
  ];
  const dairy = mainCategory('dairyEggs');
  const vegFruit = mainCategory('vegFruit');

  it('lists a whole main category in the order of its sub-categories', () => {
    if (dairy === undefined) throw new Error('missing');
    expect(itemsInCategory(items, dairy).map((item) => item.id)).toEqual([
      'milk',
      'milkGokul',
      'eggs',
    ]);
  });

  it('lists one sub-category', () => {
    if (vegFruit === undefined) throw new Error('missing');
    const fruits = subCategory(vegFruit, 'freshFruits');
    expect(itemsInCategory(items, vegFruit, fruits).map((item) => item.id)).toEqual(['apple']);
  });

  it('offers only the sub-categories that have items', () => {
    if (dairy === undefined) throw new Error('missing');
    expect(subsWithItems(items, dairy).map((sub) => sub.id)).toEqual(['milk', 'eggs']);
  });
});

describe('kinds that are listed before they are stocked', () => {
  const oil = mainCategory('oilMasala');
  const atta = mainCategory('attaRice');

  it('are in the tree, but offered only once an item of their type exists', () => {
    if (oil === undefined) throw new Error('missing');
    expect(oil.subs.map((sub) => sub.id)).toEqual(['oil', 'ghee', 'masala']);
    expect(subsWithItems([{ id: 'o', type: 'oil' }], oil).map((sub) => sub.id)).toEqual(['oil']);
    const stocked = [
      { id: 'o', type: 'oil' },
      { id: 'g', type: 'ghee' },
      { id: 'm', type: 'masala' },
    ];
    expect(subsWithItems(stocked, oil).map((sub) => sub.id)).toEqual(['oil', 'ghee', 'masala']);
  });

  it('keep salt with sugar, and dal with its own kind', () => {
    if (atta === undefined) throw new Error('missing');
    const items = [
      { id: 's', type: 'salt' },
      { id: 'd', type: 'dal' },
    ];
    expect(subsWithItems(items, atta).map((sub) => sub.id)).toEqual(['dal', 'sugar']);
  });
});
