import { describe, expect, it } from 'vitest';
import {
  MAIN_CATEGORIES,
  SECTIONS,
  itemsInCategory,
  mainCategory,
  mainsOfSection,
  subCategory,
  subsWithItems,
} from './catalogueTree';

describe('the catalogue tree', () => {
  it('holds every kind of product in exactly one place', () => {
    const seen = new Map<string, string>();
    for (const main of MAIN_CATEGORIES) {
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

  it('has unique ids and a section for every main category', () => {
    expect(new Set(MAIN_CATEGORIES.map((main) => main.id)).size).toBe(MAIN_CATEGORIES.length);
    for (const main of MAIN_CATEGORIES) {
      expect(SECTIONS.some((section) => section.id === main.section)).toBe(true);
      expect(main.subs.length).toBeGreaterThan(0);
    }
    expect(mainsOfSection('grocery').length + mainsOfSection('snacks').length).toBe(
      MAIN_CATEGORIES.length,
    );
  });

  it('looks a category up by id', () => {
    expect(mainCategory('attaRice')?.subs.map((sub) => sub.id)).toEqual(['atta', 'rice', 'sugar']);
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
