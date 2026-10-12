import { messages } from '@quibo/i18n';
import { describe, expect, it } from 'vitest';
import { CATEGORY_GROUPS, HOME_CATEGORY_TILES, type CategoryTileSample } from './categoryGroups';

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

const ALL_TILES: readonly CategoryTileSample[] = [
  ...CATEGORY_GROUPS.flatMap((group) => group.tiles),
  ...HOME_CATEGORY_TILES,
];

describe('the Categories tab groups', () => {
  it('has groups with a few tiles each, so a group never grows into a long list', () => {
    expect(CATEGORY_GROUPS.length).toBeGreaterThanOrEqual(4);
    for (const group of CATEGORY_GROUPS) {
      expect(group.tiles.length).toBeGreaterThanOrEqual(3);
      expect(group.tiles.length).toBeLessThanOrEqual(6);
    }
  });

  it('never repeats a title or a tile label', () => {
    const titles = CATEGORY_GROUPS.map((group) => group.title);
    expect(new Set(titles).size).toBe(titles.length);
    const labels = CATEGORY_GROUPS.flatMap((group) => group.tiles.map((tile) => tile.label));
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('Home category tiles', () => {
  it('is two full rows of four', () => {
    expect(HOME_CATEGORY_TILES).toHaveLength(8);
  });
});

describe('every tile', () => {
  it('has a picture and somewhere to go', () => {
    for (const tile of ALL_TILES) {
      expect(tile.emoji.length).toBeGreaterThan(0);
      if (tile.target.kind === 'search') expect(tile.target.term.trim().length).toBeGreaterThan(0);
    }
  });

  it('is worded in English, Hindi and Marathi', () => {
    const keys = [
      ...CATEGORY_GROUPS.map((group) => group.title),
      ...ALL_TILES.map((tile) => tile.label),
    ];
    for (const language of LANGUAGES) {
      for (const key of keys) {
        const words = lookup(messages[language], key);
        expect(typeof words, `${language}: ${key}`).toBe('string');
        expect((words as string).length).toBeGreaterThan(0);
      }
    }
  });
});
