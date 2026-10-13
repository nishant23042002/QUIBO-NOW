import { messages } from '@quibo/i18n';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_GROUPS, MAIN_CATEGORIES, seeAllTarget } from './catalogueTree';
import { tileRoute } from './categoryGroups';

const LANGUAGES = ['en', 'hi', 'mr'] as const;

/** Looks a dotted key up in a message tree. */
function lookup(tree: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        typeof node === 'object' && node !== null
          ? (node as Record<string, unknown>)[part]
          : undefined,
      tree,
    );
}

describe('the words of the catalogue tree', () => {
  it('has every group, category, rail name and kind worded in English, Hindi and Marathi', () => {
    const keys = [
      ...CATEGORY_GROUPS.map((group) => group.label),
      ...CATEGORIES.flatMap((entry) => [
        entry.label,
        entry.rail,
        ...entry.subs.map((sub) => sub.label),
      ]),
    ];
    for (const language of LANGUAGES) {
      for (const key of keys) {
        const words = lookup(messages[language], key);
        expect(typeof words, `${language}: ${key}`).toBe('string');
        expect((words as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every main category and kind a picture', () => {
    for (const main of MAIN_CATEGORIES) {
      expect(main.emoji.length).toBeGreaterThan(0);
      for (const sub of main.subs) expect(sub.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe('where a tile goes', () => {
  it('opens a main category on its own screen, optionally on one of its kinds', () => {
    expect(tileRoute({ kind: 'main', id: 'dairyEggs' }, '1')).toEqual({
      pathname: '/category/[id]',
      params: { id: 'dairyEggs' },
    });
    expect(tileRoute({ kind: 'main', id: 'vegFruit', sub: 'freshFruits' }, '1')).toEqual({
      pathname: '/category/[id]',
      params: { id: 'vegFruit', sub: 'freshFruits' },
    });
  });

  it('opens Home on a category, with the press stamped', () => {
    expect(tileRoute({ kind: 'category', category: 'dairy' }, '7')).toEqual({
      pathname: '/',
      params: { category: 'dairy', at: '7' },
    });
  });

  it('opens search holding the tile word, with the press stamped', () => {
    expect(tileRoute({ kind: 'search', term: 'atta' }, '9')).toEqual({
      pathname: '/search',
      params: { fresh: '9', q: 'atta' },
    });
  });
});

describe('where a Home row\'s "See all" goes', () => {
  it('opens a category that exists, and a kind that exists in it', () => {
    for (const category of ['dairy', 'vegetables', 'fruits', 'staples', 'snacks'] as const) {
      const target = seeAllTarget(category);
      const main = MAIN_CATEGORIES.find((candidate) => candidate.id === target.id);
      expect(main, category).toBeDefined();
      if (target.sub !== undefined) {
        expect(
          main?.subs.some((sub) => sub.id === target.sub),
          category,
        ).toBe(true);
      }
    }
  });
});
