import { describe, expect, it } from 'vitest';
import { flattenMessages } from './check';
import { LOCALES } from './locales';
import { messages } from './messages';
import { translate, type MessageKey } from './translate';

describe('messages', () => {
  it('holds exactly the three launch languages', () => {
    expect(Object.keys(messages).sort()).toEqual([...LOCALES].sort());
  });
});

describe('translate', () => {
  it('finds a nested message in each language', () => {
    expect(translate(messages.en, 'home.title')).toBe(messages.en.home.title);
    expect(translate(messages.hi, 'home.title')).toBe(messages.hi.home.title);
    expect(translate(messages.mr, 'common.retry')).toBe(messages.mr.common.retry);
  });

  it('resolves every message key in every language to a real message, never to the key', () => {
    const keys = Object.keys(flattenMessages(messages.en)) as MessageKey[];
    expect(keys.length).toBeGreaterThan(10);
    for (const locale of LOCALES) {
      for (const key of keys) {
        const text = translate(messages[locale], key);
        expect(text, `${locale}:${key}`).not.toBe(key);
        expect(text.trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  describe('placeholders', () => {
    // No launch message has a placeholder yet, so use a message with some.
    const withPlaceholders = {
      ...messages.en,
      home: { ...messages.en.home, title: 'Hi {name}, {count} items for {name}' },
    };

    it('fills every occurrence of each placeholder', () => {
      expect(translate(withPlaceholders, 'home.title', { name: 'Asha', count: 3 })).toBe(
        'Hi Asha, 3 items for Asha',
      );
    });

    it('leaves a placeholder visible when its value is missing', () => {
      expect(translate(withPlaceholders, 'home.title', { name: 'Asha' })).toBe(
        'Hi Asha, {count} items for Asha',
      );
      expect(translate(withPlaceholders, 'home.title')).toBe('Hi {name}, {count} items for {name}');
    });

    it('accepts zero as a value', () => {
      expect(translate(withPlaceholders, 'home.title', { name: 'A', count: 0 })).toContain(
        '0 items',
      );
    });
  });

  describe('a key that slipped past the types', () => {
    it('returns the key itself when nothing is there', () => {
      expect(translate(messages.en, 'home.nope' as MessageKey)).toBe('home.nope');
      expect(translate(messages.en, 'nope.nope.nope' as MessageKey)).toBe('nope.nope.nope');
    });

    it('returns the key itself when it points at a group, not a message', () => {
      expect(translate(messages.en, 'home' as MessageKey)).toBe('home');
    });
  });

  it('rejects a misspelt key at compile time', () => {
    // @ts-expect-error 'home.titel' is not a message key
    translate(messages.en, 'home.titel');
  });
});
