import { describe, expect, it } from 'vitest';
import { VIEWED_MOST, forgetItem, parseViewed, viewItem, viewedItems } from './viewed';

describe('viewItem', () => {
  it('puts the newest first', () => {
    expect(viewItem(['milk', 'eggs'], 'atta')).toEqual(['atta', 'milk', 'eggs']);
  });

  it('moves something seen before to the front instead of listing it twice', () => {
    expect(viewItem(['milk', 'eggs', 'atta'], 'atta')).toEqual(['atta', 'milk', 'eggs']);
  });

  it('keeps only the newest few', () => {
    const many = Array.from({ length: VIEWED_MOST }, (_, i) => `p${i}`);
    const next = viewItem(many, 'new');
    expect(next).toHaveLength(VIEWED_MOST);
    expect(next[0]).toBe('new');
    expect(next).not.toContain(`p${VIEWED_MOST - 1}`);
  });
});

describe('forgetItem', () => {
  it('takes one out', () => {
    expect(forgetItem(['milk', 'eggs'], 'milk')).toEqual(['eggs']);
  });
});

describe('parseViewed', () => {
  it('reads back what was saved', () => {
    expect(parseViewed('["milk","eggs"]')).toEqual(['milk', 'eggs']);
  });

  it('treats nothing, rubbish and the wrong shape as nothing saved', () => {
    expect(parseViewed(null)).toEqual([]);
    expect(parseViewed('{oops')).toEqual([]);
    expect(parseViewed('{"a":1}')).toEqual([]);
  });

  it('drops entries that are not text, empty or repeated', () => {
    expect(parseViewed('["milk",3,"","milk",null,"eggs"]')).toEqual(['milk', 'eggs']);
  });
});

describe('viewedItems', () => {
  const catalogue = [
    { id: 'milk' },
    { id: 'eggs', stock: { kind: 'out' as const } },
    { id: 'atta', stock: { kind: 'low' as const } },
  ];

  it('keeps the order saved, leaves out what is gone or out of stock, keeps what is low', () => {
    expect(viewedItems(['atta', 'eggs', 'ghost', 'milk'], catalogue).map((i) => i.id)).toEqual([
      'atta',
      'milk',
    ]);
  });
});
