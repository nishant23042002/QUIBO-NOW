import { messages } from '@quibo/i18n';
import { describe, expect, it } from 'vitest';
import { FEATURED } from './featuredPicks';

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

describe('the featured picks', () => {
  it('are a few, each with a place to go', () => {
    expect(FEATURED.length).toBeGreaterThanOrEqual(2);
    expect(FEATURED.length).toBeLessThanOrEqual(5);
    for (const pick of FEATURED) {
      expect(pick.emoji.length).toBeGreaterThan(0);
      if (pick.target.kind === 'search') expect(pick.target.term.trim().length).toBeGreaterThan(0);
    }
  });

  it('never repeat a title', () => {
    const titles = FEATURED.map((pick) => pick.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('are worded in English, Hindi and Marathi', () => {
    for (const language of LANGUAGES) {
      for (const pick of FEATURED) {
        for (const key of [pick.title, pick.body, 'home.featured.title', 'home.quieterNote']) {
          const words = lookup(messages[language], key);
          expect(typeof words, `${language}: ${key}`).toBe('string');
          expect((words as string).length).toBeGreaterThan(0);
        }
      }
    }
  });
});
