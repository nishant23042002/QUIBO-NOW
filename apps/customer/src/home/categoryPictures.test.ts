import { describe, expect, it } from 'vitest';
import { CATEGORIES } from './catalogueTree';
import { CATEGORY_PICTURES, categoryPicture } from './categoryPictures';

describe('the category pictures', () => {
  it('belong only to categories that exist', () => {
    const known = new Set<string>(CATEGORIES.map((entry) => entry.id));
    for (const id of Object.keys(CATEGORY_PICTURES)) {
      expect(known.has(id)).toBe(true);
    }
  });

  it('are found by id, and a category without one has none', () => {
    expect(categoryPicture('vegFruit')).toBeDefined();
    expect(categoryPicture('dairyEggs')).toBeDefined();
    expect(categoryPicture('attaRice')).toBeDefined();
    expect(categoryPicture('oilMasala')).toBeDefined();
    expect(categoryPicture('chips')).toBeDefined();
    expect(categoryPicture('biscuits')).toBeDefined();
    expect(categoryPicture('sweets')).toBeDefined();
    expect(categoryPicture('beauty')).toBeUndefined();
    expect(categoryPicture('nope')).toBeUndefined();
  });
});
