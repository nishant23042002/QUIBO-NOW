import { describe, expect, it } from 'vitest';
import { CATEGORIES } from './catalogueTree';
import { DEPARTMENT_PICTURES, departmentPicture } from './departmentPictures';

describe('the department pictures', () => {
  it('belong only to departments that exist', () => {
    const known = new Set<string>(CATEGORIES.map((entry) => entry.id));
    for (const id of Object.keys(DEPARTMENT_PICTURES)) {
      expect(known.has(id)).toBe(true);
    }
  });

  it('are found by id, and a department without one has none', () => {
    expect(departmentPicture('vegFruit')).toBeDefined();
    expect(departmentPicture('dairyEggs')).toBeDefined();
    expect(departmentPicture('attaRice')).toBeDefined();
    expect(departmentPicture('oilMasala')).toBeDefined();
    expect(departmentPicture('chips')).toBeDefined();
    expect(departmentPicture('biscuits')).toBeDefined();
    expect(departmentPicture('sweets')).toBeDefined();
    expect(departmentPicture('beauty')).toBeUndefined();
    expect(departmentPicture('nope')).toBeUndefined();
  });
});
