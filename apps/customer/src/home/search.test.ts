import { describe, expect, it } from 'vitest';
import {
  MAX_RECENT,
  addRecent,
  editDistance,
  fold,
  normalise,
  parseRecent,
  searchDocs,
  type SearchDoc,
} from './search';

const DOCS: readonly SearchDoc[] = [
  { id: 'milk', terms: ['Toned milk', 'टोंड दूध', 'dudh', 'doodh'] },
  { id: 'curd', terms: ['Fresh curd', 'ताज़ा दही', 'dahi'] },
  { id: 'atta', terms: ['Wheat flour', 'गेहूँ का आटा', 'atta', 'aata', 'gehu'] },
  { id: 'tomato', terms: ['Tomato', 'टमाटर', 'tamatar'] },
  { id: 'potato', terms: ['Potato', 'आलू', 'aloo', 'batata'] },
  { id: 'chocolate', terms: ['Chocolate', 'चॉकलेट'] },
];

describe('normalise', () => {
  it('lower-cases, drops marks and collapses spaces', () => {
    expect(normalise('  Toned,  MILK! ')).toBe('toned milk');
  });

  it('keeps Devanagari letters and their signs', () => {
    expect(normalise('गेहूँ का आटा')).toBe('गेहूँ का आटा');
  });
});

describe('fold', () => {
  it('makes different English-letter spellings of one sound alike', () => {
    expect(fold('aata')).toBe(fold('atta'));
    expect(fold('doodh')).toBe('dodh');
    expect(fold('phal')).toBe('fal');
    expect(fold('wheat')).toBe('vheat');
  });

  it('leaves Devanagari words alone', () => {
    expect(fold('आटा')).toBe('आटा');
  });
});

describe('editDistance', () => {
  it('counts one swap of neighbours as a single slip', () => {
    expect(editDistance('mlik', 'milk')).toBe(1);
  });

  it('counts adds, removes and exchanges', () => {
    expect(editDistance('milk', 'milks')).toBe(1);
    expect(editDistance('milk', 'mil')).toBe(1);
    expect(editDistance('milk', 'silk')).toBe(1);
    expect(editDistance('dudh', 'dahi')).toBe(3);
  });
});

describe('searchDocs', () => {
  it('finds by the name, whole or half typed', () => {
    expect(searchDocs('milk', DOCS)).toEqual(['milk']);
    expect(searchDocs('tom', DOCS)).toEqual(['tomato']);
  });

  it('finds Hindi and Marathi words typed in English letters', () => {
    expect(searchDocs('dudh', DOCS)).toEqual(['milk']);
    expect(searchDocs('doodh', DOCS)).toEqual(['milk']);
    expect(searchDocs('aata', DOCS)).toEqual(['atta']);
    expect(searchDocs('tamatar', DOCS)).toEqual(['tomato']);
  });

  it('finds words typed in Devanagari', () => {
    expect(searchDocs('दूध', DOCS)).toEqual(['milk']);
    expect(searchDocs('आलू', DOCS)).toEqual(['potato']);
  });

  it('forgives a slip in a longer word', () => {
    expect(searchDocs('mlik', DOCS)).toEqual(['milk']);
    expect(searchDocs('tomatto', DOCS)).toEqual(['tomato']);
    expect(searchDocs('chocolat', DOCS)).toEqual(['chocolate']);
  });

  it('wants short words exact, so "cat" does not find everything', () => {
    expect(searchDocs('cat', DOCS)).toEqual([]);
  });

  it('wants every typed word to match, in any order', () => {
    expect(searchDocs('toned milk', DOCS)).toEqual(['milk']);
    expect(searchDocs('milk toned', DOCS)).toEqual(['milk']);
    expect(searchDocs('milk curd', DOCS)).toEqual([]);
  });

  it('ranks a whole word above a half-typed one', () => {
    const docs: readonly SearchDoc[] = [
      { id: 'longer', terms: ['Chocolate bar'] },
      { id: 'exact', terms: ['Choco'] },
    ];
    expect(searchDocs('choco', docs)).toEqual(['exact', 'longer']);
  });

  it('keeps the given order for equal matches, and finds nothing for nothing', () => {
    const docs: readonly SearchDoc[] = [
      { id: 'a', terms: ['milk'] },
      { id: 'b', terms: ['milk'] },
    ];
    expect(searchDocs('milk', docs)).toEqual(['a', 'b']);
    expect(searchDocs('   ', docs)).toEqual([]);
    expect(searchDocs('', docs)).toEqual([]);
  });
});

describe('recent searches', () => {
  it('puts the newest first and moves a repeat to the front', () => {
    expect(addRecent(['milk', 'atta'], 'bread')).toEqual(['bread', 'milk', 'atta']);
    expect(addRecent(['milk', 'atta'], '  ATTA ')).toEqual(['ATTA', 'milk']);
  });

  it('keeps only the latest few', () => {
    const many = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6'];
    const next = addRecent(many, 'g7');
    expect(next).toHaveLength(MAX_RECENT);
    expect(next[0]).toBe('g7');
    expect(next).not.toContain('f6');
  });

  it('does not remember a search too short to mean anything', () => {
    expect(addRecent(['milk'], 'm')).toEqual(['milk']);
    expect(addRecent(['milk'], '   ')).toEqual(['milk']);
  });

  it('reads a saved list back, and an unreadable one as empty', () => {
    expect(parseRecent('["milk","atta"]')).toEqual(['milk', 'atta']);
    expect(parseRecent(null)).toEqual([]);
    expect(parseRecent('not json')).toEqual([]);
    expect(parseRecent('{"a":1}')).toEqual([]);
    expect(parseRecent('["milk", 3, "", null]')).toEqual(['milk']);
  });
});
