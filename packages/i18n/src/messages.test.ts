import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import hi from '../messages/hi.json';
import mr from '../messages/mr.json';
import { diffKeys, flattenMessages, placeholderNames } from './check';
import { DEFAULT_LOCALE, LOCALES, isLocale, messages, type Locale } from './index';

const files = { en, hi, mr } satisfies Record<Locale, unknown>;
const flat = {
  en: flattenMessages(en),
  hi: flattenMessages(hi),
  mr: flattenMessages(mr),
} satisfies Record<Locale, Record<string, string>>;

const OTHER_LOCALES = LOCALES.filter((l) => l !== 'en');

/** Keys that are meant to read the same in every language. */
const SAME_IN_EVERY_LANGUAGE = new Set(['app.name', 'language.en']);

describe('locales', () => {
  it('are English, Hindi and Marathi, with English as the default', () => {
    expect([...LOCALES]).toEqual(['en', 'hi', 'mr']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('have exactly one message file each, and no stray files', () => {
    const onDisk = readdirSync(new URL('../messages', import.meta.url)).sort();
    expect(onDisk).toEqual(LOCALES.map((l) => `${l}.json`).sort());
  });

  it('are recognised by isLocale', () => {
    for (const locale of LOCALES) expect(isLocale(locale)).toBe(true);
    for (const bad of ['EN', 'fr', '', 'en-IN', null, undefined, 1]) {
      expect(isLocale(bad)).toBe(false);
    }
  });

  it('are each in messages under their own code', () => {
    for (const locale of LOCALES) expect(messages[locale]).toEqual(files[locale]);
  });
});

describe('message completeness', () => {
  it.each(OTHER_LOCALES)('%s has every key English has, and no others', (locale) => {
    expect(diffKeys(flat.en, flat[locale])).toEqual({ missing: [], extra: [] });
  });

  it.each(LOCALES)('%s has no empty messages', (locale) => {
    const empty = Object.entries(flat[locale])
      .filter(([, text]) => text.trim() === '')
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it.each(OTHER_LOCALES)(
    '%s uses the same {placeholders} as English in every message',
    (locale) => {
      const mismatched = Object.entries(flat.en)
        .filter(([key, text]) => {
          const translated = flat[locale][key];
          return (
            translated === undefined ||
            placeholderNames(text).join() !== placeholderNames(translated).join()
          );
        })
        .map(([key]) => key);
      expect(mismatched).toEqual([]);
    },
  );

  it.each(OTHER_LOCALES)(
    '%s is written in Devanagari, except the brand name and the English language name',
    (locale) => {
      const notDevanagari = Object.entries(flat[locale])
        .filter(([key]) => !SAME_IN_EVERY_LANGUAGE.has(key))
        .filter(([, text]) => !/\p{Script=Devanagari}/u.test(text))
        .map(([key]) => key);
      expect(notDevanagari).toEqual([]);
    },
  );

  it('keeps the brand name and the language endonyms identical everywhere', () => {
    for (const key of ['app.name', 'language.en', 'language.hi', 'language.mr']) {
      expect(flat.hi[key]).toBe(flat.en[key]);
      expect(flat.mr[key]).toBe(flat.en[key]);
    }
  });
});

describe('copy rules (CLAUDE.md)', () => {
  // We promise a delivery window, never ten minutes.
  const TEN_MINUTE_COPY = [
    /\b10\s*-?\s*min/i,
    /\bten\s*-?\s*minute/i,
    /(10|१०|दस)\s*मिनट/,
    /(10|१०|दहा)\s*मिनिट/,
  ];

  it.each(LOCALES)('%s contains no 10-minute promise', (locale) => {
    const offending = Object.entries(flat[locale])
      .filter(([, text]) => TEN_MINUTE_COPY.some((pattern) => pattern.test(text)))
      .map(([key]) => key);
    expect(offending).toEqual([]);
  });
});

describe('the checks themselves', () => {
  const reference = { 'a.one': 'One', 'a.two': 'Two {name}', 'b.three': 'Three' };

  it('report a missing key', () => {
    const candidate = { 'a.one': 'Ek', 'b.three': 'Teen' };
    expect(diffKeys(reference, candidate)).toEqual({ missing: ['a.two'], extra: [] });
  });

  it('report an extra key', () => {
    const candidate = { ...reference, 'c.four': 'Char' };
    expect(diffKeys(reference, candidate)).toEqual({ missing: [], extra: ['c.four'] });
  });

  it('flatten nested messages and reject non-string leaves', () => {
    expect(flattenMessages({ a: { b: 'x' }, c: 'y' })).toEqual({ 'a.b': 'x', c: 'y' });
    expect(() => flattenMessages({ a: 1 })).toThrow(TypeError);
    expect(() => flattenMessages({ a: ['x'] })).toThrow(TypeError);
    expect(() => flattenMessages({ a: null })).toThrow(TypeError);
  });

  it('find placeholders, including an ICU plural argument', () => {
    expect(placeholderNames('Hello')).toEqual([]);
    expect(placeholderNames('Hi {name}, order {id}')).toEqual(['id', 'name']);
    expect(placeholderNames('{count, plural, one {# item} other {# items}}')).toEqual(['count']);
  });
});
